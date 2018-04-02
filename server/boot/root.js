'use strict';

module.exports = function(server) {
  var Employee = server.models.Employee;
  Employee.create({username: 'user', email: 'user@example.com', password: '1'});
  
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/api/', server.loopback.status());
  server.use(router);
};
