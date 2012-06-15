define(['common/entity', 'common/physics'], function (Entity, Physics) {

  var Ship = Entity.extend({
    initialize: function () {
      this.set({ 
        entityType: 'Ship', 
        height: 2, 
        width: 1, 
        color: "red",
        angle: 0 });
    },
    accelerate: {
      rotateRight: function () {
        this.get('body').ApplyTorque(5);
      },
      rotateLeft: function () {
        this.get('body').ApplyTorque(-5);
      },
      foreward: function () {
        var power = 1,
            x, 
            y, 
            angle = this.get('angle');
        y = -Math.cos(angle).toFixed(2);
        x = Math.sin(angle).toFixed(2);
        this.get('body').ApplyImpulse(
          new Physics.box2d.b2Vec2(x * power, y * power),
          this.get('body').GetWorldCenter()
        );
      }
    }
  });

  return Ship;
});
