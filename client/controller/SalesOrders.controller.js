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
      //let oModel = this.getOwnerComponent().getModel();
      //let oView = this.getView();
      //oView.setBindingContext(oModel.createBindingContext('/SalesOrders'));
      //.byId("salesOrders").setBindingContext(oModel.createBindingContext('/SalesOrders'));
      //console.log(oModel);
      //console.log(oView);
      
      //this.getView().bindElement('/SalesOrders');
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
      //console.log(oControlEvent.getParameter('listItem'));
      let oBindingContext = oControlEvent.getParameter('listItem').getBindingContext();
      //console.log(oBindingContext);
      oBindingContext.delete();//.then(() => console.log(oControlEvent.getParameter('listItem')));
    },

		onCloseDialog: function() {
      //this.fnDeleteInstance();
			this.getView().byId('confirmDeleteDialog').close();
		},

    onAddActionPress: function(oControlEvent) {
      let that = this;
      let oBinding = that.byId("salesOrders").getBinding("items");
      //console.log(oBinding);
      let oContext = oBinding.create({//пустой объект передавать нельзя
        //"_id": "",//пустую передавать нельзя, т.к. база данных должна сама присвоить ключ, использовать в таблице тоже нельзя, т.к. на момент создания id должна быть
        "name": "",
        "total": 0
      });



      oContext.created().then(() => {
        //console.log(oBinding);
        let sId = oContext.getProperty('_id');
        //that.getModel().submitBatch(that.getModel().getUpdateGroupId());
        //oBinding.refresh();
        /*console.log(oContext);
        console.log(oContext.oCreatePromise);
        console.log(oContext.checkUpdate());
        console.log(oContext.getGroupId());
        console.log(oContext.getUpdateGroupId());
        console.log(oContext.isTransient());
        console.log(oContext.oSyncCreatePromise);*/
        //let sId = oContext.getObject('_id');
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
