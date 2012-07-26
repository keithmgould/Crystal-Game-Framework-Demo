define(['crystal/common/entity', 'common/entities/missile', 'common/constants', 'underscore'], function (Entity, Missile, Constants, _) {

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
        angularVel: 0,
        xVel: 0,
        yVel: 0,
        height: 2,
        width: 1,
        color: "red",
        lifespan: 0, // means infinity
        createdAt: Date.now()
      });
    },

    pilotControl: function (command) {
      switch(command)
      {
        case Constants.keystrokes.KEY_LEFT_ARROW:
          this.rotateLeft();
          break;
        case Constants.keystrokes.KEY_RIGHT_ARROW:
          this.rotateRight();
          break;
        case Constants.keystrokes.KEY_UP_ARROW:
          this.thrust();
          break;
        case Constants.keystrokes.KEY_SPACE_BAR:
          //What to do?
          break;
        default:
          console.log("don't know what to do with this valid key yet...");
      }
    },
    fireMissile: function () {

     var power = 50,
          x, 
          y, 
          angle = this.get('angle');
      y = -Math.cos(angle).toFixed(2);
      x = Math.sin(angle).toFixed(2);

      // var missile = new Missile({
      //   xPos:  this.get('xPos') + (1.5 * this.get('height')) * x,
      //   yPos: this.get('yPos') + (1.5 * this.get('height')) * y,
      //   xVel: x * power,
      //   yVel: y * power,
      //   ownerId: this.id
      // });
      // return missile;
    },

    rotateRight: function () {
      this.get('body').ApplyTorque(10);
    },
    rotateLeft: function () {
      this.get('body').ApplyTorque(-10);
    },
    thrust: function () {
      var body = this.get('body'),
          power = 1,
          x, 
          y, 
          angle = body.GetAngle();
      y = -Math.cos(angle).toFixed(2);
      x = Math.sin(angle).toFixed(2);
      body.ApplyImpulse(
        { x: x * power, y: y * power},
        body.GetWorldCenter()
      );
    }
  });

  return Ship;
});
