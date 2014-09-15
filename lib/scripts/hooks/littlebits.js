// ingest data from littlebits subscription
// http://developer.littlebitscloud.cc/api-http
module.exports = function() {
  var config = {};
  config.name='Littlebits Webhook';
  config.enabled=true;
  config.type = 'webhook';
  config.useApiKey=true;
  config.buildWebhook = function(access, options, done) {

    console.log('execute littlebit with uri: ' + options.uri);

     access.ingest(access.body, function(data) {
       done(null,{});
     });
  };

  return config;
};
