// Littlebits API
// http://developer.littlebitscloud.cc/api-http
module.exports = function(idValue, secretValue) { 
  var config = {};
  config.enabled=true;
  config.type='oauth-2.0';
  config.authorizationUrl = 'https://littlebits.cc/oauth/authorize';
  config.accessTokenUrl = 'https://littlebits.cc/oauth/token';
  config.baseUrl = 'https://api-http.littlebitscloud.cc'; 
  config.defaultLoadUrl = '/devices'; 
  config.userIdPath = '0.user_id'; 
  config.clientId = idValue;
  config.clientSecret = secretValue;
  return config;
};
