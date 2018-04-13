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
      let oFilter = oConfig.filter;
      let oModel = that.getModel(sName);
      if (!oModel) oModel = that.setModel(new sap.ui.model.json.JSONModel(), sName).getModel(sName);

      let m = this.getOwnerComponent().getModel('SalesOrders');

      m.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        (sEntity ? sEntity : sName) +
        (oFilter ? '?filter=' + JSON.stringify(oFilter) : ''),
        '', false, 'GET', false, false,
      );
      
      console.log(m);//использовать глобоальную модель!!!!!!!!!!!

      oModel.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        (sEntity ? sEntity : sName) +
        (oFilter ? '?filter=' + JSON.stringify(oFilter) : ''),
        '', false, 'GET', false, false,
      );
    },

    fnAddInstance: function() {
      let that = this;
      let oConfig = that.aConfigModels[0];
      let sName = oConfig.name;
      let oFilter = oConfig.filter;

      $.ajax({
        url: that.getApiUri() + sName,
        method: 'POST',
        data: JSON.stringify({deleted: false}),
        contentType: 'application/json',
      }).done(function(data) {
        $.ajax({
          url: that.getApiUri() + sName + '/' + data.id +
          (oFilter ? '?filter=' + JSON.stringify(oFilter) : ''),
          method: 'GET',
          contentType: 'application/json',
        }).done(function(data) {
          let oModel = that.getModel(sName);
          oModel.getData().push(data);
          oModel.refresh();
        });
      });
    },

    fnDeleteInstance: function(sId) {
      let that = this;
      let oConfig = that.aConfigModels[0];
      let sName = oConfig.name;

      $.ajax({
        url: that.getApiUri() + sName + '/' + sId,
        method: 'PATCH',
        data: JSON.stringify({deleted: true}),
        contentType: 'application/json',
      }).done(function(data) {
        let oModel = that.getModel(sName);
        let aData = oModel.getData();

        let iIndex = _.findIndex(aData, function(e) { return e.id == data.id; });
        aData.splice(iIndex, 1);
        oModel.refresh();
      });
    },
	});
});