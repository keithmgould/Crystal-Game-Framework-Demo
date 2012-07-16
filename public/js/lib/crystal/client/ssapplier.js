define(['crystal/common/api', 'crystal/common/physics', 'common/entityLoader', 'underscore'], function (CrystalApi, Physics, EntityLoader, _) {
  
  var initialize = function () {
    CrystalApi.Subscribe('correctedSnapshot', function (data) {
      if(data.avgLag && data.avgLag > 0){
        console.log("Stopping Updates---------------------------------------");
        Physics.stopUpdates();
        console.log("applying snapshot: " + JSON.stringify(data));
      }
      applySnapshot(data);
      if(data.avgLag && data.avgLag > 0){
        console.log("Starting Updates with avgLag " + data.avgLag + "---------------------------------------");
        Physics.continueUpdates(data.avgLag);
      }
    });
  }

  var findEntityById = function (entityId) {
    var entity = _.find(Physics.getEntities(), function (entity) {
      return entityId === entity.id;
    });
    return entity;
  }

  var applySnapshot = function (data) {
    _.each(data.entities, function (entitySnapshot) {
      var entity = findEntityById(entitySnapshot.id);
      if(_.isUndefined(entity)){
        throw new Error('baaaaad');
        // entity = buildEntity(entitySnapshot);
      }
      entity.applySnapshot(entitySnapshot);
    });
  }

  var buildEntity = function (entitySnapshot) {
    // entity = new EntityLoader[entitySnapshot.type]();
    // CrystalApi.Publish("addEntity", entity);
  }

  return {
    initialize: initialize
  };
});