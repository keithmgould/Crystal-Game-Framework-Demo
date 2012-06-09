define(['core/entity'], function (Entity) {

  var Ship = Entity.extend({
    initialize : function () {
      this.set({ height : 1, width: 1, color : "red" });
    },
    accelerate : {
      rotateRight : function () {
        this.get('body').ApplyTorque(50);
      },
      rotateLeft : function () {
        this.get('body').ApplyTorque(-50);
      },
      foreward : function () {}
    }
  });

  return Ship;
});
