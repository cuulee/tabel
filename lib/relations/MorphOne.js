'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _isusableobject = require('isusableobject');

var _isusableobject2 = _interopRequireDefault(_isusableobject);

var _Relation2 = require('./Relation');

var _Relation3 = _interopRequireDefault(_Relation2);

var _Relation4 = _interopRequireDefault(_Relation2);

var MorphOne = (function (_Relation) {
  _inherits(MorphOne, _Relation);

  function MorphOne(ownerTable, toTable, inverse) {
    _classCallCheck(this, MorphOne);

    if (!(inverse instanceof _Relation4['default'])) {
      throw new Error('inverse should be a MorphTo relation');
    }

    _get(Object.getPrototypeOf(MorphOne.prototype), 'constructor', this).call(this, ownerTable);
    (0, _lodash.assign)(this, { fromTable: ownerTable.fork(), toTable: toTable, inverse: inverse });
  }

  _createClass(MorphOne, [{
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
          return this.getRelated([this.activeModel]).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 1);

            var relatedModel = _ref2[0];
            return relatedModel;
          });
        } else {
          return Promise.resolve(null);
        }
      }

      var fromModels = args[0];
      var fromTable = this.fromTable;
      var inverse = this.inverse;

      var toTable = this.constraints.apply(this.toTable.fork());

      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      var typeValue = fromTable.tableName();

      return toTable.where(_defineProperty({}, typeField, typeValue)).whereIn(foreignKey, fromModels.map(function (m) {
        return m[fromTable.key()];
      })).all();
    }
  }, {
    key: 'matchModels',
    value: function matchModels() {
      var fromModels = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var relatedModels = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var relationName = this.relationName;
      var fromTable = this.fromTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;

      var keyDict = relatedModels.reduce(function (dict, m) {
        return (0, _lodash.assign)(dict, _defineProperty({}, m[foreignKey], m));
      }, {});

      return fromModels.map(function (m) {
        return (0, _lodash.assign)(m, _defineProperty({}, relationName, (0, _isusableobject2['default'])(keyDict[m[fromTable.key()]]) ? keyDict[m[fromTable.key()]] : null));
      });
    }
  }, {
    key: 'insert',
    value: function insert() {
      var _assign4;

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
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      return toTable.insert((0, _lodash.assign)(values, (_assign4 = {}, _defineProperty(_assign4, foreignKey, fromModel[this.key]), _defineProperty(_assign4, typeField, fromTable.tableName()), _assign4)));
    }
  }, {
    key: 'update',
    value: function update() {
      var _assign5;

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
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      return this.constraints.apply(toTable.fork()).where(typeField, fromTable.tableName()).where(foreignKey, fromModel[fromTable.key()]).update((0, _lodash.assign)(values, (_assign5 = {}, _defineProperty(_assign5, foreignKey, fromModel[fromTable.key()]), _defineProperty(_assign5, typeField, fromTable.tableName()), _assign5)));
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
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      return this.constraints.apply(toTable.fork()).where(typeField, fromTable.tableName()).where(foreignKey, fromModel[fromTable.key()]).del();
    }
  }, {
    key: 'join',
    value: function join() {
      var joiner = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
      var label = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      label = this.jointLabel(label, {});
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      if (this.ownerTable.scopeTrack.hasJoint(label)) {
        return this.ownerTable;
      } else {
        return this.ownerTable.joint(function (q) {
          q.join(toTable.tableName(), function (j) {
            j.on(toTable.c(typeField), '=', fromTable.orm.raw('?', [fromTable.tableName()])).on(toTable.c(foreignKey), '=', fromTable.keyCol());

            joiner(j);
          });
        }, label);
      }
    }
  }, {
    key: 'leftJoin',
    value: function leftJoin() {
      var joiner = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
      var label = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      label = this.jointLabel(label, { isLeftJoin: true });
      var fromTable = this.fromTable;
      var toTable = this.toTable;
      var inverse = this.inverse;
      var foreignKey = inverse.foreignKey;
      var typeField = inverse.typeField;

      if (this.ownerTable.scopeTrack.hasJoint(label)) {
        return this.ownerTable;
      } else {
        return this.ownerTable.joint(function (q) {
          q.leftJoin(toTable.tableName(), function (j) {
            j.on(toTable.c(typeField), '=', fromTable.orm.raw('?', [fromTable.tableName()])).on(toTable.c(foreignKey), '=', fromTable.keyCol());

            joiner(j);
          });
        }, label);
      }
    }
  }]);

  return MorphOne;
})(_Relation3['default']);

exports['default'] = MorphOne;
module.exports = exports['default'];