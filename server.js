var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    static = require('node-static'),
    requirejs = require('requirejs'),
    Mediator = require('mediator'),
    _ = require('underscore')._,
    Backbone = require('backbone');

requirejs.config({
  baseUrl: 'public/js',
  paths: {
    box2d: 'lib/Box2dWeb-2.1.a.3.min',
    server: '../../cf_modules'
  },
  nodeRequire: require
});

requirejs(['app/constants', 'core/space'], function (Constants, Space) {
  console.log(Constants.server);
});

app.listen(3000);

// Handle static files
var file = new(static.Server)('./public');
function handler (req, res) {
  req.addListener('end',function(){
    file.serve(req, res);
  });
}

// Handle socket IO
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  
  socket.on('transporty', function (data) {
    console.log(data);
  });
});
