// NOTE: this widget is breaking the sandbox rule by accessing crystal directly,
// but its not part of the official game or framework, its just for debugging.
// So I'm OK with this for now.
define(['dat', 'backbone', 'crystal/transport', 'crystal/loop'], function (dat, Backbone, Transport, Loop) {
  var datgui;
  var datguiView = Backbone.View.extend({
    initialize: function () {
      datgui = new dat.GUI({autoPlace: false});

      // prep latency controls
      var latencyFolder = datgui.addFolder('extra latency (Ms)');
      latencyFolder.add(Transport, "fromServer", 0, 2000);
      latencyFolder.add(Transport, "toServer", 0, 2000);

      // render
      $("#devTools").append(this.el);
      this.$el.html(datgui.domElement);
    }


  });

  return datguiView;
});
