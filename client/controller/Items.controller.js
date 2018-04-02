/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Items', {
    onInit: function() {
      let that = this;
      that.getView().setModel(new sap.ui.model.json.JSONModel());
    },

    onAfterRendering: function(oControlEvent) {
      let that = this;
      let oAccessToken = Cookies.getJSON('AccessToken');

      if (oAccessToken) {
        let oItemsModel = that.getOwnerComponent().getModel('Items');
        let oResourceBundle = that.getOwnerComponent()
          .getModel('i18n').getResourceBundle();

        oItemsModel.loadData(
          $.sap.formatMessage(
            '{0}Items',
            that.getOwnerComponent()
              .getManifestEntry('/sap.app/dataSources/api/uri')
          ),
          '', true, 'GET', false, false,
          {'Authorization': oAccessToken.id}
        );
      }
    },

    onPress: function(oEvent) {
      let that = this;
      let oBindingContext = oEvent.getSource().getBindingContext('Items');
      let o = oBindingContext.oModel.oData[oBindingContext.getPath().substr(1)];
      sap.m.MessageToast.show(o.id);
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);

      oRouter.navTo('item', {
        itemId: o.id,
      });
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
