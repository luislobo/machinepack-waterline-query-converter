module.exports = {


  friendlyName: 'Convert',


  description: 'Converts Waterline criteria to a Waterline query.',


  cacheable: false,


  sync: false,


  inputs: {

    model: {
      description: 'The Waterline model identity being used for the operation.',
      example: 'user',
      required: true
    },

    method: {
      description: 'The Waterline adapter method to run.',
      example: 'find',
      required: true
    },

    criteria: {
      description: 'The Waterline criteria that is being used.',
      example: '*'
    },

    values: {
      description: 'The Waterline values used for a create or update.',
      example: '*'
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'A Waterline query object.',
      example: {}
    }

  },


  fn: function convert(inputs, exits) {
    var _ = require('lodash');
    var model = inputs.model;

    // Hold the final query value
    var query = {};


    //  ╔╦╗╔═╗╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
    //  ║║║║ ║ ║║║╠╣ ║║╣ ╠╦╝╚═╗
    //  ╩ ╩╚═╝═╩╝╩╚  ╩╚═╝╩╚═╚═╝

    if (inputs.criteria) {
      if (inputs.criteria.skip) {
        query.skip = inputs.criteria.skip;
      }

      if (inputs.criteria.sort) {
        var sort = [];
        _.each(inputs.criteria.sort, function normalizeSort(val, key) {
          var sortObj = {};

          if (val === 0 || val === -1) {
            val = 'desc';
          }

          if (val === 1) {
            val = 'asc';
          }

          sortObj[key] = val;
          sort.push(sortObj);
        });

        query.orderBy = sort;
      }

      if (inputs.criteria.limit) {
        query.limit = inputs.criteria.limit;
      }
    }


    //  ╔═╗╦═╗╔═╗╔═╗╔╦╗╔═╗
    //  ║  ╠╦╝║╣ ╠═╣ ║ ║╣
    //  ╚═╝╩╚═╚═╝╩ ╩ ╩ ╚═╝
    //
    // Process a CREATE query and build a WQL insert query
    var processCreate = function processCreate() {
      query.into = model;
      query.insert = inputs.values || {};
    };


    //  ╔═╗╦╔╗╔╔╦╗
    //  ╠╣ ║║║║ ║║
    //  ╚  ╩╝╚╝═╩╝
    //
    // Process a FIND or FINDONE query and build a WQL select query.
    var processFind = function processFind(criteria) {
      query.select = criteria.select || ['*'];
      query.from = model;
      query.where = criteria.where || criteria || {};
    };


    //  ╔╦╗╔═╗╔═╗╔╦╗╦═╗╔═╗╦ ╦
    //   ║║║╣ ╚═╗ ║ ╠╦╝║ ║╚╦╝
    //  ═╩╝╚═╝╚═╝ ╩ ╩╚═╚═╝ ╩
    //
    // Process a DESTROY query and a build a WQL destroy query.
    var processDestroy = function processDestroy(criteria) {
      query.del = true;
      query.from = model;
      query.where = criteria.where || {};
    };


    //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗
    //  ║ ║╠═╝ ║║╠═╣ ║ ║╣
    //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝
    //
    // Process an UPDATE query and a build a WQL update query.
    var processUpdate = function processUpdate(criteria) {
      query.update = inputs.values || {};
      query.using = model;
      query.where = criteria.where || {};
    };


    //  ╔═╗╔═╗╦ ╦╔╗╔╔╦╗
    //  ║  ║ ║║ ║║║║ ║
    //  ╚═╝╚═╝╚═╝╝╚╝ ╩
    //
    // Process a COUNT query and a build a WQL update query.
    var processCount = function processCount(criteria) {
      query.count = inputs.values || {};
      query.from = model;
      query.where = criteria.where || {};
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦═╗╦╔╦╗╔═╗╦═╗╦╔═╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║  ╠╦╝║ ║ ║╣ ╠╦╝║╠═╣
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╩╚═╩ ╩ ╚═╝╩╚═╩╩ ╩
    //
    // The meat an potatoes of the converter. Takes an existing Waterline
    // criteria object and builds up something that can be used with the
    // Waterline Query Language.
    var processCriteria = function processCriteria(criteria) {
      // Loop through the criteria looking for IN arrays
      _.each(criteria, function process(val, key) {
        // Handle OR criteria
        if (key === 'or' && _.isArray(val)) {
          _.each(val, function processOrClause(clause) {
            clause = processCriteria(clause);
          });

          return criteria;
        }

        // Handle generic IN condition
        if (_.isArray(val)) {
          criteria[key] = {
            in: val
          };
        }
      });

      return criteria;
    };

    //  ╔╗ ╦ ╦╦╦  ╔╦╗  ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦
    //  ╠╩╗║ ║║║   ║║  ║═╬╗║ ║║╣ ╠╦╝╚╦╝
    //  ╚═╝╚═╝╩╩═╝═╩╝  ╚═╝╚╚═╝╚═╝╩╚═ ╩
    //
    var buildQuery = function buildQuery() {
      // If there was any criteria, process it
      var criteria;
      if (inputs.criteria) {
        criteria = processCriteria(inputs.criteria);
      }

      switch (inputs.method) {
        case 'create':
          processCreate();
          break;

        case 'find':
        case 'findOne':
          processFind(criteria);
          break;

        case 'destroy':
          processDestroy(criteria);
          break;

        case 'update':
          processUpdate(criteria);
          break;

        case 'count':
          processCount(criteria);
          break;
      }
    };

    // Build the query
    buildQuery();

    return exits.success(query);
  }


};
