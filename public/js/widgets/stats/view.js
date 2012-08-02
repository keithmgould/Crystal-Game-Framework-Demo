// This widget, like the datgui widget is a dev widget and is not part of the game.
// so it does not (have to) adhere to the standard widget encapsulation.
define(['stats', 
        'backbone', 
        'space',
        'crystal/common/api',
        'text!widgets/stats/templates/screen.html'], function (Stats, Backbone, Space, CrystalApi, Screen) {
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
