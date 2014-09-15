// Littlebits API
// http://developer.littlebitscloud.cc/api-http
/* Can't make an application yet
module.exports = function(idValue, secretValue) { 
  var config = {};
  config.name='Littlebits';
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
*/

// but we have access to the bearer token 
module.exports = function(keyValue) {
  var config = {};
  config.name='Littlebits';
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'https://api-http.littlebitscloud.cc'; 
  config.keyName = 'Authorization';
  config.keyValue = 'Bearer ' + keyValue;
  config.isKeyInUrl = false;
  return config;
};
