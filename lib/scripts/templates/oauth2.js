// OAuth2 template
module.exports = function(idValue, secretValue) { 
  // github - http://developer.github.com/
  var config = {};
  config.enabled=true;
  config.type='oauth-2.0';
  config.authorizationUrl = 'https://github.com/login/oauth/authorize';
  config.accessTokenUrl = 'https://github.com/login/oauth/access_token';
  config.baseUrl = 'https://api.github.com'; 
  config.defaultLoadUrl = '/user'; 
  config.userIdPath = 'login'; 
  config.clientId = idValue;
  config.clientSecret = secretValue;
  return config;
};
