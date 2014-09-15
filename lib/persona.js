var appConfig = require('./config/persona-config'),
    https = require('https'),
    qs = require('qs');

var personaPlugin = {};

personaPlugin.login = function(req, res) {

  var assertion = req.body.assertion;

  var body = qs.stringify({
    assertion: assertion,
    audience: appConfig.hostUrl
  });

  var request = https.request({
    host: 'verifier.login.persona.org',
    path: '/verify',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'content-length': body.length
    }
  }, function(bidRes) {
     var data = "";
     bidRes.setEncoding('utf8');
     bidRes.on('data', function(chunk) {
       data += chunk;
     });
     bidRes.on('end', function(){
       var verified = JSON.parse(data);

       var verifiedEmail = undefined;
       if (verified.status == 'okay' && verified.email) {
         if(appConfig.allowedUsers && appConfig.allowedUsers.length>0) {
           for(var i=0;i<appConfig.allowedUsers.length;i++) {
             if(appConfig.allowedUsers[i] === verified.email) {
               verifiedEmail = verified.email; 
               break;
             }
           }
         }
         else {
          verifiedEmail = verified.email; 
         }
       }

       if(verifiedEmail) {
         req.session.user =  { 'id' : verifiedEmail };
         res.json(verified);
       } else {
         res.writeHead(403);
       }
      res.write(data);
      res.end();
    });
  });

  request.write(body);
  request.end();
};

personaPlugin.logout = function(req, res) {
    req.session.destroy();
    res.json({'status' : true});
};

module.exports = personaPlugin;
