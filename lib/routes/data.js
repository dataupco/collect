var passport = require('../passport.js');
var storage = require('../storage.js');

module.exports = [ 
{
  method : 'GET',
  path : '/data',
  operation : function(req,res,next) { 

    if(req.session.user == undefined) {
      res.json({'error' : 'user not found'}, 401);
      return;
    }

    var meta = { 
      'user' : req.session.user.id
    };

    storage.queryUserData(meta,req.query, function(docs) {
      if(docs) {
        res.json({ 'count' : docs.length, 'data' : docs}); 
      }
      else {
        res.json({'error' : 'failed to query data'}, 500);
      }
    });
  }
},
{
  method : 'POST',
  path : '/data/:apiName/*',
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

    var findUserCallback = function(user) {
      if(user==undefined) {
        res.json({'error' : 'no auth found'}, 409);
        return;
      }

      var options = {};
      options.method = 'GET';
      options.uri = req.url.substring(6+apiName.length);

      var ingestionCallback = function(data) {
        if(!data) {
          res.json({'error' : 'failed to find data'}, 500);
          return;
        }

        // metadata to group ingestions with later
        var meta = { 
          'api' : user._api ? user._api : user.api, 
          'user' : req.session.user.id,
          'url' : options.uri
        };

        storage.ingestUserData(meta,data, function(docs) {
          if(Array.isArray(docs)) {
            res.json({ 'refs' : docs}); 
          }
          else {
            res.json({'error' : 'failed to save data'}, 500);
          }
        });
      };

      if(user.isComposite === true && user._id == undefined) {
        passport.handleComposite(apiName,options,req, function(data) {
          ingestionCallback(data);
        });  
      } else {
        passport.handleRequest(apiName,user,options, function(user,data) {
          ingestionCallback(data);
        });  
      }
    };

    passport.findUser(apiName,req,findUserCallback);
  }
}
];
