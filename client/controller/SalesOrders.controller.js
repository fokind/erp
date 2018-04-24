/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/ListController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrders', {
    onInit: function() {
      let that = this;
      that.aConfigModels = [];
      var oRouter = that.getRouter();
      oRouter.attachRoutePatternMatched(that._onRouteMatched, that);
    },

    onItemPress: function(oEvent) {
      let that = this;
      let oBindingContext = oEvent.getSource().getBindingContext();
      let sPath = oBindingContext.sPath;
      let o = oBindingContext.getObject(sPath);
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);

      oRouter.navTo('sales-order', {
        id: o._id,
      });
    },

    onDeletePress: function(oEvent) {
      let that = this;
      let oBindingContext = oEvent.getParameter('listItem').getBindingContext();
      oBindingContext.delete().then(() => oBindingContext.getBinding().refresh());
      
    },

		onCloseDialog: function() {
      //this.fnDeleteInstance();
			this.getView().byId('confirmDeleteDialog').close();
		},

    onAddActionPress: function(oControlEvent) {
      let that = this;
      console.log(1);
      let oBinding = that.byId("salesOrderRows").getBinding("items");
      let oContext = oBinding.create({
        "name": "",
        "total" : 0
      });

      oContext.created().then(() => {
        let sId = oContext.getProperty('_id');
        oBinding.refresh();
        sap.ui.core.UIComponent.getRouterFor(that).navTo('sales-order', {id: sId});
      });

    },

    navTo: function(oData) {
      let that = this;
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.navTo('sales-order', {
        id: oData.id,
      });
    },
  });
});
