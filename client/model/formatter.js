/* global sap */
'use strict';

sap.ui.define([], function() {
  return {
    salesOrderRowTotal: function(fCost, fQuantity) {
      //TODO исправить проблему с русским форматом чисел (запятая вместо точки)
      return fCost * fQuantity;
    },
    
    salesOrderTotal: function(aRows) {
      var fTotal = 0;
      $.each(aRows, function(oRow) {
        fTotal = fTotal + (oRow.quantity * oRow.cost);
      }); //end of $each.
      return fTotal;
    }
  };
});
