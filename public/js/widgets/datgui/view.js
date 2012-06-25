define(['dat', 'backbone'], function (dat, Backbone) {
  var datgui;
  var datguiView = Backbone.View.extend({
    el : $('#datguiWidget'),
    initialize : function () {
      datgui = new dat.GUI();
      var latencyFolder = datgui.addFolder('latency');
      latencyFolder.add(window, "socketOnLatency", 25, 2000);
      latencyFolder.add(window, "socketEmitLatency", 25, 2000);
    }
  });

  return datguiView;
});
