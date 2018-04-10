/* global sap $ Cookies window */
'use strict';

sap.ui.define([
	'sap/ui/core/mvc/Controller',
], function(Controller) {
	return Controller.extend('tms.basic.controller.InstanceController', {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getApiUri: function() {
			return this.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri');
		},

    /**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel('i18n').getResourceBundle();
    },

    _onRouteMatched: function(oEvent) {
      let that = this;
      let sInstanceId = oEvent.getParameter('arguments').id;
      let sInstanceModelName = that.sInstanceModelName;
      let oView = that.getView();

      that.sInstanceId = sInstanceId;
      that.fnLoadData(sInstanceId);
    },

    _onBindingChange: function(oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display('notFound');
			}
		},

    fnLoadData: function(sId) {
      let that = this;

      that.fnInstanceModelLoadData();
      if (that.aRelations) that.aRelations.forEach(function(relation) { that.fnRelationModelLoadData(relation.name); });
      if (that.aModels) that.aModels.forEach(function(model) { that.fnModelLoadData(model.name); });
    },

    fnInstanceModelLoadData: function() {
      let that = this;
      let sInstanceModelName = that.sInstanceModelName;
      let sInstanceId = that.sInstanceId;
      that.getModel('Instance').loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        that.sInstanceModelName +
        '/' + sInstanceId +
        (that.oInstanceFilter ? '?filter=' + JSON.stringify(that.oInstanceFilter) : ''),
        '', true, 'GET', false, false,
      );
    },

    fnRelationModelLoadData: function(sRelationName) {
      let that = this;
      let oModel = that.getModel(sRelationName);
      if (!oModel) oModel = that.setModel(new sap.ui.model.json.JSONModel(), sRelationName).getModel(sRelationName);

      oModel.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        that.sInstanceModelName + '/' +
        that.sInstanceId + '/' +
        sRelationName,
        '', true, 'GET', false, false,
      );
    },

    fnModelLoadData: function(sModelName) {
      let that = this;
      let oModel = that.getModel(sModelName);
      if (!oModel) oModel = that.setModel(new sap.ui.model.json.JSONModel(), sModelName).getModel(sModelName);

      oModel.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        sModelName,
        '', true, 'GET', false, false,
      );
    },

    navBack: function(sPrev) {
      let that = this;
      let oHistory = sap.ui.core.routing.History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo(sPrev, {}, true);
      }
    },

    onSaveActionPress: function(oControlEvent) {
      this.fnSave();
    },

    fnSave: function() {
      /*
      из черновика скопировать в основную модель
      ссылку на черновик удалить
      модель сохранить
      */
      let that = this;
      let oModel = that.getModel('Instance');
      
      oModel.setProperty('/deleted', false);
      oModel.setProperty('/draft', false);

      let oData = oModel.getData();
      var oInstanceData = _.cloneDeep(oData);

      if (that.aRelationNames) {
        that.aRelationNames.forEach(function(relationName) {
          delete oInstanceData[relationName];
        });
      }
      
      $.ajax({
        url: that.getApiUri() + that.sInstanceModelName + '/' + that.sInstanceId,
        method: 'PATCH',
        data: JSON.stringify(oInstanceData),
        contentType: 'application/json',
      });
    },

    fnSave2: function() {
      /*
      из черновика скопировать в основную модель
      ссылку на черновик удалить
      модель сохранить
      */
      let that = this;
      let oModel = that.getModel('Instance');
      
      oModel.setProperty('/draftId', null);
      oModel.setProperty('/deleted', false);

      let oData = oModel.getData();
      var oInstanceData = _.cloneDeep(oData);
      var aRows = oData.Rows;
      var sRelationName = 'Rows';//TODO обобщить

      aRows.forEach(function(row) {
        $.ajax({
          url: that.getApiUri() +
            that.sInstanceModelName + '/' + that.sInstanceId + '/' +
            sRelationName + '/' + oModel.getProperty(sPath + '/id'),
          method: 'PUT',
          data: JSON.stringify(row),
          contentType: 'application/json',
        });
      });

      that.aRowsRelationNames.forEach(function(relationName) {
        delete oInstanceData[relationName];
      });
      
      //deepClone
      //все связи сохранить отдельно, т.к. некоторые могут быть новыми, а некоторые уже существовать
      //удалить все связи
      //только после этого сохранить сам объект



      $.ajax({
        url: that.getApiUri() + that.sInstanceModelName + '/' + that.sInstanceId,
        method: 'PATCH',
        data: oModel.getJSON(),
        contentType: 'application/json',
      });//после этого можно удалить черновик
    },

    //работает
    onCancelActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getModel('Instance');

      $.ajax({
        url: that.getApiUri() + that.sInstanceModelName + '/' + oModel.getProperty('/id'),
        method: 'PATCH',
        data: JSON.stringify({draft: false}),
        contentType: 'application/json',
      }).done(function(data) {
        that.fnInstanceModelLoadData();
      });
    },

    //работает
    onEditActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getModel('Instance');

      //проверить наличие черновика

      $.ajax({
        url: that.getApiUri() + 'Drafts/',
        method: 'POST',
        data: JSON.stringify({instance: oModel.getJSON()}),
        contentType: 'application/json',
      }).done(function(data) {
        $.ajax({
          url: that.getApiUri() + that.sInstanceModelName + '/' + oModel.getProperty('/id'),
          method: 'PATCH',
          data: JSON.stringify({
            draftId: data.id,
            draft: true,
          }),
          contentType: 'application/json',
        });
        that.fnInstanceModelLoadData();
      });
    },

    //должно выполняться в фоновом режиме постоянно после каждого изменения
    fnSaveDraft: function() {
      let that = this;
      let oModel = that.getModel('Instance');
      let oData = oModel.getData();
      let oDraft = {
        instance: JSON.stringify(oData),
        modelName: that.sInstanceModelName,
        instanceId: that.sInstanceId,
      };
      $.ajax({
        url: that.getApiUri() + 'drafts/' + oData.draftId,
        method: 'POST',
        data: JSON.stringify(oDraft),
        contentType: 'application/json',
      });
    },

    //работает
    fnLoadDraft: function() {
      let that = this;
      $.ajax({
        url: that.getApiUri() + that.sInstanceModelName + '/' + that.sInstanceId + '/draft',
        method: 'GET',
        contentType: 'application/json',
      }).done(function(data) {
        that.getModel('Instance').setJSON(data.instance);
      });
    },
	});
});