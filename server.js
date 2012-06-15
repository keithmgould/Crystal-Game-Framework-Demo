var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    static = require('node-static'),
    requirejs = require('requirejs'),
    file = new(static.Server)('./public');


app.listen(3000);

// Handle static files
function handler (req, res) {
  req.addListener('end',function(){
    file.serve(req, res);
  });
}

requirejs.config({
  baseUrl: 'public/js',
  paths: {
    box2d: 'lib/Box2dWeb-2.1.a.3.min',
    server: '../../server'
  },
  nodeRequire: require
});

requirejs(['common/constants', 'server/space', 'server/transport'], function (Constants, Space, Transport) {
  Space.generateSpace();
  Transport.initialize(io);
});
