/*
  The Corrector takes a look at the most recent server snapshot and compares this to
  to the the client snapshot from Lag Ms ago.

  If they are not similar enough, then there will be a Correction.
*/
define(['crystal/common/api', 'crystal/common/physics', 'underscore'], function (CrystalApi, Physics, _) {
  var avgLag = 0,
      selfEntity,
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

      if(_.isUndefined(selfEntity)){
        selfEntity = _.find(Physics.getEntities(), function (entity) {
          return entity.get('selfEntity') === true;
        });
        if(_.isUndefined(selfEntity)){
          return;
        }
      }

      var lastClientSnapshot = selfEntity.getSnapshot();
      if(_.isUndefined(lastClientSnapshot)){
        console.log("no snapshot yet");
        return;
      }

      // Extract the selfEntity from the snapshot
      var serverEntitySnapshot = _.find(data.message.entities, function (entity) {
        return entity.id === lastClientSnapshot.id;
      });
      if(_.isUndefined(serverEntitySnapshot)){ return false; }
      
      var futureSnapshot = Physics.seeFuture(serverEntitySnapshot, avgLag);
      // used for debugging...
      CrystalApi.Publish('serverSelfEntityFutureSnapshot', futureSnapshot);
      CrystalApi.Publish('serverSelfEntitySnapshot', serverEntitySnapshot);

      var resetSelfEntity = compareSnapshots(lastClientSnapshot, futureSnapshot);
      if(resetSelfEntity){
        CrystalApi.Publish('correctedSnapshot', futureSnapshot);
      }else{
        // CrystalApi.Publish('correctedSnapshot', mergeSnapshots(lastClientSnapshot, futureSnapshot));
      }
  }

  var mergeSnapshots = function (snapshotOne, snapshotTwo) {
    var newSnapshot = {id: snapshotOne.id, type: snapshotOne.type};
    var attributes = ["x", "y", "a", "xv", "yv", "av"];
    _.each(attributes, function (attribute) {
      newSnapshot[attribute] = mergeSnapshot(snapshotOne[attribute], snapshotTwo[attribute]);
    });
    debugger;
    return newSnapshot;
  }

  var mergeSnapshot = function (attributeOne, attributeTwo) {
    return (attributeOne + attributeTwo) / 2;
  }

  var compareSnapshots = function (client, server) {
    var results = {};
    
    results.x = compareAttribute(client.x, server.x);
    results.y = compareAttribute(client.y, server.y);
    results.a = compareAttribute(client.a, server.a);
    CrystalApi.Publish("crystalDebug", {type: 'selfEntityError', error: results});
    if(results.x > 1 || results.y > 1 || results.a > 1){
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