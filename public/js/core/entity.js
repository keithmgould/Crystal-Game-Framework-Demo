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
      console.log('actually applying snapshot');
      body.SetPosition({x: snapshot.x, y: snapshot.y});
      body.SetLinearVelocity({x: snapshot.xv, y: snapshot.yv});
      body.SetAngularVelocity(snapshot.av);
    }
  });

  return Entity;
});
