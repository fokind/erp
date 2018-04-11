'use strict';

module.exports = function (Model, options) {
  Model.defineProperty('deleted', {type: 'boolean'});
  Model.defineProperty('edit', {type: 'boolean'});
  Model.defineProperty('draft', {type: 'string'});

  Model.settings.acls.push({
    "accessType": "*",
    "principalType": "ROLE",
    "principalId": "$everyone",
    "permission": "DENY"
  });

  Model.settings.acls.push({
    "accessType": "*",
    "principalType": "ROLE",
    "principalId": "$authenticated",
    "permission": "ALLOW"
  });
}
