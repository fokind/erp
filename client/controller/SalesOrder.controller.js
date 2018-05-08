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
            new sap.m.ObjectIdentifier({title: "{parentId}"}),
            new sap.m.ObjectNumber({number: "{quantity}", unit: "шт."}),
            new sap.m.ObjectNumber({number: "{price}", unit: "р."}),
            new sap.m.ObjectNumber({number: "{total}", unit: "р."})
          ]
        })
      });   
      that.getView().bindElement('/SalesOrders(\'' + sId + '\')');
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
      //console.log(oControlEvent);

      let that = this;
      //console.log(that);
      let oBindingContext = oControlEvent.getSource().getBindingContext();
      console.log(oBindingContext);
      /*let sPath = oBindingContext.sPath;
      let o = oBindingContext.getObject(sPath);
      console.log(sPath);*/
      //let oRouter = sap.ui.core.UIComponent.getRouterFor(that);

      /*oRouter.navTo('sales-order', {
        id: o._id,
      });*/


      
      //при открытии диалога передавать клон связанного элемента
      //при закрытии копировать клон в модель сущности
      

      //let that = this;

      //let sId = oControlEvent.getParameters();
      //console.log(sId);

      var oView = that.getView();
      var oDialog = oView.byId('salesOrderRowDialog');

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.SalesOrderRowDialog', that);
        oView.addDependent(oDialog);
      }

      //oDialog.bindElement('/SalesOrderRows(\'' + o._id + '\')');
      oDialog.setBindingContext(oBindingContext);
      oDialog.addStyleClass('sapUiSizeCompact');
      oDialog.open();
    },

    onDeleteRowPress: function(oControlEvent) {
      //console.log(oControlEvent);
      //let that = this;
      let oBindingContext = oControlEvent.getParameter('listItem').getBindingContext();
      oBindingContext.delete();

      //let iIndex = oBindingContext.iIndex;
      //console.log(oBindingContext.sPath);

      //let oModel = that.getOwnerComponent().getModel();
      //let o = oBindingContext.getObject();//TODO теперь нужно получить соответствующий контекст в списке, который потом удалить!!!!!!!!!!!!!
      //let oContext = oModel.createBindingContext('/SalesOrderRows(' + o._id + ')', oBindingContext);
      
      //let oDataListBinding = oModel.bindList('/SalesOrderRows');
      //let a = oDataListBinding.getContexts();
      //let oDataContextBinding = oModel.bindContext('/SalesOrderRows(' + o._id + ')');
      //let oContext = oDataContextBinding.oElementContext;

      //console.log(oDataListBinding);
      //console.log(a);
      //console.log(oContext);
      //oContext.delete();
      //let aContexts = oDataListBinding.getContexts();
      //console.log(aContexts);

      //oBindingContext.delete().then(() => { console.log(oBindingContext); });
    },

    fnRowOpen: function(oRow) {
      //let that = this;
      //let oContext = oControlEvent.getSource().getBindingContext('Instance');
      
      //let sPath = oContext.getPath();
      ///oControlEvent.getSource().getBindingContext('Instance').sPath;
      //this.fnRowOpen(sPath);

      //let that = this;
      //const sModelName = 'Instance';//TODO заменить на модель по умолчанию
      //заблокировать для остальных пользователей (весь заказ, включая дочерние объекты должен считаться заблокированным)

      /*var oView = that.getView();
      var oDialog = oView.byId('salesOrderRowDialog');

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.SalesOrderRowDialog', that);
        oView.addDependent(oDialog);
      }*/

      //let oRow = that.getModel(sModelName).getProperty(sPath);
      //let oData = _.cloneDeep(oRow);
      
      //oDialog.setModel(new sap.ui.model.json.JSONModel(oData), 'Row');
      //oDialog.setModel(oContext.oModel, 'Instance');
      /*let aRows = this.getModel('Instance').getProperty('/Rows');
      let sPath = '/Rows/' + aRows.indexOf(oRow);

      oDialog.bindElement({model: 'Instance', path: sPath});
      oDialog.addStyleClass('sapUiSizeCompact');
      oDialog.open();*/
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
