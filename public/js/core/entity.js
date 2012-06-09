define(['backbone'], function (Backbone) {
  var Entity = Backbone.Model.extend({

    update: function(){
      this.set({xPos : this.get('body').GetPosition().x});
      this.set({yPos : this.get('body').GetPosition().y});
      this.set({angle : this.get('body').GetAngle()});
    }
  });

  return Entity;
});
