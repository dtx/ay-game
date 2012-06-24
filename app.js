/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io')
  , mysql = require('mysql')
  , server = require('./server.js');

var db = mysql.createConnection({
    host: 'localhost'
    , user: 'game'
    , password: '123game'
    , database: 'Users'
});

var app = module.exports = express.createServer();
socket = io.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
server.Sock(db, socket);
/**
db.connect(function()
    socket.on('connection', server.Sock);
});
**/

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
