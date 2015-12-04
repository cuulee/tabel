import knex from 'knex';
import KRedis from 'kredis';
import {merge, isString} from 'lodash';

import Table from './Table';
import migrator from './migrator';
import Util from './util/Util';

export default class Orm {
  constructor(config) {
    if ('db' in config) {
      this.knex = knex(config.db);
    } else {
      throw new Error(`no 'db' config found`);
    }

    if ('redis' in config) {
      this.redis = new KRedis(config.redis);
    }

    // tables definitions
    this.tableClasses = new Map();

    // tables instances
    this.tables = new Map();

    // tableColumns cache
    this.tableColumns = new Map();

    // migrator
    this.migrator = migrator(this);

    // util
    this.util = new Util(this);
  }

  // raw expr helper
  raw(expr) {
    return knex.raw(expr);
  }

  // transaction helper
  transaction(promiseFn) {
    return this.knex.transaction(promiseFn);
  }

  // transaction shorthand
  // usage:
  // return orm.trx((t) => {
  //   return orm('users', t).save([{}, {}, {}]);
  // }).then((users) => {
  //    ...
  // });
  trx(promiseFn) {
    let outerResult;

    return this.transaction((t) => {
      return promiseFn(t).then((result) => {
        return t.commit().then(() => {
          outerResult = result;
          return result;
        });
      }).catch((e) => {
        t.rollback();
        throw e;
      });
    }).then(() => outerResult);
  }

  // method to close the database
  close() {
    const promises = [this.knex.destroy()];

    if (this.redis) {
      promises.push(this.redis.disconnect());
    }

    return Promise.all(promises);
  }

  // here, we load the columns of all the tables that have been
  // defined via the orm, and return a promise on completion
  // cos, if people wanna do that before starting the server
  // let em do that
  load() {
    return Promise.all(
      Array.from(this.tables.keys).map((name) => this.table(name).load())
    );
  }

  // get a tableClass
  tableClass(tableName) {
    return this.tableClasses.get(tableName);
  }

  // get a table object
  table(tableName, trx=null) {
    const tbl = this.tables.get(tableName).fork();

    if (trx !== null) {
      tbl.transacting(trx);
    }

    return tbl;
  }

  // shorthand for table
  tbl(tableName, trx=null) {
    return this.table(tableName, trx);
  }

  defineTable(params={}) {
    const tableName = params.name;

    if (! isString(tableName)) {
      throw new Error(`Invalid table-name: ${tableName} supplied via key 'name'`);
    }

    if (this.tableClasses.has(tableName)) {
      throw new Error(`Table '${tableName}' already defined`);
    }

    this.tableClasses.set(tableName, this.newTableClass(params));
    this.instantitateTable(tableName, params);
    return this;
  }

  extendTable(tableName, {scopes={}, joints={}, relations={}, methods={}}) {
    if (! this.tableClasses.has(tableName)) {
      throw new Error(`Table '${tableName}' not defined yet`);
    }

    const TableClass = this.tableClass(tableName);
    const ExtendedTableClass = class extends TableClass {};

    this.attachScopesToTableClass(ExtendedTableClass, scopes);
    this.attachJointsToTableClass(ExtendedTableClass, joints);
    this.attachRelationsToTableClass(ExtendedTableClass, relations);
    this.attachMethodsToTableClass(ExtendedTableClass, methods);

    this.tableClasses.set(tableName, ExtendedTableClass);
    this.instantitateTable(tableName);
    return this;
  }

  instantitateTable(tableName) {
    const TableClass = this.tableClasses.get(tableName);

    return this.tables.set(tableName, new TableClass(this));
  }

  newTableClass(params) {
    return this.extendTableClass(Table, params);
  }

