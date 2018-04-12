/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Employee', {
    onInit: function() {
      let that = this;
      that.aConfigModels = [
        {
          name: 'Instance',
          entity: 'Employees',
          filter: {
            fields: {
              name: true,
              username: true,
              email: true,
              edit: true,
              deleted: true
            }
          },
        },
      ];

      var oRouter = that.getRouter();
      oRouter.attachRoutePatternMatched(that._onRouteMatched, that);
    },

    onEditActionPress: function(oControlEvent) {
      this.fnPatchEdit(true);
    },

    onSaveActionPress: function(oControlEvent) {
      this.fnSaveInstance();
    },

    onCancelActionPress: function(oControlEvent) {
      this.fnPatchEdit(false);
    },
  });
});
