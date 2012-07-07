define(['crystal/common/physics', 'crystal/common/api', 'underscore'], function (Physics, CrystalApi, _) {
  
  var generateSnapshot = function () {
    var snapshot = { entities: [] };
    _.each(Physics.getEntities("photo: genSnap"), function (entity) {
      snapshot.entities.push(entity.getSnapshot());
    });
    return snapshot;
  }

  var initialize = function () {
    CrystalApi.Subscribe("update", function (data) {
      if(data.tickCount % 10 === 0){
        CrystalApi.Publish('broadcast', { target: 'crystal', type: 'snapshot', message: generateSnapshot() });
      }
    });
  }

  return {
    initialize: initialize
  }
});