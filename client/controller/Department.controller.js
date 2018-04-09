/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Department', {
    onInit: function() {
      let that = this;
      that.sInstanceModelName = 'Departments';

      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('department').attachPatternMatched(that._onRouteMatched, that);

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');
      
    },

    onNavBack: function() { this.navBack('departments') },

  });
});
