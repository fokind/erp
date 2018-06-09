'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
//var cookieParser = require('cookie-parser');

var app = module.exports = loopback();

//app.use(cookieParser);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

app.middleware('auth', (req, res, next) => {
  /*var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {*/
    //res.cookie('auth', 'dfksdfjhlsdjhflskjhf', {maxAge: 900000, httpOnly: true});
    //console.log('cookie created successfully');
  /*} 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } */
  next(); // <-- important!
});

/*app.use(loopback.token({
  model: app.models.accessToken,
}));*/

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
