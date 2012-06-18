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
        height: 2, 
        width: 1, 
        color: "red"});
    },
    fireMissile: function () {

     var power = 1,
          x, 
          y, 
          angle = this.get('angle');
      y = -Math.cos(angle).toFixed(2);
      x = Math.sin(angle).toFixed(2);

      var missile = new Missile({
        xPos: 10,
        yPos: 10,
        xVel: x * power,
        yVel: y * power,
        ownerId: this.id
      });
      return missile;
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
          { x: x * power, y: y * power},
          this.get('body').GetWorldCenter()
        );
      }
    }
  });

  return Ship;
});
