/* global sap */
'use strict';

sap.ui.define([], function() {
  return {
    salesOrderRowTotal: function(sCost, sQuantity) {
      let fTotal = 0;
      if (sCost && sQuantity) {
        let oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance();
        let fCost = oFloatFormat.parse(sCost);
        let fQuantity = oFloatFormat.parse(sQuantity);
        let fTotal = fQuantity * fCost;
      }

      return fTotal;
    },
  };
});
