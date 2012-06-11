require.config({
  paths : {
    backbone : 'lib/backbone_0.9.2-min',
    jquery : 'lib/jquery_1.7.2-min',
    underscore : 'lib/underscore_1.3.3-min',
    box2d : 'lib/Box2dWeb-2.1.a.3.min',
    text : 'lib/text_2.0.0.requirejs',
    mediator : 'lib/mediator_0.7.0',
    kinetic : 'lib/kinetic_3.9.8-min',
    stats : 'lib/stats_r10-min'
  },
  shim : {
    'stats' : {
      exports : 'Stats'
    },
    'kinetic' : {
      exports : 'Kinetic'
    },
    'mediator' : {
      exports : 'Mediator'
    },
    'underscore' : {
      exports : '_'
    },
    'backbone' : {
      deps : ['underscore', 'jquery'],
      exports : 'Backbone'
    }
  }
});

require(['core/space', 
         'core/transport', 
         'app/widgets/radar/view', 
         'app/widgets/pilot/view', 
         'app/widgets/map/view',
         'app/widgets/stats/view'], function (Space, Transport, Radar, Pilot, Map, Stats) {
  var enableDebugDraw = true;
  Space.generateSpace(enableDebugDraw);
  Space.addSelfShip("keith", 20, 20);
  Space.addEnemy("bill", 20, 10);
  radar = new Radar();
  map   = new Map();
  pilot = new Pilot();
  stats = new Stats();
});
