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

      let m = this.getOwnerComponent().getModel('SalesOrders');
      console.log(m);//прибиндить из главного списка



      var oRouter = that.getRouter();
      oRouter.attachRoutePatternMatched(that._onRouteMatched, that);
    },

    onPropertyChange: function(oEvent) {
      let oContext = oEvent.getParameter('context');
      if (oContext && /^\/Rows\//.exec(oContext.sPath)) {
        let that = this;
        let oModel = that.getModel('Instance');
        console.log(oModel);
        let aRows = oModel.getProperty('/Rows');
        console.log(aRows);
        let fTotal = _.sum(aRows
          .filter(e => !e.deleted &&
            !isNaN(e.quantity) &&
            !isNaN(e.unitPrice))
          .map(e => e.quantity * e.unitPrice));
        oModel.setProperty('/total', fTotal);
      };
    },

    onCancelActionPress: function(oControlEvent) {
      this.fnPatchEdit(false);
    },
    

    onRowDetailPress: function(oControlEvent) {
      //при открытии диалога передавать клон связанного элемента
      //при закрытии копировать клон в модель сущности
      let that = this;
      //let oContext = oControlEvent.getSource().getBindingContext('Instance');
      
      //let sPath = oContext.getPath();
      ///oControlEvent.getSource().getBindingContext('Instance').sPath;
      //this.fnRowOpen(sPath);

      //let that = this;
      //const sModelName = 'Instance';//TODO заменить на модель по умолчанию
      //заблокировать для остальных пользователей (весь заказ, включая дочерние объекты должен считаться заблокированным)

      var oView = that.getView();
      let oContext = oControlEvent.getSource().getBindingContext('Instance');
      var oDialog = oView.byId('salesOrderRowDialog');

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.SalesOrderRowDialog', that);
        oView.addDependent(oDialog);
      }

      oDialog.bindElement({model: 'Instance', path: oContext.sPath});
      oDialog.addStyleClass('sapUiSizeCompact');
      oDialog.open();
    },

    onSaveActionPress: function(oControlEvent) {
      //сохранить строки
      this.fnRowsSave();
      //сохранить сам элемент
      this.fnSaveInstance();
    },

    onDeleteRow: function(oControlEvent) {
      //пометить как удаленный
      let o = oControlEvent.getParameters('listItem');
      let oBindingContext = o.listItem.getBindingContext('Instance');
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;
      //let o1 = oModel.getObject(sPath);
      //o1.deleted = true;

      //плохо работает нотификация вложенных объектов
      
      oModel.setProperty(sPath + '/deleted', true);
      oModel.firePropertyChange({
        path: sPath + '/deleted',
        value: true
      });
      //oModel.refresh();
    },

		fnRowsSave: function() {
      let that = this;
      let aRows = that.getModel('Instance').getProperty('/Rows');
      let sParentId = that.aConfigModels[0].id;
      aRows.forEach(function(oRow) {
        oRow.parentId = sParentId;
        $.ajax({
          url: that.getApiUri() + 'SalesOrderRows/replaceOrCreate',
          method: 'POST',
          data: JSON.stringify(oRow),
          contentType: 'application/json'
        });
      });

    },

    fnRowOpen: function(oRow) {
      let that = this;
      //let oContext = oControlEvent.getSource().getBindingContext('Instance');
      
      //let sPath = oContext.getPath();
      ///oControlEvent.getSource().getBindingContext('Instance').sPath;
      //this.fnRowOpen(sPath);

      //let that = this;
      //const sModelName = 'Instance';//TODO заменить на модель по умолчанию
      //заблокировать для остальных пользователей (весь заказ, включая дочерние объекты должен считаться заблокированным)

      var oView = that.getView();
      var oDialog = oView.byId('salesOrderRowDialog');

      if (!oDialog) {
        oDialog = sap.ui.xmlfragment(oView.getId(), 'tms.basic.view.SalesOrderRowDialog', that);
        oView.addDependent(oDialog);
      }

      //let oRow = that.getModel(sModelName).getProperty(sPath);
      //let oData = _.cloneDeep(oRow);
      
      //oDialog.setModel(new sap.ui.model.json.JSONModel(oData), 'Row');
      //oDialog.setModel(oContext.oModel, 'Instance');
      let aRows = this.getModel('Instance').getProperty('/Rows');
      let sPath = '/Rows/' + aRows.indexOf(oRow);

      oDialog.bindElement({model: 'Instance', path: sPath});
      oDialog.addStyleClass('sapUiSizeCompact');
      oDialog.open();
    },

    onRowAccept: function(oControlEvent) {
      let oDialog = oControlEvent.getSource().oParent;
      oDialog.close();
    },

		onRowSave: function(oControlEvent) {
      let that = this;
      const sRelationName = 'Rows';
      let oBindingContext = oControlEvent.getSource().oParent.getBindingContext('Instance');
      let sPath = oBindingContext.sPath;
      let oModel = oBindingContext.oModel;
      let oData = oModel.getProperty(sPath);

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
      /*let that = this;
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
      }*/
      oControlEvent.getSource().oParent.close();
      //this.getView().byId('salesOrderRowDialog').close();
    },
    
    formatterCalculateRowTotal: function(fUnitPrice, fQuantity) {
      return (fUnitPrice === undefined || fQuantity === undefined) ? 0 : fUnitPrice * fQuantity;
    },

    formatterCalculateTotal: function(aRows) {
      console.log(aRows);
      return 0;
    },

    onEditActionPress: function() {
      this.fnPatchEdit(true);
    },

    onAddActionPress: function() {
      let that = this;

      let oModel = that.getModel('Instance');
      let aRows = oModel.getProperty('/Rows');

      let oConfig = that.aConfigModels[0];
      let sEntity = oConfig.entity;
      let sId = oConfig.id;
      let sRelation = oConfig.filter.include[0].relation;

      $.ajax({
        url: that.getApiUri() + sEntity + '/' + sId + '/' + sRelation,
        method: 'POST',
        contentType: 'application/json',
      }).done(function(data) {
        data.deleted = false;
        aRows.push(data);
        oModel.refresh();
        that.fnRowOpen(data);
      });
    },

    onAddActionPress2: function(oControlEvent) {
      //создать в базе данных, полученный объект вывести
      let that = this;
      let oModel = that.getModel('Instance');
      let aRows = oModel.getProperty('/Rows');

      let oConfig = that.aConfigModels[0];
      let sEntity = oConfig.entity;
      let sId = oConfig.id;
      let sRelation = oConfig.filter.include[0].relation;

      $.ajax({
        url: that.getApiUri() + sEntity + '/' + sId + '/' + sRelation,
        method: 'POST',
        data: JSON.stringify({deleted: false}),
        contentType: 'application/json',
      }).done(function(data) {
        aRows.push(data);
        that.fnRowOpen('/Rows/' + aRows.indexOf(data), true);
      });
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
