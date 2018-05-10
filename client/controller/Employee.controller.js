/* global sap $ Cookies window JSON */
'use strict';

sap.ui.define([
  'tms/basic/controller/InstanceRelationsController',
  'sap/ui/model/json/JSONModel',
	"tms/basic/model/formatter"
], function(Controller, JSONModel, formatter) {
  return Controller.extend('tms.basic.controller.Employee', {
    formatter: formatter,

    onInit: function() {
      let that = this;
      that.setModel(new JSONModel(), 'view');
      that.getRouter().getRoute('employee').attachPatternMatched(that._onRoutePatternMatched, that);
    },

    _onRoutePatternMatched: function(oEvent) {
      let that = this;
      
      let oViewModel = that.getModel('view');
      let sId = oEvent.getParameter('arguments').id;
      oViewModel.setProperty('/id', sId);

      var oView = that.getView();
      oView.bindElement('/Employees(\'' + sId + '\')');
    },
  });
});
