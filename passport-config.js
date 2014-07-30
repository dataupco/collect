var commonConfig = require('./common-config.js');

var appConfig = {};
appConfig._host = commonConfig.host;

appConfig.fitbit   = require('./scripts/third/fitbit.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.twitter  = require('./scripts/third/twitter.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.github   = require('./scripts/third/github.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.pearson  = require('./scripts/third/pearson.js')('KEY_GOES_HERE');

appConfig.datagov  = require('./scripts/us/data-gov.js')('KEY_GOES_HERE');
appConfig.openco   = require('./scripts/us/co/opencolorado.js')('KEY_GOES_HERE');
appConfig.cim      = require('./scripts/us/co/cim.js')('KEY_GOES_HERE');

appConfig.webhook1 = require('./scripts/hooks/template.js')();
appConfig.mashup1  = require('./scripts/mashups/template.js')();

module.exports = appConfig;
