var passport = require('../passport.js');
var storage = require('../storage.js');
var crypto = require('crypto');
var basicauth = require('basic-auth');

module.exports = [ 
{
  method : 'GET',
  path : '/hook/:apiName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api || !api.isWebhook) {
      res.json({'error' : 'hook not found'}, 404);
      return;
    }

    var params = {
      'user' : req.session.user.id,
      'api' : apiName
    };

    storage.findUserHooks(params, function(err, hooks) {
      if(err) {
        res.json({'error' : 'failed to find hook'}, 500);
      }
      else {
        res.json(hooks);
      }
    });
  }
},
{
  method : 'POST',
  path : '/hook/:apiName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api || !api.isWebhook) {
      res.json({'error' : 'hook not found'}, 404);
      return;
    }

    var username = crypto.randomBytes(8).toString('hex');
    var password = crypto.randomBytes(8).toString('hex');
    var timestamp = new Date().getTime();

    var hook = {
      'user' : req.session.user.id,
      'api' : apiName,
      'login' : { 'name' : username, 'pass' : password },
      'createdAt' : timestamp 
    };

    storage.saveUserHook(hook, function(err, hook) {
      if(err) {
        res.json({'error' : 'failed to create hook'}, 500);
      }
      else {
        res.json(hook);
      }
    });
  }
},
{
  method : 'DELETE',
  path : '/hook/:apiName/:hookName',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api || !api.isWebhook) {
      res.json({'error' : 'hook not found'}, 404);
      return;
    }

    var hookName = req.param('hookName');
    var hook = {
      '_id' : hookName,
      'user' : req.session.user.id,
      'api' : apiName
    };

    storage.removeUserHook(hook, function(err,count) {
      if(err || count>1) {
        res.json({'error' : 'failed to remove hook'}, 500);
      }
      else {
        res.json({ 'hook' : hookName, 'removed' : count!==0 });
      }
    });
  }
},
// endpoint for testing basic auth on hook
{
  method : 'GET',
  path : '/hook/:apiName/:hookName',
  operation : function(req,res,next) { 

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api || !api.isWebhook) {
      res.send(404);
      return;
    }

    var hookName = req.param('hookName');
    var params = {
      '_id' : hookName,
      'api' : apiName
    };

    storage.findUserHook(params, function(err, hook) {
      if(err || !hook) {
        res.send(404);
      }
      else if(api.useApiKey===true) {
        var credentialParam = req.query.apikey;
        var hookUser = hook.login;
        var credential = hookUser.name + hookUser.pass;
        if(!credentialParam || credential !== credentialParam) { 
          res.send(401);
        }
        else {
          res.send(200);
        }
      }
      else {
        var authUser = basicauth(req);
        var hookUser = hook.login;
        if(!authUser || authUser.name !== hookUser.name 
                     || authUser.pass !== hookUser.pass ) {
          res.setHeader('WWW-Authenticate', 'Basic realm="'+apiName +' hook - '+hookName+'"');
          res.send(401);
        }
        else {
          res.send(200);
        }
      }
    });
  }
},
// basic auth required unless api specifies useApiKey
{
  method : 'POST',
  path : '/hook/:apiName/:hookName',
  operation : function(req,res,next) { 

    var apiName = req.param('apiName');
    var api = passport.apiDetails(apiName);
    if(!api || !api.isWebhook) {
      res.send(404);
      return;
    }

    var hookName = req.param('hookName');
    var params = {
      '_id' : hookName,
      'api' : apiName
    };

    storage.findUserHook(params, function(err, hook) {
      if(err) {
        res.send(500);
        return;
      }
      else if(!hook) {
        res.send(404);
        return;
      }

      if(api.useApiKey===true) {
        var credentialParam = req.query.apikey;
        var hookUser = hook.login;
        var credential = hookUser.name + hookUser.pass;
        if(!credentialParam || credential !== credentialParam) { 
          res.send(401);
          return;
        }
      }
      else {
        var authUser = basicauth(req);
        var hookUser = hook.login;
        if(!authUser || authUser.name !== hookUser.name 
                     || authUser.pass !== hookUser.pass ) {
          res.setHeader('WWW-Authenticate', 'Basic realm="'+apiName +' hook - '+hookName+'"');
          res.send(401);
          return;
        }
      }

      req.user = { 'id' : hook.user }; 

      var options = {};
      options.method = 'POST';
      options.uri = req.url.substring(6+apiName.length);

      passport.handleWebhook(apiName,options,req, function(data) {
        if(data) {
          res.json(data); 
        }
        else{
          res.send(200); // need a way to tell error vs no data
        }
      });  
    });
  }
}
];
