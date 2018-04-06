/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Employee', {
    onInit: function() {
      let that = this;
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('employee').attachPatternMatched(that._onRouteMatched, that);

      that.modelName = 'Employees';
      that.models = [
        'Departments',
      ];

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');
      
    },

    onNavBack: function() { this.navBack('employees') },

  });
});
