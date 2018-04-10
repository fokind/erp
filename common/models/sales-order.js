'use strict';

module.exports = function(SalesOrder) {
  SalesOrder.observe('before save', function(ctx, next) {
    console.log(ctx.instance);
    next();
  })
}
