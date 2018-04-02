'use strict';

module.exports = function(server) {
  var User = server.models.User;
  User.create({username: 'user', email: 'user@example.com', password: 'pass'});
  
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/api/', server.loopback.status());
  server.use(router);
};
