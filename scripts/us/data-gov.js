module.exports = function(keyValue) {
  var config = {};
  config.name='Data.gov';
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'http://catalog.data.gov/api'; 
  config.keyName = 'Authorization'; 
  config.keyValue = keyValue; 
  config.isKeyInUrl = false; 
  return config;
};
