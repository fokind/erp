/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/BaseController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Employee', {
    onInit: function() {
      let that = this;
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('employee').attachPatternMatched(that._onRouteMatched, that);
      
      this.modelName = 'Employees';
      this.models = [
        'Departments',
      ];

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');
      
    },

    onNavBack: function() { this.navBack('employees') },

  });
});
