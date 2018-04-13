/* global sap $ Cookies window */
'use strict';

sap.ui.define([
	'sap/ui/core/mvc/Controller',
], function(Controller) {
	return Controller.extend('tms.basic.controller.InstanceController', {
    //TODO подель на очень простой контроллер, с дополнительными моделями и с дочерними моделями

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

      that.aConfigModels[0].id = sInstanceId;
      that.aConfigModels.forEach(e => {
        that.fnModelLoadData(e);
      });
    },

    _onBindingChange: function(oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display('notFound');
			}
		},

    fnModelLoadData: function(oConfig) {
      let that = this;
      let sName = oConfig.name;
      let sEntity = oConfig.entity;
      let sId = oConfig.id;
      let oFilter = oConfig.filter;
      let oModel = that.getModel(sName);
      if (!oModel) {
        oModel = that.setModel(new sap.ui.model.json.JSONModel(), sName).getModel(sName);
        if (that.onPropertyChange) oModel.attachPropertyChange(that.onPropertyChange, that);
      }
      
      oModel.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        (sEntity ? sEntity : sName) +
        (sId ? '/' + sId : '') +
        (oFilter ? '?filter=' + JSON.stringify(oFilter) : ''),
        '', false, 'GET', false, false,
      );
    },

    fnLoadInstance: function() {
      let that = this;
      that.fnModelLoadData(that.aConfigModels[0]);
    },

    fnSaveInstance: function() {
      let that = this;
      let oConfig = that.aConfigModels[0];

      //полуить клон
      let oData = _.cloneDeep(that.getModel(oConfig.name).getData());
      Object.assign(oData, {edit: false, draft: ''});

      //удалить все связи
      if (oConfig.filter && oConfig.filter.include) {
        oConfig.filter.include.map(e => e.relation).forEach(r => delete oData[r]);
      }

      $.ajax({
        url: that.getApiUri() + oConfig.entity + '/' + oConfig.id,
        method: 'PATCH',
        data: JSON.stringify(oData),
        contentType: 'application/json',
      }).done(function(data) {
        that.fnLoadInstance();
      });
    },

    fnPatchEdit: function(bEdit) {
      let that = this;
      let oConfig = that.aConfigModels[0];
      $.ajax({
        url: that.getApiUri() + oConfig.entity + '/' + oConfig.id,
        method: 'PATCH',
        data: JSON.stringify({edit: bEdit}),
        contentType: 'application/json',
      }).done(function(bEdit) {
        that.fnLoadInstance();
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