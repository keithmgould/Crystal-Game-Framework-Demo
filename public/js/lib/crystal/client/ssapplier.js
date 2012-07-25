define(['crystal/common/api', 'crystal/common/physics', 'common/entityLoader', 'underscore'], function (CrystalApi, Physics, EntityLoader, _) {
  
  var initialize = function () {
    CrystalApi.Subscribe('correctedSnapshot', function (data) {
      applySnapshot(data);
    });

    CrystalApi.Subscribe('newSnapshot', function (data) {
      applySnapshot(data);
    });

  }

  var findEntityById = function (entityId) {
    var entity = _.find(Physics.getEntities(), function (entity) {
      return entityId === entity.id;
    });
    return entity;
  }

  var applyAllEntities = function (data) {
    _.each(data.entities, function (entitySnapshot) {
      applySnapshot(entitySnapshot);
    });
  }

  var applySnapshot = function (entitySnapshot) {
      var entity = findEntityById(entitySnapshot.id);
      if(_.isUndefined(entity)){
        console.log("Entity not found");        
      }
      entity.applySnapshot(entitySnapshot);
  }

  var buildEntity = function (entitySnapshot) {
    // entity = new EntityLoader[entitySnapshot.type]();
    // CrystalApi.Publish("addEntity", entity);
  }

  return {
    initialize: initialize
  };
});