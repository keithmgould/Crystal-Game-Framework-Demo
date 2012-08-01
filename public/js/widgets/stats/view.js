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
      var that = this;
      CrystalApi.Subscribe("crystalDebug", function (data) {
        switch(data.type) {
          case "lagInfo":
            var avgLag = Math.round( data.avgLag * 100 ) / 100;
            that.$el.find("#crystalStats").find("#avgLag").html(avgLag);
            break;
          case "snapshotInfo":
            that.$el.find("#crystalStats").find("#snapshotInterval").html(data.interval);
            break;
        }
      });
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
