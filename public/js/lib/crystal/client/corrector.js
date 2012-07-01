// MAJOR TODO: bring physics engine into Crystal.

define(['crystal/api', 'underscore'], function (CrystalApi, _) {
  var snapshots = [],
      correctedSnapshot,
      lastPublishedSnapshot;

  var generateCorrectedSnapshot = function () {
    if(snapshots.length === 0) {return;}
    var correctedEntity,
        snapshot = _.last(snapshots).message;
    _.each(snapshot.entities, function (entity) {
      correctEntity(entity);
    });
  }

  var correctEntity = function (entity) {
    

  }

  var publishCorrectedSnapshot = function () {
    if(snapshots.length === 0) {return;}
    // temp just return last snapshot
    var snapshot = _.last(snapshots);
    if(lastPublishedSnapshot === snapshot.receivedAt){return;}
    CrystalApi.Publish('messageFromServer:game', {type: 'snapshot', message: snapshot.message});
    lastPublishedSnapshot = snapshot.receivedAt;
  }

  var initialize = function () {

    // Generate and publish a corrected snapshot on Update
    CrystalApi.Subscribe('update', function () {
      generateCorrectedSnapshot();
      publishCorrectedSnapshot();
    });

    // Store snapshots
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
      data.receivedAt = Date.now();
      snapshots.push(data);
      if(snapshots.length > 50) {
        snapshots.shift();
      }
    }); 
  }

  return {
    initialize: initialize
  };
});