// OpenColorado CKAN API
// http://docs.ckan.org/en/latest/api/legacy-api.html
module.exports = function(keyValue) {
  var config = {};
  config.name='Open Colorado';
  config.enabled=true;
  config.type='api-key';
  config.baseUrl = 'http://data.opencolorado.org/api'; 
  config.keyName = 'Authorization'; 
  config.keyValue = keyValue; 
  config.isKeyInUrl = false; 
  return config;
};
