'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _Relation2 = require('./Relation');

var _Relation3 = _interopRequireDefault(_Relation2);

var HasMany = (function (_Relation) {
  _inherits(HasMany, _Relation);

  function HasMany(fromTable, toTable, foreignKey, key) {
    _classCallCheck(this, HasMany);

    _get(Object.getPrototypeOf(HasMany.prototype), 'constructor', this).call(this);
    (0, _lodash.assign)(this, { fromTable: fromTable, toTable: toTable, foreignKey: foreignKey, key: key });
  }

  _createClass(HasMany, [{
    key: 'initRelation',
    value: function initRelation(fromModels) {
      var _this = this;

      return fromModels.map(function (m) {
        return (0, _lodash.assign)(m, _defineProperty({}, _this.relationName, []));
      });
    }
  }, {
    key: 'getRelated',
    value: function getRelated() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length === 0) {
        if (this.activeModel !== null) {
          return this.getRelated([this.activeModel]);
        } else {
          return Promise.resolve([]);
        }
      }

      var fromModels = args[0];
      var toTable = this.toTable;
      var foreignKey = this.foreignKey;
      var key = this.key;

      return toTable.fork().whereIn(foreignKey, fromModels.map(function (m) {
        return m[key];
      })).all();
    }
  }, {
    key: 'matchModels',
    value: function matchModels() {
      var fromModels = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var relatedModels = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var relationName = this.relationName;
      var foreignKey = this.foreignKey;
      var key = this.key;

      var keyDict = relatedModels.reduce(function (dict, m) {
        var key = m[foreignKey];

        if (!(0, _lodash.isArray)(dict[key])) {
          return (0, _lodash.assign)(dict, _defineProperty({}, key, [m]));
        } else {
          return (0, _lodash.assign)(dict, _defineProperty({}, key, dict[key].concat(m)));
        }
      }, {});

      return fromModels.map(function (m) {
        return (0, _lodash.assign)(m, _defineProperty({}, relationName, keyDict[m[key]]));
      });
    }
  }, {
    key: 'insert',
    value: function insert() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (args.length === 0) {
        throw new Error('bad method call');
      }

      if (args.length === 1) {
        return this.insert.apply(this, [this.activeModel].concat(args));
      }

      var fromModel = args[0];
      var values = args[1];

      return this.toTable.insert((function () {
        if ((0, _lodash.isArray)(values)) {
          return values.map(function (v) {
            return (0, _lodash.assign)(v, _defineProperty({}, _this2.foreignKey, fromModel[_this2.key]));
          });
        } else {
          return (0, _lodash.assign)(values, _defineProperty({}, _this2.foreignKey, fromModel[_this2.key]));
        }
      })());
    }
  }, {
    key: 'update',
    value: function update() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (args.length === 0) {
        throw new Error('bad method call');
      }

      if (args.length === 1) {
        return this.update.apply(this, [this.activeModel].concat(args));
      }

      var fromModel = args[0];
      var values = args[1];

      return this.constraints.apply(this.toTable.fork()).where(this.foreignKey, fromModel[this.key]).update((0, _lodash.assign)(values, _defineProperty({}, this.foreignKey, fromModel[this.key])));
    }
  }, {
    key: 'del',
    value: function del() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (args.length === 0) {
        return this.del(this.activeModel);
      }

      var fromModel = args[0];

      return this.constraints.apply(this.toTable.fork()).where(this.foreignKey, fromModel[this.key]).del();
    }
  }, {
    key: 'join',
    value: function join(tableContext) {
      var joiner = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
      var label = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      label = this.jointLabel(label, {});
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var foreignKey = this.foreignKey;
      var key = this.key;

      if (tableContext.hasJoint(label)) {
        return tableContext;
      } else {
        return tableContext.joint(function (q) {
          q.join(toTable.tableName(), function (j) {
            j.on(toTable.c(foreignKey), '=', fromTable.c(key));
            joiner(j);
          });
        }, label);
      }
    }
  }, {
    key: 'leftJoin',
    value: function leftJoin(tableContext) {
      var joiner = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
      var label = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      label = this.jointLabel(label, { isLeftJoin: true });
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var foreignKey = this.foreignKey;
      var key = this.key;

      if (tableContext.hasJoint(label)) {
        return tableContext;
      } else {
        return tableContext.joint(function (q) {
          q.leftJoin(toTable.tableName(), function (j) {
            j.on(toTable.c(foreignKey), '=', fromTable.c(key));
            joiner(j);
          });
        }, label);
      }
    }
  }]);

  return HasMany;
})(_Relation3['default']);

exports['default'] = HasMany;
module.exports = exports['default'];