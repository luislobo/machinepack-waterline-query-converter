var Test = require('../support/test-runner');

describe('Converter :: ', function() {
  describe('Find Where :: ', function() {
    it('should generate a find query', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              firstName: 'Test',
              lastName: 'User'
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      }, done);
    });

    it('should work with operators', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              votes: {
                '>': 100
              }
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            votes: {
              '>': 100
            }
          }
        }
      }, done);
    });

    it('should work with multiple operators', function(done) {
      Test({
        criteria: {
          model: 'user',
          method: 'find',
          criteria: {
            where: {
              votes: {
                '>': 100
              },
              age: {
                '<': 50
              }
            }
          }
        },
        query: {
          select: ['*'],
          from: 'user',
          where: {
            votes: {
              '>': 100
            },
            age: {
              '<': 50
            }
          }
        }
      }, done);
    });
  });
});
