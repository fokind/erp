'use strict';

module.exports = function (Model, options) {
  Model.defineProperty('deleted', {type: 'boolean', default: true});
  Model.defineProperty('edit', {type: 'boolean', default: true});
  Model.defineProperty('draft', {type: 'string', default: ''});

  if (!Model.settings.acls) Model.settings.acls = [];

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
