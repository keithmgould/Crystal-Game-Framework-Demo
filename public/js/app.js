require.config({
  paths : {
    backbone : 'lib/backbone_0.9.2-min',
    jquery : 'lib/jquery_1.7.2-min',
    underscore : 'lib/underscore_1.3.3-min',
    box2d : 'lib/Box2dWeb-2.1.a.3.min',
    text : 'lib/text_2.0.0.requirejs',
    mediator : 'lib/mediator_0.7.0'
  },
  shim : {
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

require(['core/space', 'core/transport', 'app/widgets/radar/view', 'app/widgets/pilot/view'], function (Space, Transport, Radar, Pilot) {
  Space.generateSpace();
  Space.addSelfShip("keith", 4, 4);
  Space.addEnemy("bill", 4, 6);
  radar = new Radar();
  pilot = new Pilot();
});
