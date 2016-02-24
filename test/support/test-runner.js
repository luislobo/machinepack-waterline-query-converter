/**
 * Given a Waterline criteria, convert it to a Waterline query.
 */

var assert = require('assert');
var Pack = require('../../index');

module.exports = function(test, cb) {
  var criteria = test.criteria;
  var query = test.query;

  if (!criteria || !query) {
    return cb(new Error('Missing test case.'));
  }

  Pack.convert({
    model: criteria.model,
    method: criteria.method,
    criteria: criteria.criteria || {},
    values: criteria.values || {}
  }).exec({
    error: function error(err) {
      return cb(err);
    },
    success: function success(result) {
      try {
        assert.deepEqual(result, query);
        return cb();
      } catch (e) {
        return cb(e);
      }
    }
  });
};
