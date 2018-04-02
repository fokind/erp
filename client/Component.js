/* global sap $ Cookies */
'use strict';

sap.ui.define([
  'sap/ui/core/UIComponent',
  'sap/ui/Device',
  'tms/basic/model/models',
], function(UIComponent, Device, models) {
  return UIComponent.extend('tms.basic.Component', {
    metadata: {
      manifest: 'json',
    },

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
    init: function() {
			// call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);
      var oRouter = this.getRouter();
      oRouter.initialize();

      //var oResourceBundle = this.getModel('i18n').getResourceBundle();

      // set the device model
      // this.setModel(models.createDeviceModel(), 'device');

      // проверка авторизации
      /*var oAccessToken = Cookies.getJSON('AccessToken');

      if (oAccessToken) {
        $.get({
          url: $.sap.formatMessage('{0}Users/{1}', [
            this.getMetadata()
              .getManifestEntry('sap.app').dataSources['api'].uri,
            oAccessToken.userId,
          ]),
          contentType: 'application/json',
          headers: {'Authorization': oAccessToken.id},
        })
        .done(function(data) {
          sap.m.MessageToast.show(oResourceBundle.getText('authSuccess'));
        })
        .fail(function(data) {
          Cookies.remove('AccessToken');
          oRouter.navTo('login');
        });
      } else oRouter.navTo('login');*/
    },

    getContentDensityClass: function() {
      if (!this._sContentDensityClass) {
        if (!sap.ui.Device.support.touch) {
          this._sContentDensityClass = 'sapUiSizeCompact';
        } else {
          this._sContentDensityClass = 'sapUiSizeCozy';
        }
      }
      return this._sContentDensityClass;
    },
  });
});
