define(['common/entity', 'common/physics'], function (Entity, Physics) {
  var Missile = Entity.extend({
    shape: "circle",
    initialize: function () {
      this.set({
        angle: 0,
        entityType: "Missile",
        radius: 1
      });
    }
  });

  return Missile;
});
