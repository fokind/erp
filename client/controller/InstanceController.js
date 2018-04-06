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
      
      that.sInstanceId = sInstanceId;
      that.loadAllData(sInstanceId);
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
      let that = this;
      //let oModel = that.getOwnerComponent().getModel('Employee');
      let oModel = that.getModel('Instance');
      oModel.setProperty('/edit', false);

      // сохранить изменения
      $.ajax({
        url: that.getApiUri() + this.modelName + '/' + oModel.getProperty('/id'),
        method: 'PATCH',
        data: oModel.getJSON(),
        contentType: 'application/json',
      });
    },

    patchEdit: function(bEdit) {
      let sModel = 'Instance';
      let sModelPlural = this.modelName;
      let that = this;
      let oModel = that.getModel(sModel);
      
      $.ajax(
        {
          url: that.getApiUri() + sModelPlural + '/' + oModel.getProperty('/id'),
          method: 'PATCH',
          data: '{"edit":' + bEdit + '}',
          contentType: 'application/json',
        })
      .done(function(data, status, xhr) {
        oModel.setProperty('/edit', bEdit);
      });
    },
    
    onCancelActionPress: function(oControlEvent) {
      let that = this;
      that.patchEdit(false);
      that.loadAllData(that.getModel('Instance').getProperty('/id'));
    },
    
    loadAllData: function(sId) {
      let that = this;
      //that.modelLoadData('Instance', that.modelName, sId);
      that.fnInstanceModelLoadData();//сейчас работает только с заказами!!!!

      that.aRelations.forEach(function(relation) { that.fnRelationModelLoadData(relation.name); });

      that.models.forEach(function(model) { that.modelLoadData(model); });
    },

    fnInstanceModelLoadData: function() {
      let that = this;
      that.getModel('Instance').loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        that.sInstanceModelName + '/' +
        that.sInstanceId,
        '', true, 'GET', false, false,
      );
    },

    fnRelationModelLoadData: function(sRelationName) {
      let that = this;
      that.getModel('Instance').loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        that.sInstanceModelName + '/' +
        that.sInstanceId + '/' +
        sRelationName,
        '', true, 'GET', false, false,
      );
    },

    modelLoadData: function(sModel, sModelPlural, sId) {
      let that = this;
      that.getModel(sModel).loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
          (sModelPlural !== undefined ? sModelPlural : sModel) +
          (sId !== undefined ? ('/' + sId) : ''),
        '', true, 'GET', false, false,
      );
    },

    onEditActionPress: function(oControlEvent) {
      this.patchEdit(true);
    },

	});
});