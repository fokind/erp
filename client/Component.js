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
