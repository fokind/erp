/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceRelationsController',
  'sap/ui/model/json/JSONModel',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
	"tms/basic/model/formatter"
], function(Controller, JSONModel, Filter, FilterOperator, formatter) {
  return Controller.extend('tms.basic.controller.SalesOrder', {
    formatter: formatter,

    onInit: function() {
      let that = this;
      that.setModel(new JSONModel(), 'view');
      that.getRouter().getRoute('sales-order').attachPatternMatched(that._onRoutePatternMatched, that);
      //let oModel = that.getModel();
      //oModel.attachPropertyChange(that.onPropertyChange, that);
    },

    _onRoutePatternMatched: function(oEvent) {
      let that = this;
      //that.byId("salesOrderRows").bindElement({path: '/SalesOrderRows', parameters: {$count: true}});
      
      let oViewModel = that.getModel('view');
      let sId = oEvent.getParameter('arguments').id;
      oViewModel.setProperty('/id', sId);

      //фильтр parentId = sId
      that.getView().byId("salesOrderRows").bindItems({
        path: '/SalesOrderRows',
        filters: [
          new Filter({
            path: 'parentId',
            operator: FilterOperator.EQ,
            value1: sId
          })
        ],
        parameters: {
          $count: true
        },
        template: new sap.m.ColumnListItem({
          type: sap.m.ListType.Active,
          press: (e) => that.onRowDetailPress(e),
          cells: [
            new sap.m.ObjectIdentifier({title: "{productName}"}),
            new sap.m.ObjectNumber({number: "{quantity}", unit: "шт."}),
            new sap.m.ObjectNumber({number: "{unitPrice}", unit: "р."}),
            new sap.m.ObjectNumber({number: "{taxes}", unit: "р."}),
            new sap.m.ObjectNumber({number: "{discountPercent}", unit: "%"}),
            new sap.m.ObjectNumber({
              number: {
                parts: [
                  {path: 'quantity'},
                  {path: 'unitPrice'}],
                formatter: (quantity, unitPrice) => that.formatter.salesOrderRowTotal(quantity, unitPrice)
              },
              unit: "р."
            })
          ]
        })
      });

      var oView = that.getView();
      oView.bindElement('/SalesOrders(\'' + sId + '\')');
    },

    onRowDetailPress: function(oControlEvent) {
      let that = this;
      let oBindingContext = oControlEvent.getSource().getBindingContext();
      var oView = that.getView();
      var oForm = oView.byId('salesOrderRowForm');
      oForm.setBindingContext(oBindingContext);
      oForm.setProperty("visible", true);
    },

    onDeleteRowPress: function(oControlEvent) {
      let oBindingContext = oControlEvent.getParameter('listItem').getBindingContext();
      oBindingContext.delete();
    },

    onAddActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getOwnerComponent().getModel();
      let oDataListBinding = oModel.bindList('/SalesOrderRows');
      let sSalesOrderId = that.getModel('view').getProperty('/id');

      let oContext = oDataListBinding.create({
        "productName": "",
        "quantity": 0,
        "unitPrice": 0,
        "taxes": 0,
        "discountPercent": 0,
        "subtotal": 0,
        "salesOrderId": sSalesOrderId
      });

      //метод рефреш необходимо вызывать у родительского абсолютного биндинга
      oContext.created().then(() => {
        oModel.refresh();
        //открыть диалог
      });      
    },
  });
});
