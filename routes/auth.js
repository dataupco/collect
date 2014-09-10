var passport = require('../passport.js');

module.exports = [ 
{
  method : 'POST',
  path : '/auth/:apiName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    if(!passport.hasApi(apiName)) {
      res.json({'error' : 'api not found'}, 404);
      return;
    }

    var api = passport.apiDetails(apiName);
    if(!api || !api.authRequired) {
      res.json({'error' : 'api does not require auth'}, 409);
      return;
    }

    passport.auth(apiName,
                  { 'req' : req, 'res' : res, 'next' : next }); 
  }
},
{
  method : 'DELETE',
  path : '/auth/:apiName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    if(!passport.hasApi(apiName)) {
      res.json({'error' : 'api not found'}, 404);
      return;
    }

    passport.removeUser(apiName,req, function(err, count) {
      if(err || count>1) {
        res.json({'error' : 'failed to remove user'}, 500);
      }
      else {
        res.json({'api' : apiName, removed : count!==0 });
      }
    });
  }
},
{
  method : 'GET',
  path : '/auth',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apis = passport.allApiDetails();
    var response = [];
    var findApiUser = function(api) {
      passport.findUser(api.id,req,function(user) {
        response.push({ 'id' : api.id, 'name' : api.name, 
                        'enabled' : user != undefined, 
                        'authRequired' : api.authRequired,
                        'isWebhook' : api.isWebhook
                      });
        if(apis.length==response.length) {
          // keep these in order by api name
          response.sort(function(a,b) {
            a = a.id;
            b = b.id;
            if(a===b) return 0;
            if(a<b) return -1;
            else return 1;
          });
          res.json(response);
        }
      });
    };

    for(var i=0;i<apis.length;i++) {
     findApiUser(apis[i]);
    }
  }
},
{
  method : 'GET',
  path : '/auth/:apiName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api) {
      res.json({'error' : 'api not found'}, 404);
      return;
    }

    var findUserCallback = function(user) {
      res.json({ 'id' : api.id, 'name' : api.name, 
                 'enabled' : user != undefined, 
                 'authRequired' : api.authRequired, 
                 'isWebhook' : api.isWebhook
               });
    };
    passport.findUser(apiName,req,findUserCallback);
  }
},
{
  method : 'GET',
  path : '/auth/:apiName/callback',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    if(!passport.hasApi(apiName)) {
      res.json({'error' : 'api not found'}, 404);
      return;
    }

    passport.authCallback(apiName,
                  { 'successUrl' : '/#authsuccess', 'failureUrl' : '/#authfailure' },
                  { 'req' : req, 'res' : res, 'next' : next }); 
  }
}
];
