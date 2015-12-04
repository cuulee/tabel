/**
 * Usage:
 *
 * 'eagerLoader'
 * new Scoper([
 *   {key: 'posts', scope(t) { t.eagerLoad(['posts']); }}
 *   {key: 'posts.tags', scope(t) { t.eagerLoad['posts.tags']; }}
 *   {key: 'posts.comments', scope(t) { t.eagerLoad['posts.comments']; }}
 *   {key: 'posts.tags.posts', scope(t) { t.eagerLoad['posts.tags.posts']; }}
 * ]);
 *
 * 'filterer'
 * new Scoper([
 *   {key: 'posts.ids', scope(t, ids=[]) {
 *     if (ids.length > 0) {
 *       t.posts().join(t).whereIn('posts.id', ids);
 *     }
 *   }},
 *
 *   {key: 'name', scope(t, val) { t.where('name', like, val); }}
 *   {key: 'posts.count.gte', scope(t, val) {
 *     val = parseInt(val, 10);
 *     if (isFinite(val)) {
 *       t.posts().join(t).groupBy(t.keyCol()).having(t.raw('count(posts.id)'), '>=', val)
 *     }
 *   }}
 * ]);
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var Scoper = (function () {
  function Scoper(container) {
    var scopes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, Scoper);

    this.container = container;
    this.scopes = new Map();

    this.addScopes(scopes);
  }

  _createClass(Scoper, [{
    key: 'scoper',
    value: function scoper(name) {
      return this.container.scoper(name);
    }
  }, {
    key: 'addScopes',
    value: function addScopes() {
      var _this = this;

      var scopes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if ((0, _lodash.isObject)(scopes) && !(0, _lodash.isArray)(scopes)) {
        scopes = Object.keys(scopes).map(function (k) {
          return { key: k, scope: scopes[k] };
        });
      }

      scopes.forEach(function (_ref) {
        var key = _ref.key;
        var scope = _ref.scope;

        _this.scopes.set(key, scope);
      });

      return this;
    }
  }, {
    key: 'addScope',
    value: function addScope(_ref2) {
      var key = _ref2.key;
      var scope = _ref2.scope;

      return this.addScopes([{ key: key, scope: scope }]);
    }
  }, {
    key: 'run',
    value: function run(table, params) {
      var _this2 = this;

      var actionableParams = this.actionableParams(params);

      return actionableParams.filter(function (_ref3) {
        var key = _ref3.key;
        return _this2.scopes.has(key);
      }).reduce(function (t, _ref4) {
        var key = _ref4.key;
        var val = _ref4.val;

        _this2.scopes.get(key).bind(_this2)(t, val, key);
        return t;
      }, table);
    }
  }, {
    key: 'actionableParams',
    value: function actionableParams() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if ((0, _lodash.isArray)(params)) {
        return params.reduce(function (actionableParams, param) {
          return actionableParams.concat([{
            key: param, val: null
          }]);
        }, []);
      } else if ((0, _lodash.isObject)(params)) {
        return Object.keys(params).reduce(function (actionableParams, param) {
          return actionableParams.concat([{
            key: param, val: params[param]
          }]);
        }, []);
      } else {
        throw new Error('invalid params');
      }
    }
  }]);

  return Scoper;
})();

exports['default'] = Scoper;
module.exports = exports['default'];