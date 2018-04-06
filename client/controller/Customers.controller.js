/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Customers', {
    onInit: function() {
      // let that = this;
      // that.getView().setModel(new sap.ui.model.json.JSONModel());
    },

    onAfterRendering: function(oControlEvent) {
      this.update();
    },

    update: function() {
      let that = this;
      let oModel = that.getOwnerComponent().getModel('Customers');
      oModel.loadData(
        $.sap.formatMessage(
          '{0}Customers',
          that.getOwnerComponent()
            .getManifestEntry('/sap.app/dataSources/api/uri')
        ),
        '', true, 'GET', false, false,
      );
    },

    onPress: function(oEvent) {
      let that = this;
      let oBindingContext = oEvent.getSource().getBindingContext('Customers');
      let o = oBindingContext.oModel.oData[oBindingContext.getPath().substr(1)];
      sap.m.MessageToast.show(o.id);
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);

      oRouter.navTo('customer', {
        id: o.id,
      });
    },

    onDeleteActionPress: function() {
      let that = this;
      var oView = that.getView();
      var oDialog = oView.byId('confirmDeleteDialog');
      // create dialog lazily
      if (!oDialog) {
         // create dialog via fragment factory
         oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.Dialog', that);
         oView.addDependent(oDialog);
      }

      oDialog.open();
    },

		onCloseDialog: function() {
			this.getView().byId('confirmDeleteDialog').close();
		},

    onAddActionPress: function(oControlEvent) {
      //отправить запрос POST в API
      let that = this;
      let oAccessToken = Cookies.getJSON('AccessToken');

      $.post({
        url: $.sap.formatMessage(
          '{0}Customers',
          that.getOwnerComponent()
            .getManifestEntry('/sap.app/dataSources/api/uri')
        ),
      }).done(function (data) {
        //вывести окно создания объекта
        console.log(data);
        //обновить таблицу
        that.update();
      }).fail(function (err) {
        console.log(err);
      });
      //получить id, вывести сообщение
    },    

    onNavBack: function() {
      let that = this;
      let oHistory = sap.ui.core.routing.History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo('home', {}, true);
      }
    },
  });
});
