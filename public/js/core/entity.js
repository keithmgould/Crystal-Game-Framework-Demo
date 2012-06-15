define(['backbone'], function (Backbone) {
  var Entity = Backbone.Model.extend({

    update: function(){
      this.set({xPos : this.get('body').GetPosition().x});
      this.set({yPos : this.get('body').GetPosition().y});
      this.set({angle : this.get('body').GetAngle()});
    },
    getSnapshot: function () {
      var angVel = this.get('body').GetAngularVelocity();
      var linVel = this.get('body').GetLinearVelocity();
      return {
        id: this.id,
        x: this.get('xPos'),
        y: this.get('yPos'),
        a: this.get('angle'),
        xv: linVel.x,
        yv: linVel.y,
        av: angVel
      };
    },
    applySnapshot: function (snapshot) {
      var body = this.get('body');
      console.log('in Entity#applySnapshot');
      console.log('angle: ' + snapshot.a + ", av: " + snapshot.av);
      body.SetPositionAndAngle({x: snapshot.x, y: snapshot.y}, snapshot.a);
      body.SetLinearVelocity({x: snapshot.xv, y: snapshot.yv});

      // not sure why but I can't Set Angular Velocity if 
      // the existing angular velocity is zero.  but I CAN
      // apply a torque.  Curious....
      if(body.GetAngularVelocity() === 0 && snapshot.av != 0){
        body.ApplyTorque(0.01);
      }
      body.SetAngularVelocity(snapshot.av);
    }
  });

  return Entity;
});
