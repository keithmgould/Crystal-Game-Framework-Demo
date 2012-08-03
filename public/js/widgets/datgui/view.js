// NOTE: this widget is breaking the sandbox rule by accessing crystal directly,
// but its not part of the official game or framework, its just for debugging.
// So I'm OK with this for now.
define(['dat', 'backbone', 'crystal/client/transporter', 'crystal/client/interpolator', 'crystal/common/api', 'space'], function (dat, Backbone, Transporter, Interpolator, CrystalApi, Space) {
  var datgui;

  var configureLatencyControls = function () {
    var latencyFolder = datgui.addFolder('extra latency (Ms)');
    latencyFolder.add(Transporter, "fromServer", 0, 2000);
    latencyFolder.add(Transporter, "toServer", 0, 2000);
    latencyFolder.open();
  }

  var configureInterpolationControls = function () {
    var interpolationFolder = datgui.addFolder('interpolation');
    interpolationFolder.add(Interpolator, "delay");
    interpolationFolder.open();
  }

  var configureShipVisibilityControls = function () {
    var visibilityFolder = datgui.addFolder('Toggle Ship Visibility');
    var shipVisibility = {
      server: false,
      final: true,
      future: false,
      colorChange: false
    };

    var finalController = visibilityFolder.add(shipVisibility, 'final');
    finalController.onChange(function (value) {
      Space.mediator.Publish("shipVisibility", {ship: "final", value: value});
    });

    var serverController = visibilityFolder.add(shipVisibility, 'server');
    serverController.onChange(function (value) {
      Space.mediator.Publish("shipVisibility", {ship: "server", value: value});
    });

    var futureController = visibilityFolder.add(shipVisibility, 'future');
    futureController.onChange(function (value) {
      Space.mediator.Publish("shipVisibility", {ship: "future", value: value});
    });

    var colorChangeController = visibilityFolder.add(shipVisibility, 'colorChange');
    colorChangeController.onChange(function (value) {
      Space.mediator.Publish("shipVisibility", {ship: "colorChange", value: value});
    });

    visibilityFolder.open();
  }

  var configureNetworkReadouts = function () {
    var networkFolder = datgui.addFolder("Network Readouts (Readonly, Ms)");
    networkReadouts = {
      avgLag: 0,
      snapshotDelta: 0
    };
    networkFolder.add(networkReadouts, "avgLag").listen();
    networkFolder.add(networkReadouts, "snapshotDelta").listen();
    networkFolder.open();
    CrystalApi.Subscribe("crystalDebug", function (data) {
      switch(data.type) {
        case "lagInfo":
          networkReadouts.avgLag = Math.round( data.avgLag * 100 ) / 100;
          break;
        case "snapshotInfo":
          networkReadouts.snapshotDelta = data.interval;
          break;
      }
    });
  }

  var configureShipCoordinateControls = function () {
    var shipCoordinates = {
      server: {x:0.1, y:0.1, a:0.1},
      final: {x:0.1, y:0.1, a:0.1},
      future: {x:0.1, y:0.1, a:0.1}
    };
    var coordinatesFolder = datgui.addFolder("Ship Coordinates (Readonly)");
    var finalCoordinatesFolder = coordinatesFolder.addFolder("Final");
    finalCoordinatesFolder.add(shipCoordinates.final, "x").listen();
    finalCoordinatesFolder.add(shipCoordinates.final, "y").listen();
    finalCoordinatesFolder.add(shipCoordinates.final, "a").listen();
    finalCoordinatesFolder.open();
    var serverCoordinatesFolder = coordinatesFolder.addFolder("Server");
    serverCoordinatesFolder.add(shipCoordinates.server, "x").listen();
    serverCoordinatesFolder.add(shipCoordinates.server, "y").listen();
    serverCoordinatesFolder.add(shipCoordinates.server, "a").listen();
    serverCoordinatesFolder.open();
    var futureCoordinatesFolder = coordinatesFolder.addFolder("Future");
    futureCoordinatesFolder.add(shipCoordinates.future, "x").listen();
    futureCoordinatesFolder.add(shipCoordinates.future, "y").listen();
    futureCoordinatesFolder.add(shipCoordinates.future, "a").listen();
    futureCoordinatesFolder.open();


    // These subscriptions update location of ships on the map
    CrystalApi.Subscribe('serverSelfEntitySnapshot', function (snapshot) {
      shipCoordinates['server'].x = snapshot.x;
      shipCoordinates['server'].y = snapshot.y;
      shipCoordinates['server'].a = snapshot.a;
    });

    CrystalApi.Subscribe('finalSnapshot', function (snapshot) {
      shipCoordinates['final'].x = snapshot.x;
      shipCoordinates['final'].y = snapshot.y;
      shipCoordinates['final'].a = snapshot.a;
    });

    CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (snapshot) {
      shipCoordinates['future'].x = snapshot.x;
      shipCoordinates['future'].y = snapshot.y;
      shipCoordinates['future'].a = snapshot.a;
    });
  }

  var datguiView = Backbone.View.extend({
    initialize: function () {
      datgui = new dat.GUI({autoPlace: false});

      configureLatencyControls();
      configureNetworkReadouts();
      configureInterpolationControls();
      configureShipVisibilityControls();
      configureShipCoordinateControls();

      // render
      $("#devTools").append(this.el);
      this.$el.html(datgui.domElement);
    }

  });

  return datguiView;
});
