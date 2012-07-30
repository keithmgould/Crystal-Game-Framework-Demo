// NOTE: this widget is breaking the sandbox rule by accessing crystal directly,
// but its not part of the official game or framework, its just for debugging.
// So I'm OK with this for now.
define(['dat', 'backbone', 'crystal/client/transport', 'crystal/client/interpolator', 'space'], function (dat, Backbone, Transport, Interpolator, Space) {
  var datgui;
  var datguiView = Backbone.View.extend({
    initialize: function () {
      datgui = new dat.GUI({autoPlace: false});

      // prep latency controls
      var latencyFolder = datgui.addFolder('extra latency (Ms)');
      latencyFolder.add(Transport, "fromServer", 0, 2000);
      latencyFolder.add(Transport, "toServer", 0, 2000);
      latencyFolder.open();

      // prep twitch features
      var interpolationFolder = datgui.addFolder('interpolation');
      interpolationFolder.add(Interpolator, "delay");
      interpolationFolder.open();

      // Map View
      var mapFolder = datgui.addFolder('Toggle Ships');
      var ships = {
        server: true,
        final: true,
        future: true
      };

      var finalController = mapFolder.add(ships, 'final');
      finalController.onChange(function (value) {
        Space.mediator.Publish("shipVisibility", {ship: "final", value: value});
      });

      var serverController = mapFolder.add(ships, 'server');
      serverController.onChange(function (value) {
        Space.mediator.Publish("shipVisibility", {ship: "server", value: value});
      });

      var futureController = mapFolder.add(ships, 'future');
      futureController.onChange(function (value) {
        Space.mediator.Publish("shipVisibility", {ship: "future", value: value});
      });

      mapFolder.open();

      // render
      $("#devTools").append(this.el);
      this.$el.html(datgui.domElement);
    }


  });

  return datguiView;
});
