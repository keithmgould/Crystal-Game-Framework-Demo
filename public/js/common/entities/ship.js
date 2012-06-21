define(['common/entity', 'common/entities/missile'], function (Entity, Missile) {

  var Ship = Entity.extend({
    shape: "polygon",
    getShapePoints: function () {
      return [
        {x: 0, y: -this.get('height')},      // nose
        {x: (this.get('width') / 2), y: 0},  // rear right
        {x: -(this.get('width') / 2), y: 0 } // rear left
      ];
    },
    initialize: function () {
      this.set({
        entityType: 'Ship',
        xVel: 0,
        yVel: 0,
        height: 2,
        width: 1,
        color: "red",
        lifespan: 0, // means infinity
        createdAt: Date.now()
      });
    },
    axisUsage: function () {
      var angle = this.get('angle');
      return {
        x:  Math.sin(angle).toFixed(2),
        y:  -Math.cos(angle).toFixed(2)
      }
    },
    fireMissile: function () {

     var power = 50,
          x, 
          y, 
          angle = this.get('angle');
      y = -Math.cos(angle).toFixed(2);
      x = Math.sin(angle).toFixed(2);

      var missile = new Missile({
        xPos:  this.get('xPos') + (1.5 * this.get('height')) * x,
        yPos: this.get('yPos') + (1.5 * this.get('height')) * y,
        xVel: x * power,
        yVel: y * power,
        ownerId: this.id
      });
      return missile;
    },
    accelerate: {
      rotateRight: function () {
        this.get('body').ApplyTorque(10);
      },
      rotateLeft: function () {
        this.get('body').ApplyTorque(-10);
      },
      foreward: function () {
        var power = 1,
            x, 
            y, 
            angle = this.get('angle');
        y = -Math.cos(angle).toFixed(2);
        x = Math.sin(angle).toFixed(2);
        this.get('body').ApplyImpulse(
          { x: x * power, y: y * power},
          this.get('body').GetWorldCenter()
        );
      }
    }
  });

  return Ship;
});
