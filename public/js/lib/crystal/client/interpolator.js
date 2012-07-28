define(['crystal/common/api', 'crystal/common/physics', 'crystal/client/lib/smooth', 'underscore'], function (CrystalApi, Physics, Smooth, _) {
  
  var snapshots = [],
      lastSnapshot,
      selfEntity,
      updateMethod,
      delay = 100; // Ms

  var getLastSnapshot = function () {
    if(snapshots.length === 0){return false;}
    var raw = _.last(snapshots);
    var snapshot = {
      x: raw[0],
      y: raw[1],
      a: raw[2],
      xv: lastSnapshot.xv,
      yv: lastSnapshot.yv,
      av: lastSnapshot.av
    };
    return snapshot;
  }

  var initialize = function () {
    CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (snapshot) {

      if(_.isUndefined(selfEntity)){
        selfEntity = _.find(Physics.getEntities(), function (entity) {
          return entity.get('selfEntity') === true;
        });
      }

      snapshots.push([snapshot.x, snapshot.y, snapshot.a, Date.now()]);
      lastSnapshot = snapshot;
      if(snapshots.length > 10){
        snapshots.shift();
      }

    });

    CrystalApi.Subscribe("updateMethodChange", function (data) {
      updateMethod = data.use;
      console.log("updateMethodChange: " + updateMethod);
    });

    CrystalApi.Subscribe("update", function (data) {      
      if(snapshots.length <= 2 || updateMethod != "snapshots"){return;}
      var firstSnapshot     = _.first(snapshots),
          firstSnapshotTime = firstSnapshot[3],
          dateNow           = Date.now(),
          path, 
          point, 
          snapshot;

      path = Smooth(snapshots, {
        method: Smooth.METHOD_CUBIC, 
        clip: Smooth.CLIP_ZERO, 
        cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM,
        scaleTo: [firstSnapshotTime, dateNow]
      });
      
      point = path(Date.now() - delay);
      snapshot = {
        x: point[0],
        y: point[1],
        a: point[2]
      }
      
      CrystalApi.Publish("finalSnapshot", snapshot);
      
    });

    // added these to accomodate dat.gui widget
    // http://code.google.com/p/dat-gui/
    this.__defineGetter__("delay", function () {
      return delay;
    });
    this.__defineSetter__("delay", function (val) {
      delay = val;
    });

  }

  return {
    initialize: initialize,
    getLastSnapshot: getLastSnapshot
  };
});