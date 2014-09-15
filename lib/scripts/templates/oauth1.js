// OAuth1 template
module.exports =  function(idValue, secretValue) {
  // twitter - https://dev.twitter.com/docs/api/1.1
  var config = {};
  config.enabled=true;
  config.type='oauth-1.0';
  config.authorizationUrl = 'https://api.twitter.com/oauth/authorize';
  config.requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  config.accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  config.baseUrl = 'https://api.twitter.com/1.1'; 
  config.defaultLoadUrl = '/account/verify_credentials.json'; 
  config.userIdPath = 'screen_name'; 
  config.clientId = idValue;
  config.clientSecret = secretValue;
  return config;
};
