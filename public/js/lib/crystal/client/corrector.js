/*
  The Corrector takes a look at the most recent server snapshot and compares this to
  to the the client snapshot from Lag Ms ago.

  If they are not similar enough, then there will be a Correction.
*/
define(['crystal/common/api', 'crystal/client/photographer', 'underscore'], function (CrystalApi, Photographer, _) {
  var avgLag = 0,
      usePrediction = true;

  var initialize = function () {
    // Store avgLag
    CrystalApi.Subscribe('crystalDebug', function (data) {
      if(data.type === "lagInfo"){
        avgLag = data.avgLag;
      }
    });

    // Compare current Server Snapshot to Lagged Client Snapshot
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
      if(usePrediction){
        handleSnapshotWithPrediction(data);
      }else{
        handleSnapshotWithoutPrediction(data);
      }
    });

    // added these to accomodate dat.gui widget
    // http://code.google.com/p/dat-gui/
    this.__defineGetter__("usePrediction", function () {
      return usePrediction;
    });
    this.__defineSetter__("usePrediction", function (val) {
      usePrediction = val;
    });
  }

  var handleSnapshotWithoutPrediction = function (data) {
    CrystalApi.Publish('correctedSnapshot', data.message);
  }

  var handleSnapshotWithPrediction = function (data) {
      var now = Date.now();
      var then = now - avgLag;
      // console.log("received new snapshot.  avg lag: " + avgLag + ".  its now: " + now+ ", so looking back to: " + then);
      var closest = Photographer.findClosest(then);
      if(closest === false){
        // console.log("Photographer.findClosest() did not turn up a snapshot from timestamp: " + then);
        return false;
      }
      // console.log("Found closest!: " + closest.timestamp + ", with dif: " + (then - closest.timestamp));
      var resetSelfEntity = compareSnapshots(closest, data.message);
      if(resetSelfEntity){
        data.message.avgLag = avgLag;
        Photographer.clearSnapshots();
        // console.log(JSON.stringify(data.message));
        CrystalApi.Publish('correctedSnapshot', data.message);
      }
  }

  var compareSnapshots = function (client, server) {
    // console.log("Comparing: client: " + JSON.stringify(client) + ", server: " + JSON.stringify(server));
    var serverSnapshot = _.find(server.entities, function (entity) {
      return entity.id === client.id;
    });
    if(_.isUndefined(serverSnapshot)){ return false; }
    // now compare each attribute...
    var results = {};
    results.x = compareAttribute(client.x, serverSnapshot.x);
    results.y = compareAttribute(client.y, serverSnapshot.y);
    results.a = compareAttribute(client.a, serverSnapshot.a);
    CrystalApi.Publish("crystalDebug", {type: 'selfEntityError', error: results});
    if(results.x > 5 || results.y > 5 || results.a > 5){
      console.log("============================================================");
      console.log("x: " + results.x + ", y: " + results.y + ", " + results.a);
      return true;
    }else{ 
      return false;
    }
  }

  var compareAttribute = function (client, server) {
    return Math.abs(client - server);
  }

  return {
    initialize: initialize
  };
});