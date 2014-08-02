// Public  template
module.exports = function(keyValue) { 
  var config = {};
  config.name='Open Colorado';
  config.enabled=true;
  config.type='public';
  config.baseUrl = 'http://data.opencolorado.org/storage';
  return config;
};
