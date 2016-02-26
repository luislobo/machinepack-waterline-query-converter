var Test = require('../support/test-runner');

describe('Converter ::', function() {
  describe('FIND LIKE statements', function() {
    it('should generate a query', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              like: {
                firstName: '%foo%'
              }
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            firstName: {
              like: '%foo%'
            }
          }
        }
      }, done);
    });
  });
});
