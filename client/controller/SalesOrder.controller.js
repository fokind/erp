/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrder', {
    onInit: function() {
      let that = this;
      that.modelName = 'SalesOrders';
      that.models = [
        'Employees',
      ];

      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('sales-order').attachPatternMatched(that._onRouteMatched, that);

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');
      
    },

    onNavBack: function() { this.navBack('sales-orders') },

  });
});