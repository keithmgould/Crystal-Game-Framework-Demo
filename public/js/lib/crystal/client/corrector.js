define(['crystal/common/api', 'crystal/common/physics', 'underscore'], function (CrystalApi, Physics, _) {
  var snapshots = [],
      lastPublishedSnapshotAt,
      useCorrector = true,
      skew = 0.95;

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
    var body = localEntity.get('body');
    var position = body.GetPosition();

    rawEntity.x = getSkew(rawEntity.x, position.x);
    rawEntity.y = getSkew(rawEntity.y, position.y);
    rawEntity.a = getSkew(rawEntity.a, body.GetAngle());
    rawEntity.av = getSkew(rawEntity.av, body.GetAngularVelocity());

    return rawEntity;
  }

  // a = 10, b = 20, skew = .10 => c = 10, skewed = 1, return 11
  // a = 20, b = 10, skew = .10 => c = -10, skewed = -10 * .10 = -1, return 19
  // skew ranges from 0 to 1, where 0 is completely a and 1 is completely b.
  var getSkew = function (a,b) {
    var c = b - a;
    var skewed = c * skew;
    var result = a + skewed;
    var r = Math.random();
    if(r > 0.95){
      console.log("a: " + a + ", b: " + b + ", result: " + result);
    }
    return result;
  }

  // var getAvg = function (list) {
  //   sum = _.reduce(list, function(memo, num){ return memo + num; }, 0);
  //   return sum / list.length;
  // }

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

      this.__defineGetter__("skew", function () {
        return skew;
      });
      this.__defineSetter__("skew", function (val) {
        skew = val;
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