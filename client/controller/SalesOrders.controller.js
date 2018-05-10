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
      oRouter.attachRoutePatternMatched(that._onRoutePatternMatched, that);
    },

    _onRoutePatternMatched: function(oEvent) {
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

    onDeletePress: function(oControlEvent) {
      let oBindingContext = oControlEvent.getParameter('listItem').getBindingContext();
      oBindingContext.delete();
    },

		onCloseDialog: function() {
			this.getView().byId('confirmDeleteDialog').close();
		},

    onAddActionPress: function(oControlEvent) {
      let that = this;
      let oBinding = that.byId("salesOrders").getBinding("items");
      let oContext = oBinding.create({//пустой объект передавать нельзя
        //"_id": "",//пустую передавать нельзя, т.к. база данных должна сама присвоить ключ, использовать в таблице тоже нельзя, т.к. на момент создания id должна быть
        "name": "",
        "customerName": "",
        "invoicingAddress": "",
        "deliveryAddress": "",
        "salesPersonName": "",
        "statusName": "",
        "untaxedAmount": 0,
        "taxes": 0,
        "total": 0
      });

      oContext.created().then(() => {
        let sId = oContext.getProperty('_id');
        //после создания элемента чтобы создать следующий необходимо обновить модель, но сразу обновлять нельзя, т.к. слетит позиция
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
