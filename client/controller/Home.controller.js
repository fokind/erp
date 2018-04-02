/* global sap */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Home', {
    onPress: function(oEvent) {
      sap.ui.core.UIComponent.getRouterFor(
        this.getView()).navTo(oEvent.getSource().data('target')
      );
    },
  });
});
