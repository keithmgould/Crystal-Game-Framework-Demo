require.config({
  paths: {
    backbone: 'lib/backbone_0.9.2-min',
    jquery: 'lib/jquery_1.7.2-min',
    underscore: 'lib/underscore_1.3.3-min',
    text: 'lib/text_2.0.0.requirejs',
    mediator: 'lib/mediator_0.7.0',
    kinetic: 'lib/kinetic_3.9.8-min',
    stats: 'lib/stats_r10-min',
    dat: 'lib/dat.gui.min',
    crystal: 'lib/crystal'
  },
  shim: {
    'stats': {
      exports: 'Stats'
    },
    'dat' : {
      exports: 'dat'
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

require(['space',
         'crystal/client/init',
         'widgets/pilot/view',
         'widgets/debug/view',
         'widgets/map/view',
         'widgets/stats/view',
         'widgets/datgui/view'], function (Space, Crystal, PilotWidget, DebugWidget, MapWidget, StatsWidget, DatguiWidget) {


  Crystal.initialize();   // 1) Initialize crystal
  Space.initialize();     // 2) Initialize your game

  // note: I don't like that I'm declaring variables and not using them.
  var debugWidget   = new DebugWidget();
  var MapWidget     = new MapWidget();
  var pilotWidget   = new PilotWidget();
  var statsWidget   = new StatsWidget();
  var datguiWidget  = new DatguiWidget();
});
