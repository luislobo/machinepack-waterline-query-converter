var Test = require('../support/test-runner');

describe('Converter :: ', function() {
  describe('Create :: ', function() {
    it('should generate a create query', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'create',
          values: {
            firstName: 'foo'
          }
        },
        query: {
          insert: {
            firstName: 'foo'
          },
          into: 'user'
        }
      }, done);
    });

    it('should generate a create query with multiple values', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'create',
          values: {
            firstName: 'foo',
            lastName: 'bar'
          }
        },
        query: {
          insert: {
            firstName: 'foo',
            lastName: 'bar'
          },
          into: 'user'
        }
      }, done);
    });
  });
});
