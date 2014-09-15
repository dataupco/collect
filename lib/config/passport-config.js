var commonConfig = require('./common-config.js');

var appConfig = {};
appConfig._host = commonConfig.host;

// Business APIs
appConfig.fitbit   = require('../scripts/apis/biz/fitbit.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.twitter  = require('../scripts/apis/biz/twitter.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.github   = require('../scripts/apis/biz/github.js')('KEY_GOES_HERE','PASS_GOES_HERE');
appConfig.pearson  = require('../scripts/apis/biz/pearson.js')('KEY_GOES_HERE');
appConfig.littlebits = require('../scripts/apis/biz/littlebits.js')('KEY_GOES_HERE'); // hack

// Government APIs
appConfig.datagov  = require('../scripts/apis/gov/usa/data-gov.js')('KEY_GOES_HERE');
appConfig.openco   = require('../scripts/apis/gov/usa/co/opencolorado.js')('KEY_GOES_HERE');
appConfig.cim      = require('../scripts/apis/gov/usa/co/cim.js')('KEY_GOES_HERE');

// Mashups
appConfig.mashup1  = require('../scripts/apis/mash/template.js')();

// Webhooks
appConfig.webhook1 = require('../scripts/hooks/template.js')();
appConfig.littlebitsback = require('../scripts/hooks/littlebits.js')();

module.exports = appConfig;
