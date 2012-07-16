define(['crystal/common/physics', 'crystal/common/api', 'underscore'], function (Physics, CrystalApi, _) {
  var snapshotKeys = [],
      snapshots = {};

  var generateSnapshot = function () {
    var selfEntity = _.find(Physics.getEntities(), function (entity) {
      return entity.get('selfEntity') === true;
    });

    if(_.isUndefined(selfEntity)){
      console.log("could not find selfEntity.");
      return false;
    }
    
    return selfEntity.getSnapshot();
    
  }

  /*  stores in hash where 
      key = timestamp, value = snapshot.
      Also stores the keys in an array for fast lookup.
  */
  var pushSnapshot = function (snapshot) {
    var timestamp = Date.now();
    var oldKey;
    // add to array and hash
    snapshots[timestamp] = snapshot;
    snapshotKeys.push(timestamp);

    // remove from array and hash
    if(snapshotKeys.length > 50){
      oldKey = snapshotKeys.shift();
      delete snapshots.oldKey;
    }
  }

  var clearSnapshots = function () {
    snapshotKeys = [];
    snapshot = {};
    console.log("Photographer's Snapshots cleared!");
  }

  var findClosest = function (timestamp) {
    var skl = snapshotKeys.length;
    for (var i = skl - 1; i >= 1; i--) {
      console.log("looping findClosest");
      // if its the most recent snapshot, see if the timestamp is newer
      if(i === skl - 1){
        if(snapshotKeys[i] < timestamp){
          return snapshots[snapshotKeys[i]];
        }
      }
      // else look for the closest snapshot
      if(snapshotKeys[i] > timestamp && snapshotKeys[i - 1] < timestamp){
        return snapshots[snapshotKeys[i]];
      }
    };
    console.log("could not find a snapshot in the past from timestamp: " + timestamp);
    return false;
  }

  var initialize = function () {
    CrystalApi.Subscribe("update", function (data) {
      var snapshot;
      if(data.tickCount % 10 === 0){
        snapshot = generateSnapshot();
        if(snapshot){
          snapshot.timestamp = Date.now();
          pushSnapshot(snapshot);
          // console.log("made a local snapshot: " + snapshot.timestamp);
        }else{
          console.log("did not generate snapshot!");
        }
      }
    });
  }

  return {
    initialize: initialize,
    findClosest: findClosest,
    clearSnapshots: clearSnapshots
  }
});