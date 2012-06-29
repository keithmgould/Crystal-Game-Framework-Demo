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
    game: '../../game',
    crystal: '../../crystal'
  },
  nodeRequire: require
});

requirejs(['crystal/loop', 'crystal/transport', 'game/space'], function (Loop, Transport, Space) {
  Space.initialize();         // 1) initialize your game
  Transport.initialize(io);   // 2) initialize crystal transport
  Loop.start();               // 3) begin crystal game loop
});
