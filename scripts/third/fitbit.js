module.exports = function(idValue, secretValue) {
  // fitbit - https://wiki.fitbit.com/display/API/Fitbit+API
  var config = {};
  config.enabled=true;
  config.type='oauth-1.0';
  config.authorizationUrl = 'https://www.fitbit.com/oauth/authorize';
  config.requestTokenUrl = 'https://api.fitbit.com/oauth/request_token';
  config.accessTokenUrl = 'https://www.fitbit.com/oauth/access_token';
  config.baseUrl = 'https://api.fitbit.com/1'; 
  config.defaultLoadUrl = '/user/-/profile.json'; 
  config.userIdPath = 'user.encodedId'; 
  config.clientId = idValue;
  config.clientSecret = secretValue; 
  return config;
};

