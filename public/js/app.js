require.config({
  paths: {
    backbone: 'lib/backbone_0.9.2-min',
    jquery: 'lib/jquery_1.7.2-min',
    underscore: 'lib/underscore_1.3.3-min',
    box2d: 'lib/Box2dWeb-2.1.a.3.min',
    text: 'lib/text_2.0.0.requirejs',
    mediator: 'lib/mediator_0.7.0',
    kinetic: 'lib/kinetic_3.9.8-min',
    stats: 'lib/stats_r10-min'
  },
  shim: {
    'stats': {
      exports: 'Stats'
    },
    'kinetic': {
      exports: 'Kinetic'
    },
    'mediator': {
      exports: 'Mediator'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require(['animation',
         'space',
         'transport',
         'widgets/radar/view', 
         'widgets/pilot/view', 
         'widgets/map/view',
         'widgets/stats/view'], function (Animation, Space, Transport, Radar, Pilot, Map, Stats) {

  Transport.initialize();
  Space.generateSpace();
  Space.requestSelfShip();
  //aaa = Space; // intentional global used for spying via console.  remove for production.
  //radar = new Radar();
  //map   = new Map();
  //pilot = new Pilot();
  //stats = new Stats();
});
