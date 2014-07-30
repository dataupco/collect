module.exports = function(keyValue) { 
  var config = {};
  config.name='Colorado Information Marketplace';
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'http://data.colorado.gov/resource'; 
  config.keyName = 'X-App-Token'; 
  config.keyValue = keyValue; 
  config.isKeyInUrl = false; 
  return config;
};
