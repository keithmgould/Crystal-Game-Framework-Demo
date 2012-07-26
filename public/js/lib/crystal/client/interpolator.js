define(['crystal/common/api', 'crystal/common/physics', 'crystal/client/lib/smooth', 'underscore'], function (CrystalApi, Physics, Smooth, _) {
  
  var snapshots = [],
      path,
      selfEntity,
      delay = 100; // Ms

  var initialize = function () {
    CrystalApi.Subscribe('serverSelfEntityFutureSnapshot', function (snapshot) {

      if(_.isUndefined(selfEntity)){
        selfEntity = _.find(Physics.getEntities(), function (entity) {
          return entity.get('selfEntity') === true;
        });
      }

      snapshots.push([snapshot.x, snapshot.y, snapshot.a, Date.now()]);
      if(snapshots.length > 10){
        snapshots.shift();
      }

    });

    CrystalApi.Subscribe("update", function (data) {
      if(snapshots.length > 5){
        var firstSnapshot = _.first(snapshots);
        var firstSnapshotTime = firstSnapshot[3];
        var dateNow = Date.now();
        path = Smooth(snapshots, {
          method: Smooth.METHOD_CUBIC, 
          clip: Smooth.CLIP_ZERO, 
          cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM,
          scaleTo: [firstSnapshotTime, dateNow]
        });
        
        var point = path(Date.now() - delay);
        var snapshot = {
          x: point[0],
          y: point[1],
          a: point[2]
        }
        
        CrystalApi.Publish("interpolatedSnapshot", snapshot);
      }
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
    initialize: initialize
  };
});