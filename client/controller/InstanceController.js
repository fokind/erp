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
        that.sInstanceModelName + '/' +
        sInstanceId,
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
      let that = this;
      let oModel = that.getModel('Instance');
      oModel.setProperty('/edit', false);

      $.ajax({
        url: that.getApiUri() + that.sInstanceModelName + '/' + that.sInstanceId,
        method: 'PATCH',
        data: oModel.getJSON(),
        contentType: 'application/json',
      });
    },

    fnPatchEdit: function(bEdit) {
      let that = this;
      let sModel = 'Instance';
      let oModel = that.getModel(sModel);
      
      $.ajax(
        {
          url: that.getApiUri() + that.sInstanceModelName + '/' + oModel.getProperty('/id'),
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
      that.fnPatchEdit(false);
      that.fnInstanceModelLoadData();
      //that.loadAllData(that.getModel('Instance').getProperty('/id'));
    },

    onEditActionPress: function(oControlEvent) {
      this.fnPatchEdit(true);
    },

	});
});