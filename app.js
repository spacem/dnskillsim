var request = require('request');
var express = require('express');
var app = express();
module.exports = app;

// installed libs
var path = require('path');
var cookieParser = require('cookie-parser');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(cookieParser());

// custom libs/vars
var maze = require('./lib/maze');
var lang = require('./lib/lang');
var format = require('./lib/format');
lang = lang('na');

setupRegion('sea');
setupRegion('na');
setupRegion('cdn');
setupRegion('ina');
setupRegion('eu');
setupRegion('kdn');
setupRegion('tw', 'https://twdnfiles.firebaseapp.com/maze');
setupRegion('th', 'https://thdnfiles.firebaseapp.com/maze');


function setupRegion(region, url) {
  if(url) {
    
    request.get({
      url: url + '/db.json',
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
      if (err) {
        console.log('JSON Error:', err);
      }
      else if (res.statusCode !== 200) {
        console.log('JSON Status:', res.statusCode);
      }
      else {
        setupRegionDb(region, url, data);
      }
    });
  }
  else {
    var db = require('./public/json/' + region + '/db.json');
    setupRegionDb(region, url, db);
  }
  
}
  
function setupRegionDb(region, url, db) {
  
  var jobs = [];
  db.FinalJobs = {};
  for (var i in db.Jobs) {
    jobs[i] = db.Jobs[i]
    if (jobs[i].JobNumber == 2) {
      db.FinalJobs[jobs[i].EnglishName] = jobs[i];
    }
  }
  
  var configs = {
    maze: maze,
    lang: lang,
    jobs: jobs,
    db: db,
    format: format,
    region: region,
    url: url
  }
  
  // routes
  var home = require('./routes/home')(configs);
  var simulator = require('./routes/simulator')(configs);
  var api_tech = require('./routes/tech')(configs);
  
  app.use('/', simulator);
  app.use('/', home);
  app.use('/api/', api_tech);
}

var fallback = require('./routes/fallback')();
app.use('/', fallback);

var filePath = __dirname + '/public';
app.use(express.static(filePath));