/* global sap */
'use strict';

sap.ui.define([
	'tms/basic/controller/InstanceController',
], function(Controller) {
	return Controller.extend('tms.basic.controller.InstanceRelationsController', {
    fnRelationModelSetData: function(sRelationName) {
      /*let that = this;
      let oRelationModel = that.getModel(sRelationName);
      if (!oRelationModel) oRelationModel = that.setModel(new sap.ui.model.json.JSONModel(), sRelationName).getModel(sRelationName);
      let oModel = that.getModel('Instance');
      let aRelation = oModel.getProperty('/' + sRelationName);
      oRelationModel.setData(aRelation ? aRelation : []);*/
    },

    fnRelationModelLoadData: function(sRelationName) {
      /*let that = this;
      let oModel = that.getModel(sRelationName);
      if (!oModel) oModel = that.setModel(new sap.ui.model.json.JSONModel(), sRelationName).getModel(sRelationName);

      oModel.loadData(
        that.getOwnerComponent().getManifestEntry('/sap.app/dataSources/api/uri') +
        that.sInstanceModelName + '/' +
        that.sInstanceId + '/' +
        sRelationName,
        '', true, 'GET', false, false,
      );*/
    },
	});
});