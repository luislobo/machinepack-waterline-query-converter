var Test = require('../support/test-runner');

describe('Converter ::', function() {
  describe('FIND WHERE IN statements', function() {
    it('should generate a query', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              id: [1, 2, 3]
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            id: {
              in: [1, 2, 3]
            }
          }
        }
      }, done);
    });

    it('should generate a query when inside an OR statement', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              or: [
                {
                  id: [1, 2, 3]
                },
                {
                  id: [4, 5, 6]
                }
              ]
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            or: [
              {
                id: {
                  in: [1, 2, 3]
                }
              },
              {
                id: {
                  in: [4, 5, 6]
                }
              }
            ]
          }
        }
      }, done);
    });
  });
});
