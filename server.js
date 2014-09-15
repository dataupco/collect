#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');
var persona = require('./lib/persona.js');
var passport = require('./lib/passport.js');
var storage = require('./lib/storage.js');
var commonConfig = require('./lib/config/common-config.js');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        // OPENSHIFT_INTERNAL_ is and old convention. OPENSHIFT_NODEJS_ is the new one
        self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

        self.dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST;
        self.dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT;

        if(typeof self.dbHost === "undefined") {
          console.warn('No OPENSHIFT_MONGO_DB_HOST var, using 127.0.0.1');
          self.dbHost = '127.0.0.1';
          self.dbPort = '27017';
        }

        self.dbServer = new mongodb.Server(self.dbHost, parseInt(self.dbPort));
        self.db = new mongodb.Db(commonConfig.db, self.dbServer, {auto_reconnect: true});
        self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
        self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_INTERNAL_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
        self.routes.get = { };
        self.routes.post = { };
        self.routes.del = { };

        self.routes.get['/status'] = function(req, res) {
          res.send('ok');
        };

        self.routes.get['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        addRoutes(require('./lib/routes/session.js'));
        addRoutes(require('./lib/routes/api.js'));
        addRoutes(require('./lib/routes/auth.js'));
        addRoutes(require('./lib/routes/data.js'));
        addRoutes(require('./lib/routes/hook.js'));

    };

    function addRoutes(routes) {
        for(var i=0;i<routes.length;i++) {
          var route = routes[i];
          switch(route.method) {
            case 'GET':
              self.routes.get[route.path] = route.operation;
              break;
            case 'POST':
              self.routes.post[route.path] = route.operation;
              break;
            case 'DELETE':
              self.routes.del[route.path] = route.operation;
              break;
          }
        }

    }

    // PERSONA CAN'T SWITCH BETWEEN HTTP AND HTTPS
    // https://www.openshift.com/kb/kb-e1044-how-to-redirect-traffic-to-https
    function redirectSec(req, res, next) {
      if (req.headers['x-forwarded-proto'] == 'http') { 
        res.redirect('https://' + req.headers.host + req.url);
      } else {
        return next();
      }
    }

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
        self.app.configure(function() {
          self.app.use(express.bodyParser());
          self.app.use(express.cookieParser());
          self.app.use(express.session({ secret: 'keep-this-private' }));
          self.app.use(express.static(__dirname + '/public'));

          storage.init(self.app, self.db);
          passport.init(self.app, storage);
        });

        //  Add handlers for the app (from the routes).
        // get only
        for (var r in self.routes.get) {
            self.app.get(r, redirectSec, self.routes.get[r]);
        }
        //post only
        for (var r in self.routes.post) {
            self.app.post(r, self.routes.post[r]);
        }
        //del only
        for (var r in self.routes.del) {
            self.app.del(r, self.routes.del[r]);
        }

    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        self.db.open(function(err, db){
          if(err){ throw err };
          self.db.authenticate(self.dbUser, self.dbPass, function(err, res){
            if(err){ throw err };
          });
        });
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };


};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

