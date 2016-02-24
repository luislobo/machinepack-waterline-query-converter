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
      }
    };

    // Build the query
    buildQuery();

    return exits.success(query);
  }


};