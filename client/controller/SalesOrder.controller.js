/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceRelationsController',
  'sap/ui/model/json/JSONModel',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator'
], function(Controller, JSONModel, Filter, FilterOperator) {
  return Controller.extend('tms.basic.controller.SalesOrder', {

    onInit: function() {
      let that = this;
      that.setModel(new JSONModel(), 'view');
      that.getRouter().getRoute('sales-order').attachPatternMatched(that._onRoutePatternMatched, that);
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
            new sap.m.ObjectIdentifier({title: "{name}"}),
            new sap.m.ObjectNumber({number: "{quantity}", unit: "шт."}),
            new sap.m.ObjectNumber({number: "{price}", unit: "р."}),
            new sap.m.ObjectNumber({number: "{total}", unit: "р."})
          ]
        })
      });

      var oView = that.getView();
      oView.bindElement('/SalesOrders(\'' + sId + '\')');
      //var oForm = oView.byId('salesOrderRowForm');
      //связать форму редактирования строки с первым элементом, если он есть
      
      //oForm.setBindingContext(undefined);
      //console.log(oForm);
    },

    onPropertyChange: function(oEvent) {
      /*let aParameters = oEvent.getParameters();
      let oContext = oEvent.getParameter('context');*/
      //console.log(oContext);
      //console.log(aParameters);
      /*if ((oContext && /^\/Rows\//.exec(oContext.sPath)) || (aParameters && /^\/Rows\//.exec(aParameters.path))) {
        //console.log(oContext);
        
        let that = this;
        let oModel = that.getModel('Instance');
        let aRows = oModel.getProperty('/Rows').filter(e => !e.deleted &&
          !isNaN(e.quantity) &&
          !isNaN(e.unitPrice));

        //console.log(aRows);
          
        let fTotal = aRows.length == 0 ? 0 : _.sum(aRows
          .map(e => e.quantity * e.unitPrice));

        oModel.setProperty('/total', fTotal);
      };*/
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

    fnRowOpen: function(oRow) {

    },

		formatterCalculateRowTotal: function(fUnitPrice, fQuantity) {
      return (fUnitPrice === undefined || fQuantity === undefined) ? 0 : fUnitPrice * fQuantity;
    },

    formatterCalculateTotal: function(aRows) {
      //console.log(aRows);
      return 0;
    },

    onAddActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getOwnerComponent().getModel();
      let oDataListBinding = oModel.bindList('/SalesOrderRows');
      let sParentId = that.getModel('view').getProperty('/id');

      let oContext = oDataListBinding.create({
        "name": "",
        "quantity": 0,
        "price": 0,
        "total": 0,
        "parentId": sParentId
      });

      //метод рефреш необходимо вызывать у родительского абсолютного биндинга
      

      oContext.created().then(() => {
        
        oModel.refresh();
        //открыть диалог
      });      
    },
  });
});
