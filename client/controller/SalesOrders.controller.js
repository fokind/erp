/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/ListController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrders', {
    onInit: function() {
      let that = this;
      that.aConfigModels = [{
        name: 'SalesOrders',
        filter: {where: {deleted: false}},
      }];

      var oRouter = that.getRouter();
      oRouter.attachRoutePatternMatched(that._onRouteMatched, that);
    },

    onItemPress: function(oEvent) {
      let that = this;
      let oBindingContext = oEvent.getSource().getBindingContext('SalesOrders');
      let o = oBindingContext.oModel.oData[oBindingContext.getPath().substr(1)];
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);

      oRouter.navTo('sales-order', {
        id: o.id,
      });
    },

    onDeletePress: function(oEvent) {
      
      let oView = this.getView().byId('salesOrderRows');

      //должна быть проверка на возможность удаления
      //всё это должно происходить в режиме редактирования
      //запрашивать подтверждение на удаление
      //оставлять возможность восстановить

      // calculating the index of the selected list item
      let oBindingContexts = oEvent.mParameters.listItem.oBindingContexts.SalesOrders;
      // Removing the selected list item from the model based on the index
      // calculated
      var oModel = oBindingContexts.oModel;
      var aData = oModel.getData();
      var o = oModel.getProperty(oBindingContexts.sPath);

      this.fnDeleteInstance(o.id);
    },

		onCloseDialog: function() {
      //this.fnDeleteInstance();
			this.getView().byId('confirmDeleteDialog').close();
		},

    onAddActionPress: function(oControlEvent) {
      this.fnAddInstance();
      //перейти в созданный объект
    },
  });
});
