/* global sap $ Cookies window */
'use strict';

sap.ui.define([
  'sap/ui/core/mvc/Controller',
], function(Controller) {
  return Controller.extend('tms.basic.controller.Department', {
    onInit: function() {
      let that = this;
      // that.getView().setModel(new sap.ui.model.json.JSONModel());
      let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
      oRouter.getRoute('department').attachPatternMatched(that._onRouteMatched, that);
    },

    _onRouteMatched: function(oEvent) {
      this.update(oEvent.getParameter('arguments').departmentId);
    },

    update: function(departmentId) {
      let that = this;
      let oModel = that.getOwnerComponent().getModel('Department');
      oModel.loadData(
        $.sap.formatMessage(
          '{0}Departments/{1}', [
            that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri'),
            departmentId,
          ]
        ),
        '', true, 'GET', false, false,
      );
    },

    onNavBack: function() {
      let that = this;
      let oHistory = sap.ui.core.routing.History.getInstance();
      let sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        oRouter.navTo('departments', {}, true);
      }
    },

    onEditActionPress: function(oControlEvent) {
      this.edit(true);
    },

    onSaveActionPress: function(oControlEvent) {
      let that = this;
      let oModel = that.getOwnerComponent().getModel('Department');
      oModel.setProperty('/edit', false);

      // сохранить изменения
      $.ajax(
        {
          url: $.sap.formatMessage(
            '{0}Departments/{1}', [
              that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri'),
              oModel.getProperty('/id')
            ]
          ),
          method: 'PATCH',
          data: oModel.getJSON(),
          contentType: 'application/json',
        })
      .done(function(data, status, xhr) {
        sap.m.MessageToast.show(that.getView().getModel('i18n').getResourceBundle().getText('saveSuccess'));
      })
      .fail(function(data) {
        sap.m.MessageToast.show(that.getView().getModel('i18n').getResourceBundle().getText('saveError'));
      });
    },

    edit: function(bEdit) {
      let that = this;
      let oModel = that.getOwnerComponent().getModel('Department');
      
      $.ajax(
        {
          url: $.sap.formatMessage(
            '{0}Departments/{1}', [
              that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri'),
              oModel.getProperty('/id')
            ]
          ),
          method: 'PATCH',
          data: $.sap.formatMessage(
            '\'{\'"edit":{0}\'}\'',
            bEdit,
          ),
          contentType: 'application/json',
        })
      .done(function(data, status, xhr) {
        oModel.setProperty('/edit', bEdit);
        sap.m.MessageToast.show(that.getView().getModel('i18n').getResourceBundle().getText('saveSuccess'));
      })
      .fail(function(data) {
        sap.m.MessageToast.show(that.getView().getModel('i18n').getResourceBundle().getText('saveError'));
      });
    },
    
    onCancelActionPress: function(oControlEvent) {
      let that = this;
      that.edit(false);
      that.update(that.getOwnerComponent().getModel('Department').getProperty('/id'));
    },
  });
});
