define(['crystal/common/api', 'crystal/common/physics', 'crystal/client/interpolator', 'underscore'], function (CrystalApi, Physics, Interpolator, Underscore) {
  var updateMethod,
      selfEntity;

  var initialize = function () {
    CrystalApi.Subscribe("messageToServer", function (data) {
      if(data.type != "pilotControl") {return;}
      storeSelfEntity();
      if(_.isUndefined(selfEntity)){return;}
      if(updateMethod != "prediction"){
        var lastSnapshot = Interpolator.getLastSnapshot();
        CrystalApi.Publish('updateMethodChange', {use: "prediction"});
        selfEntity.applySnapshot(lastSnapshot);
      }
      selfEntity.pilotControl(data.message.key);
    });

    CrystalApi.Subscribe("updateMethodChange", function (data) {
      updateMethod = data.use;
    });

    CrystalApi.Subscribe("update", function (data) {
      if(updateMethod != "prediction"){return;}
      if(_.isUndefined(selfEntity)){return;}
      var finalSnapshot = selfEntity.getSnapshot();
      debugFinalSnapshot = finalSnapshot;
      CrystalApi.Publish('finalSnapshot', finalSnapshot);
    });
  }

  var storeSelfEntity = function () {
  if(_.isUndefined(selfEntity)){
    selfEntity = _.find(Physics.getEntities(), function (entity) {
      return entity.get('selfEntity') === true;
    });
    if(_.isUndefined(selfEntity)){
      return false;
    }
  }
  return true;
}

  return {
    initialize: initialize
  };
});