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

    fnRowOpen: function(sPath) {
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
      oDialog.open();
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
      //простой вариант для бизнес-процесса реализации под заказа
      //при наполнении заказа товара еще нет, есть только наименование и характеристики
      //строки заказов появляются в хотелках для покупки товаров
      //в общем случае будем считать, что всегда сначала появляется запись в базе данных, а только после этого с ней начинается работа
      //чтобы запись в базе данных не была активной, она изначально удаленная и при первом сохранении пользователем становится неудаленной
      //чтобы можно было создать такую запись, в API не должно быть требований на заполненность полей, кроме тех, которые всегда должны быть заполненны по умолчанию, например автор изменений

      let that = this;
      const sRelationName = 'Rows';

      $.ajax({
        url: that.getApiUri() +
          that.sInstanceModelName +
          '/' + that.sInstanceId +
          '/' + sRelationName,
        method: 'POST',
        data: JSON.stringify({deleted: true}),
        contentType: 'application/json',
      }).done(function(data) {
        //изменить deleted на false
        data.deleted = false;
        //добавить в основную модель, запомнить, что здесь должно происходить аналогично простому открытию диалога

        let oModel = that.getModel('Instance');
        let aRows = oModel.getData().Rows;
        aRows.push(data);
        that.fnRowOpen('/' + sRelationName + '/' + aRows.indexOf(data));

      }).fail(function(data) {
        sap.m.MessageToast.show(that.getResourceBundle().getText('saveError'));
      }).always(function(data) {});
      

      //для бизнес-процесса реализации со склада:
      //условие, необходимые товары должны быть в списке товаров, если их нет, нужно завести
      //диалог селектор товара с поиском
      //после выбора товара открывается диалог редактирования строки
      //товар должен быть подключен в виде отношения к модели строки
      //только после этого выполняется метод POST
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
