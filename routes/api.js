var passport = require('../passport.js');

module.exports = [ 
{
  method : 'GET',
  path : '/api/:apiName/*',
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
      options.uri = req.url.substring(5+apiName.length);

      var jsonp = req.query.jsonp;
      var jsonpResponse = null;
      if(jsonp) {
        var paramString = passport.findParamStringInUri('jsonp', jsonp, options.uri);
        options.uri = options.uri.replace(paramString,'');

        jsonpResponse = function(data) {
            res.header('Content-Type','application/javascript');
            res.header('charset','utf-8');
            res.send(jsonp + '(' + JSON.stringify(data) + ');'); 
        };
      }

      if(user.isComposite === true && user._id == undefined) {
        passport.handleComposite(apiName,options,req, function(data) {
          if(jsonp) {
            jsonpResponse(data);
          }
          else {
            res.json(data); 
          }
        });  
      } else if(user._id && options.uri == '/') {
        if(jsonp) {
          jsonpResponse(user.profile);
        }
        else {
          res.json(user.profile);
        }
      } else {
        passport.handleRequest(apiName,user,options, function(user,data) {
          if(jsonp) {
            jsonpResponse(data);
          }
          else {
            res.json(data); 
          }
        });  
      }
    };

    passport.findUser(apiName,req,findUserCallback);
  }
}
];
