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
    game: '../../game',
    crystal: './lib/crystal',
    mediator: './lib/mediator_0.7.0'
  },
  nodeRequire: require
});

requirejs(['crystal/server/init', 'game/space'], function (Crystal, Space) {
  Crystal.initialize(io);       // 1) Initialize Crystal Server
  Space.initialize();           // 2) initialize your game
});
