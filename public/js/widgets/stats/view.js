define(['stats', 'backbone', 'space','text!widgets/stats/templates/screen.html'], function (Stats, Backbone, Space, Screen) {
  var stats;
  var statsView = Backbone.View.extend({
    el : $('#statsWidget'),
    initialize : function () {
      this.render();
      Space.addToLoopCallbacks(this, this.update);
    },
    render: function () {
      var compiledTemplate = _.template(Screen);
      stats = new Stats();
      this.$el.html(compiledTemplate);
      this.$el.find("#fpsStats").html(stats.domElement);
    },
    update : function () {
      this.$el.find("#lag").html(Space.lastLag);
      stats.update();
    }
  });

  return statsView;
});
