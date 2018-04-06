/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrder', {
    onInit: function() {
      let that = this;
      that.sInstanceModelName = 'SalesOrders';
      that.aRelations = [
        {name: 'Rows'}
      ];

      //строка редактируется в диалоге
      //при закрытии диалога с сохранением обязательно адейтится соответствующая строчка
      //при роутинге назад должна апдейтиться соответствующая строчка, возможно еще в момент сохранения

      that.models = [
        'Employees',//TODO по аналогии с описанием основной модели
      ];

      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('sales-order').attachPatternMatched(that._onRouteMatched, that);

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');
      
    },

    onNavBack: function() { this.navBack('sales-orders') },

  });
});
