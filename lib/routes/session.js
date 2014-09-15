var persona = require('../persona.js');

module.exports = [ 
{
  method : 'POST',
  path : '/session',
  operation : function(req,res,next) { 

    if(req.session.user) {
      res.json({ email : req.session.user.id });
    }
    else {
      persona.login(req,res); 
    }
  }
},
{
  method : 'DELETE',
  path : '/session',
  operation : persona.logout 
},
{
  method : 'GET',
  path : '/session',
  operation : function(req,res,next) { 

    res.json({ 'user' : req.session.user });
  }
}
];

