define(['backbone'], function (Backbone) {
  var Entity = Backbone.Model.extend({

    shape: "box",
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
        av: angVel,
        type: this.get('entityType'),
        ownerId: 69 // fix
      };
    },
    applySnapshot: function (snapshot) {
      var body = this.get('body'),
          linVel;
      console.log('in Entity#applySnapshot');
      console.log('angle: ' + snapshot.a + ", av: " + snapshot.av);
      body.SetPositionAndAngle({x: snapshot.x, y: snapshot.y}, snapshot.a);

      // not sure why but I can't Set Angular Velocity or 
      // linVel if the existing lin/ang velocity is zero.  
      // but I CAN apply a torque/impulse.
      // So I do that first. Curious....

      linVel = body.GetLinearVelocity();
      if(linVel.x == 0 && linVel.y == 0 && (snapshot.xv != 0 || snapshot.yv != 0)){
          console.log("trying to set linVel");
          body.ApplyImpulse(
            {x: 1, y: 1},
            body.GetWorldCenter());
      }
      body.SetLinearVelocity({x: snapshot.xv, y: snapshot.yv});

      // for explanation of this strangeness see comments above.
      if(body.GetAngularVelocity() == 0 && snapshot.av != 0){
        body.ApplyTorque(0.1);
      }
      body.SetAngularVelocity(snapshot.av);
    }
  });

  return Entity;
});
