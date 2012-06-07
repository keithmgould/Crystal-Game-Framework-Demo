require.config({
  paths : {
    backbone : 'lib/backbone_0.9.2-min',
    jquery : 'lib/jquery_1.7.2-min',
    underscore : 'lib/underscore_1.3.3-min',
    box2d : 'lib/Box2dWeb-2.1.a.3.min',
    text : 'lib/text_2.0.0.requirejs'
  },
  shim : {
    'underscore' : {
      exports : '_'
    },
    'backbone' : {
      deps : ['underscore', 'jquery'],
      exports : 'Backbone'
    }
  }
});

require(['core/space', 'app/widgets/radar/view'], function (Space, Radar) {
  Space.generateSpace();
  Space.addBox("keith", true, 2, 2);
  radar = new Radar();
});
