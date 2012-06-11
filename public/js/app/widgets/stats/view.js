define(['stats', 'backbone', 'core/space'], function (Stats, Backbone, Space) {
  var stats;
  var statsView = Backbone.View.extend({
    el : $('#statsWidget'),
    initialize : function () {
      stats = new Stats();
      this.$el.html(stats.domElement);
      Space.addToLoopCallbacks(this, this.update);
    },
    update : function () {
      stats.update();
    }
  });

  return statsView;
});
