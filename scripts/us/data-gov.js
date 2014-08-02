// Data.gov API
// http://api.data.gov/docs/
module.exports = function(keyValue) {
  var config = {};
  config.name='Data.gov';
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'https://api.data.gov'; 
  config.keyName = 'api_key'; 
  config.keyValue = keyValue; 
  config.isKeyInUrl = true; 
  return config;
};
