/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrder', {

    onInit: function() {
      let that = this;
      that.sInstanceModelName = 'SalesOrders';
      that.aRelations = [
        {name: 'Rows'},
      ];

      //строка редактируется в диалоге
      //при закрытии диалога с сохранением обязательно адейтится соответствующая строчка
      //при роутинге назад должна апдейтиться соответствующая строчка, возможно еще в момент сохранения

      that.aModels = [
        {name: 'Employees'},
        {name: 'Customers'},
        {name: 'SalesOrders'},
      ];

      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('sales-order').attachPatternMatched(that._onRouteMatched, that);

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');//TODO заменить на контекст
    },

    onNavBack: function() {
      this.navBack('sales-orders')
    },

    onRowDetailPress: function(oControlEvent) {
      let that = this;
      const sModelName = 'Rows';
      let sPath = oControlEvent.getSource().getBindingContext(sModelName).sPath;
      //заблокировать для остальных пользователей

      var oView = that.getView();
      var oDialog = oView.byId('salesOrderRowDialog');
      
      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.SalesOrderRowDialog', that);
        oView.addDependent(oDialog);
      }

      oDialog.bindElement({
        path: sPath,
        model: sModelName,
      });
      oDialog.addStyleClass('sapUiSizeCompact');
      //oDialog.getBindingContext(sModelName).oModel.setProperty(sPath + '/edit', true);
      oDialog.open();
    },

		onRowSave: function(oControlEvent) {
      let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext(sRelationName);
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;

      // syncPost не работает из-за Request Method
      $.ajax({
        url: that.getApiUri() +
          that.sInstanceModelName + '/' + that.sInstanceId + '/' +
          sRelationName + '/' + oModel.getProperty(sPath + '/id'),
        method: 'PUT',
        data: JSON.stringify(oModel.getProperty(sPath)),
        contentType: 'application/json',
      });

      this.getView().byId('salesOrderRowDialog').close();

    },

    onRowCancel: function(oControlEvent) {
      let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext(sRelationName);
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;

      let jRes = jQuery.sap.syncGetJSON(
        that.getApiUri() +
        that.sInstanceModelName + '/' + that.sInstanceId + '/' +
        sRelationName + '/' + oModel.getProperty(sPath + '/id')
      );

      oModel.setProperty(sPath, jRes.data);

      this.getView().byId('salesOrderRowDialog').close();
    },
    
    formatterCalculateRowTotal: function(unitPrice, quantity) {
      return (unitPrice === undefined || quantity === undefined) ? 0 : unitPrice * quantity;
    },

    onAddActionPress: function(oControlEvent) {
      /*let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext(sRelationName);
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;

      // syncPost не работает из-за Request Method
      $.ajax({
        url: that.getApiUri() +
          that.sInstanceModelName + '/' + that.sInstanceId + '/' +
          sRelationName + '/' + oModel.getProperty(sPath + '/id'),
        method: 'PUT',
        data: JSON.stringify(oModel.getProperty(sPath)),
        contentType: 'application/json',
      });*/
    },

    onDeleteActionPress: function(oControlEvent) {
      //получить выбранные элементы
      //пометить удаленными
      //при загрузке теперь фильтровать только неудаленные
    },
  });
});
