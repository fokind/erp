/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrder', {

    onInit: function() {
      let that = this;
      that.sInstanceModelName = 'SalesOrders';
      
      that.oInstanceFilter = {include: {
        relation: 'Rows',
        scope: {where: {deleted: false}},//не забыть удалить relation при сохранении
      }};

      that.aRelationNames = ['Rows'];
      //строка редактируется в диалоге
      //при закрытии диалога с сохранением обязательно адейтится соответствующая строчка
      //при роутинге назад должна апдейтиться соответствующая строчка, возможно еще в момент сохранения

      that.aModels = [
        {name: 'Employees'},
      ];

      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('sales-order').attachPatternMatched(that._onRouteMatched, that);

      that.setModel(new sap.ui.model.json.JSONModel(), 'Instance');//TODO заменить на контекст
    },

    onNavBack: function() {
      this.navBack('sales-orders')
    },

    onRowDetailPress: function(oControlEvent) {
      this.fnRowOpen(oControlEvent.getSource().getBindingContext('Instance').sPath);
    },

    fnRowOpen: function(sPath, bInitial) {
      let that = this;
      const sModelName = 'Instance';//TODO заменить на модель по умолчанию
      //заблокировать для остальных пользователей (весь заказ, включая дочерние объекты должен считаться заблокированным)

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

      that.oRowBackup = bInitial ? undefined : _.cloneDeep(that.getModel(sModelName).getProperty(sPath));

      oDialog.open();
    },

    onRowAccept: function(oControlEvent) {
      this.getModel('Instance').refresh();
      oControlEvent.getSource().getParent().close();
      //that.getView().byId('salesOrderRowDialog').close();
    },

		onRowSave: function(oControlEvent) {
      let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext('Instance');
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;
      let oData = oModel.getProperty(sPath);
      var oInstanceData = _.cloneDeep(oData);

      that.aRowsRelationNames.forEach(function(relationName) {
        delete oInstanceData[relationName];
      });
      // для одного отношения с одним вложенным отношением по простому
      //console.log(new sap.ui.model.json.JSONModel(that.oInstanceFilter));
      //console.log(that.oInstanceFilter.include.scope.include);

      /*include.forEach(function(relation) {
        delete oInstanceData[relation.relation];
      });*/
      
      // syncPost не работает из-за Request Method = PUT
      $.ajax({
        url: that.getApiUri() +
          that.sInstanceModelName + '/' + that.sInstanceId + '/' +
          sRelationName + '/' + oModel.getProperty(sPath + '/id'),
        method: 'PUT',
        data: JSON.stringify(oInstanceData),
        contentType: 'application/json',
      }).done(function(data) {
        oModel.refresh();
        sap.m.MessageToast.show(that.getResourceBundle().getText('saveSuccess'));
      }).fail(function(data) {
        sap.m.MessageToast.show(that.getResourceBundle().getText('saveError'));
      }).always(function(data) {
        that.getView().byId('salesOrderRowDialog').close();
      });

    },

    onRowCancel: function(oControlEvent) {
      let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext('Instance');
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;

      if (that.oRowBackup) {
        oModel.setProperty(sPath, that.oRowBackup);
      } else {
        let aRows = oModel.getProperty('/Rows');
        let oRow = oModel.getProperty(sPath);
        let iIndex = aRows.indexOf(oRow);
        aRows.splice(iIndex, 1);
        oModel.refresh();
      }

      this.getView().byId('salesOrderRowDialog').close();
    },
    
    formatterCalculateRowTotal: function(unitPrice, quantity) {
      return (unitPrice === undefined || quantity === undefined) ? 0 : unitPrice * quantity;
    },

    onAddActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getModel('Instance');
      let aRows = that.getModel('Instance').getProperty('/Rows');
      let oRow = {};
      aRows.push(oRow);

      that.fnRowOpen('/Rows/' + aRows.indexOf(oRow), true);
    },

    onDeleteActionPress: function(oControlEvent) {
      //получить выбранные элементы
      let that = this;
      const sRelationName = 'Rows';
      let aSelectedItems = that.getView().byId('salesOrderRows').getSelectedItems();
      aSelectedItems.forEach(function(item) {
        let oBindingContext = item.getBindingContext('Instance');
        let sPath = oBindingContext.sPath;
        let oModel = oBindingContext.oModel;
        let oData = oModel.getProperty(sPath);
        oModel.setProperty(sPath + '/deleted', true);
        var oInstanceData = _.cloneDeep(oData);
        that.aRowsRelationNames.forEach(function(relationName) {
          delete oInstanceData[relationName];
        });
    
        $.ajax({
          url: that.getApiUri() +
            that.sInstanceModelName + '/' + that.sInstanceId + '/' +
            sRelationName + '/' + oModel.getProperty(sPath + '/id'),
          method: 'PUT',
          data: JSON.stringify(oInstanceData),
          contentType: 'application/json',
        }).done(function(data) {
          let aRows = oModel.getData().Rows;
          let iIndex = aRows.indexOf(oData);
          aRows.splice(iIndex, 1);
          oModel.refresh();
        });
      });

      
    },
  });
});
