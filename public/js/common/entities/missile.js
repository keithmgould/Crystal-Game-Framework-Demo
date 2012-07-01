define(['crystal/common/entity'], function (Entity) {
  var Missile = Entity.extend({
    shape: "circle",
    initialize: function () {
      this.set({
        angle: 0,
        entityType: "Missile",
        radius: 0.25,
        lifespan: 2000, // MS
        createdAt: Date.now()
      });
    }
  });

  return Missile;
});
