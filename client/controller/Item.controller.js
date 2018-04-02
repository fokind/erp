/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Item', {
    onInit: function() {
      let that = this;
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('item').attachPatternMatched(that._onRouteMatched, that);
    },

    _onRouteMatched: function(oEvent) {
      let that = this;
      let oItemModel = that.getOwnerComponent().getModel('Item');
      oItemModel.loadData(
        $.sap.formatMessage(
          '{0}Items/{1}', [
            that.getOwnerComponent()
              .getManifestEntry('/sap.app/dataSources/api/uri'),
            oEvent.getParameter('arguments').itemId,
          ]
        ),
        '', true, 'GET', false, true,
        {'Authorization': Cookies.getJSON('AccessToken').id} // авторизация должна быть на стороне сервера через куки и паспорт
      );
    },

    onNavBack: function() {
      let that = this;
      let oHistory = sap.ui.core.routing.History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo('items', {}, true);
      }
    },
  });
});
