define(['core/entity'], function (Entity) {
  var Ship = Entity.extend({
    initialize : function () {
      this.set({ height : 1, width: 1, color : "red" });
    }
  });

  return Ship;
});
