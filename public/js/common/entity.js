define(['backbone', 'common/utility'], function (Backbone, Utility) {
  var Entity = Backbone.Model.extend({

    shape: "box",
    update: function(){
      if(this.suicideIfGeriatric()){
        return {status: 'suicide'};
      }else{
        this.set({xPos : this.get('body').GetPosition().x});
        this.set({yPos : this.get('body').GetPosition().y});
        this.set({angle : this.get('body').GetAngle()});
        return {status: 'ok'}
      }
    },
    suicideIfGeriatric: function () {
      var lifespan = this.get('lifespan');
      if(lifespan === 0){ return false; } // live forever
      if(Date.now() > lifespan + this.get('createdAt')){
        return true;
      }else{
        return false;
      }
    },
    getSnapshot: function () {
      var angVel = this.get('body').GetAngularVelocity();
      var linVel = this.get('body').GetLinearVelocity();
      return {
        id: this.id,
        x: Utility.round(this.get('xPos'),4),
        y: Utility.round(this.get('yPos'),4),
        a: Utility.round(this.get('angle'),4),
        xv: Utility.round(linVel.x,4),
        yv: Utility.round(linVel.y,4),
        av: Utility.round(angVel,4),
        type: this.get('entityType'),
        ownerId: 69 // fix
      };
    },
    applySnapshot: function (snapshot) {
      var body = this.get('body'),
          linVel;
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
