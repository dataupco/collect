// API key template
module.exports = function(keyValue) { 
  var config = {};
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'https://api.pearson.com'; 
  config.keyName = 'apikey'; 
  config.keyValue = keyValue; 
  config.isKeyInUrl = true; 
  return config;
};