  extendTableClass(TableClass, params) {
    const {name, props, processors, scopes, joints, relations, methods} = merge(
      // the defaults
      {
        // the table's name, is required
        name: null,

        // table properties
        props: {
          key: 'id',
          // default key column, can be ['user_id', 'post_id'] for composite keys
          autoId: false,
          // by default we don't assume that you use an auto generated db id
          perPage: 25,
          // standard batch size per page used by `forPage` method
          // forPage method uses offset
          // avoid that and use a keyset in prod (http://use-the-index-luke.com/no-offset)
          timestamps: false
          // set to `true` if you want auto timestamps or
          // timestamps: ['created_at', 'updated_at'] (these are defaults when `true`)
          // will be assigned in this order only
        },

        // used to process model and collection results fetched from the db
        // override as you need to
        processors: {
          model(row) { return row; },
          collection(rows) { return rows; }
        },

        // predefined scopes on the table
        scopes: {},
        // predefined joints on the table
        joints: {},
        // relations definitions for the table
        relations: {},
        // table methods defintions
        methods: {}
      },
      // supplied params which will override the defaults
      params
    );

    // the extended table class whose objects will behave as needed
    const ExtendedTableClass = class extends TableClass {};

    // assign name to the table class
    ExtendedTableClass.prototype.name = name;

    // assign props to the table class
    ExtendedTableClass.prototype.props = props;

    // assign processors to the table class
    ExtendedTableClass.prototype.processors = processors;

    // store names of defined scopes, joints, relations, and methods
    ExtendedTableClass.prototype.definedScopes = new Set();
    ExtendedTableClass.prototype.definedJoints = new Set();
    ExtendedTableClass.prototype.definedRelations = new Set();
    ExtendedTableClass.prototype.definedMethods = new Set();

    // attach scopes, joints, relations and methods to tables
    // these are the only ones extendable after creation
    this.attachScopesToTableClass(ExtendedTableClass, scopes);
    this.attachJointsToTableClass(ExtendedTableClass, joints);
    this.attachRelationsToTableClass(ExtendedTableClass, relations);
    this.attachMethodsToTableClass(ExtendedTableClass, methods);

    // return the extended table class
    return ExtendedTableClass;
  }

  attachScopesToTableClass(TableClass, scopes) {
    // keep a record of defined scopes
    Object.keys(scopes).forEach((name) => {
      TableClass.prototype.definedScopes.add(name);
    });

    // process and merge scopes with table class
    merge(
      TableClass.prototype,
      Object.keys(scopes).reduce((processed, name) => {
        return merge(processed, {
          [name](...args) {
            scopes[name].apply(this, args);
            // set the label of the last pushed scope
            this.scopeTrack.relabelLastScope(name);
            return this;
          }
        });
      }, {})
    );
  }

  attachJointsToTableClass(TableClass, joints) {
    // keep a record of defined joints
    Object.keys(joints).forEach((name) => {
      TableClass.prototype.definedJoints.add(name);
    });

    // process and merge joints with table class
    merge(
      TableClass.prototype,
      Object.keys(joints).reduce((processed, name) => {
        // predefined joints never take arguments
        return merge(processed, {
          [name]() {
            if (this.scopeTrack.hasJoint(name)) {
              return this;
            } else {
              joints[name].call(this);
              // set the label of the last pushed scope
              this.scopeTrack.relabelLastScope(name);
              // ensure that the last scope is a joint
              this.scopeTrack.convertLastScopeToJoint();
              return this;
            }
          }
        });
      }, {})
    );
  }

  attachRelationsToTableClass(TableClass, relations) {
    // keep a record of defined relations
    Object.keys(relations).forEach((name) => {
      TableClass.prototype.definedRelations.add(name);
    });

    // process and merge relations with table class
    merge(
      TableClass.prototype,
      Object.keys(relations).reduce((processed, name) => {
        // const relation = relations[name];
        return merge(processed, {
          [name](model) {
            if (model) {
              return relations[name].bind(this)().setName(name).forModel(model);
            } else {
              return relations[name].bind(this)().setName(name);
            }
          }
        });
      }, {})
    );
  }

  attachMethodsToTableClass(TableClass, methods) {
    // keep a record of defined methods
    Object.keys(methods).forEach((name) => {
      TableClass.prototype.definedMethods.add(name);
    });

    // process and merge relations with table class
    merge(
      TableClass.prototype,
      Object.keys(methods).reduce((processed, name) => {
        return merge(processed, {[name]: methods[name]});
      }, {})
    );
  }
}