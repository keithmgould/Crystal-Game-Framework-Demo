define(['crystal/common/api', 'crystal/common/physics', 'crystal/client/interpolator', 'underscore'], function (CrystalApi, Physics, Interpolator, Underscore) {
  var updateMethod,
      selfEntity;

  var initialize = function () {
    CrystalApi.Subscribe("messageToServer", function (data) {
      if(data.type != "pilotControl") {return;}
      storeSelfEntity();
      if(_.isUndefined(selfEntity)){return;}
      var lastSnapshot = Interpolator.getLastSnapshot();
      selfEntity.applySnapshot(lastSnapshot);
      CrystalApi.Publish('updateMethodChange', {use: "prediction"});
    });

    CrystalApi.Subscribe("updateMethodChange", function (data) {
      updateMethod = data.use;
      console.log("predictor: updated method change: " + updateMethod);
    });

    CrystalApi.Subscribe("update", function (data) {
      if(updateMethod != "prediction"){return;}
      if(_.isUndefined(selfEntity)){return;}
      CrystalApi.Publish('finalSnapshot', selfEntity.getSnapshot());
    });
  }

  var storeSelfEntity = function () {
  if(_.isUndefined(selfEntity)){
    selfEntity = _.find(Physics.getEntities(), function (entity) {
      return entity.get('selfEntity') === true;
    });
    if(_.isUndefined(selfEntity)){
      console.log("no selfEntity yet");
      return false;
    }
  }
  return true;
}

  return {
    initialize: initialize
  };
});