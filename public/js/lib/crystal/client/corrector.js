define(['crystal/common/api', 'crystal/common/physics', 'underscore'], function (CrystalApi, Physics, _) {
  var snapshots = [],
      lastPublishedSnapshotAt,
      useCorrector = true;

  var generateCorrectedSnapshot = function () {

    var snapshot = _.last(snapshots),
        correctedEntity,
        correctedEntities = [];

    // console.log("raw snapshot: " + JSON.stringify(snapshot));
    if(useCorrector){
      _.each(snapshot.message.entities, function (entity) {
        correctedEntity = correctEntity(entity);
        correctedEntities.push(correctedEntity);
      });
      snapshot.message.entities = correctedEntities;
    }

    return snapshot;
  }

  var correctEntity = function (rawEntity) {
    // console.log("Physics.ents: " + Physics.getEntities().length );
    var entities = Physics.getEntities();
    var localEntity = _.find(entities, function (entity) {
        // console.log("comparing " + rawEntity.id + " to " + entity.id);
        return rawEntity.id === entity.id;
    });

    if(_.isUndefined(localEntity)){
      console.log("cant find the entity from the id in the snapshot: " + JSON.stringify(rawEntity.id));
      return rawEntity;
    }
    rawEntity.x = getAvg([rawEntity.x, localEntity.get('xPos')]);
    rawEntity.y = getAvg([rawEntity.y, localEntity.get('yPos')]);

    return rawEntity;
  }

  var getAvg = function (list) {
    sum = _.reduce(list, function(memo, num){ return memo + num; }, 0);
    return sum / list.length;
  }

  var publishCorrectedSnapshot = function (correctedSnapshot) {
    // don't publish the same snapshot twice
    // console.log("last published at: " + lastPublishedSnapshotAt + ", correctedAt: " + correctedSnapshot.receivedAt);
    if(lastPublishedSnapshotAt === correctedSnapshot.receivedAt){return;}

    // publish snapshot and store what we published
    // console.log("publishing corrected snapshot: " + JSON.stringify(correctedSnapshot));
    CrystalApi.Publish('messageFromServer:game', {type: 'snapshot', message: correctedSnapshot});
    lastPublishedSnapshotAt = correctedSnapshot.receivedAt;
  }

  var initialize = function () {

      // added these to accomodate dat.gui widget
      // http://code.google.com/p/dat-gui/
      this.__defineGetter__("useCorrector", function () {
        return useCorrector;
      });
      this.__defineSetter__("useCorrector", function (val) {
        useCorrector = val;
      });

    // Generate and publish a corrected snapshot on Update
    CrystalApi.Subscribe('update', function (data) {
      if(snapshots.length === 0) {return;}
      var correctedSnapshot = generateCorrectedSnapshot();

      publishCorrectedSnapshot(correctedSnapshot);
    });

    // Store snapshots
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
      // console.log("got a snapshot! " + JSON.stringify(data));
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