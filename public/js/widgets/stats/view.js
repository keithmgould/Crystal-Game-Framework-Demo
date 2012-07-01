define(['stats', 'backbone', 'space','text!widgets/stats/templates/screen.html'], function (Stats, Backbone, Space, Screen) {
  var stats;
  var statsView = Backbone.View.extend({
    initialize: function () {
      this.render();
      Space.addToLoopCallbacks(this, this.update);
    },
    render: function () {
      var compiledTemplate = _.template(Screen);
      stats = new Stats();
      $("#devTools").append(this.el);
      this.$el.html(compiledTemplate);
      this.$el.find("#fpsStats").html(stats.domElement);
    },
    update: function () {
      stats.update();
    }
  });

  return statsView;
});
