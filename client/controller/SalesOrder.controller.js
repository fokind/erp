/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceRelationsController',
], function(Controller) {
  return Controller.extend('tms.basic.controller.SalesOrder', {

    onInit: function() {
      let that = this;
      //that.sInstanceModelName = 'SalesOrders';
      that.aConfigModels = [
        {
          name: 'Instance',
          entity: 'SalesOrders',
          filter: {include: [{
            relation: 'Rows',
            scope: {where: {deleted: false}} //не забыть удалить relation при сохранении
          }]}
        },
        {
          name: 'Employees',
          filter: {where: {deleted: false}}
        },
      ];
      
      
      /*that.oInstanceFilter = {include: {
        relation: 'Rows',
        scope: {where: {deleted: false}},//не забыть удалить relation при сохранении
      }};

      that.aRelationNames = ['Rows'];*/
      //строка редактируется в диалоге
      //при закрытии диалога с сохранением обязательно адейтится соответствующая строчка
      //при роутинге назад должна апдейтиться соответствующая строчка, возможно еще в момент сохранения

      /*that.aModels = [
        {name: 'Employees'},
      ];*/

      var oRouter = that.getRouter();
      oRouter.attachRoutePatternMatched(that._onRouteMatched, that);
    },

    /*onInstancePropertyChange: function(oEvent) {
      //console.log(oEvent);
      let that = this;
      let oModel = that.getModel('Instance');
      let aRows = oModel.getProperty('/Rows');
      let fTotal = _.sum(aRows
        .filter(e => !e.deleted &&
          !isNaN(e.quantity) &&
          !isNaN(e.unitPrice))
        .map(e => e.quantity * e.unitPrice));

      //console.log(fTotal);
    },*/

    onRowDetailPress: function(oControlEvent) {
      //при открытии диалога передавать клон связанного элемента
      //при закрытии копировать клон в модель сущности
      let that = this;
      let oContext = oControlEvent.getSource().getBindingContext('Instance');
      
      let sPath = oContext.getPath();
      //oControlEvent.getSource().getBindingContext('Instance').sPath;
      this.fnRowOpen(sPath);
    },

    onSaveActionPress: function(oControlEvent) {
      //сохранить строки
      this.fnRowsSave();
      //сохранить сам элемент
      this.fnSaveInstance();
    },

    onDeleteRow: function(oControlEvent) {
      //пометить как удаленный
      //console.log(oControlEvent);
      let o = oControlEvent.getParameters('listItem');
      let oBindingContext = o.listItem.getBindingContext('Instance');
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;
      //let o1 = oModel.getObject(sPath);
      //console.log(o1);
      //o1.deleted = true;

      //плохо работает нотификация вложенных объектов
      
      oModel.setProperty(sPath + '/deleted', true);
      oModel.firePropertyChange({
        path: sPath + '/deleted',
        value: true
      })
      //oModel.refresh();
    },

		fnRowsSave: function() {
      //replaceOrCreate
      let that = this;
      let aRows = that.getModel('Instance').getProperty('/Rows');

      aRows.forEach(function(oRow) {
        oRow.parentId = that.sInstanceId;
        $.ajax({
          url: that.getApiUri() + 'SalesOrderRows/replaceOrCreate',
          method: 'POST',
          data: JSON.stringify(oRow),
          contentType: 'application/json',
        });
      });

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

      let oRow = that.getModel(sModelName).getProperty(sPath);
      let oData = _.cloneDeep(oRow);
      oDialog.setModel(new sap.ui.model.json.JSONModel(oData), 'Row');

      /*oDialog.bindElement({
        path: sPath,
        model: sModelName,
      });*/
      oDialog.addStyleClass('sapUiSizeCompact');

      //that.oRowBackup = bInitial ? undefined : _.cloneDeep(that.getModel(sModelName).getProperty(sPath));

      oDialog.open();
    },

    onRowAccept: function(oControlEvent) {
      let that = this;
      let oDialog = oControlEvent.getSource().oParent;
      let oRowModel = oDialog.getModel('Row');

      let oView = that.getView().byId('salesOrderRows');
      console.log(oView);

      let oContext = oView.getBindingContext('Instance');
      let sPath = oContext.getPath();

      console.log(sPath);


      Object.assign(oDialog.oRow, oRowModel);
      console.log(oDialog.oRow);
      this.getModel('Instance').refresh();
      console.log(this.getModel('Instance'));
      oControlEvent.getSource().getParent().close();
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
    
    formatterCalculateRowTotal: function(fUnitPrice, fQuantity) {
      return (fUnitPrice === undefined || fQuantity === undefined) ? 0 : fUnitPrice * fQuantity;
    },

    formatterCalculateTotal: function(aRows) {
      console.log(aRows);
      return 0;
    },

    onAddActionPress: function(oControlEvent) {
      //создать в базе данных, полученный объект вывести
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
