// NOTE: this widget is breaking the sandbox rule by accessing Transport directly,
// but its not part of the official game or framework, its just for debugging.
// So I'm OK with this for now.
define(['dat', 'backbone', 'crystaljs/transport'], function (dat, Backbone, Transport) {
  var datgui;
  var datguiView = Backbone.View.extend({
    initialize : function () {
      datgui = new dat.GUI();
      var latencyFolder = datgui.addFolder('latency');
      latencyFolder.add(Transport, "fromServer", 25, 2000);
      latencyFolder.add(Transport, "toServer", 25, 2000);
    }
  });

  return datguiView;
});
