// NOTE: this widget is breaking the sandbox rule by accessing Transport directly,
// but its not part of the official game or framework, its just for debugging.
// So I'm OK with this for now.
define(['dat', 'backbone', 'crystaljs/transport'], function (dat, Backbone, Transport) {
  var datgui;
  var datguiView = Backbone.View.extend({
    initialize: function () {
      datgui = new dat.GUI({autoPlace: false});
      var latencyFolder = datgui.addFolder('extra latency (Ms)');
      latencyFolder.add(Transport, "fromServer", 0, 2000);
      latencyFolder.add(Transport, "toServer", 0, 2000);
      $("#devTools").append(this.el);
      this.$el.html(datgui.domElement);
    }


  });

  return datguiView;
});
