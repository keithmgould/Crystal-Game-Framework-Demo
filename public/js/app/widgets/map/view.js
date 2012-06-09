define(['app/constants','core/space', 'backbone', 'text!app/widgets/map/templates/screen.html'], function (Constants, Space, Backbone, Screen) {

   var stage,
       canvasWidth,
       canvasHeight,
       scale,
       world;

  var mapView = Backbone.View.extend({
    el : $("#mapWidget"),
    initialize : function () {
      scale = Constants.physics.scale;
      this.render();
      canvas = this.$el.find("#mapCanvas")[0];
      ctx = canvas.getContext("2d");
      canvasWidth = ctx.canvas.width;
      canvasHeight = ctx.canvas.height;
      world = Space.getWorld();
      Space.enableDebugDraw(ctx);
      Space.addToLoopCallbacks(this, this.drawDebug);
    },
    render : function (event) {
      var data = {},
          compiled_template;
      data.canvasHeight = Constants.physics.height;
      data.canvasWidth = Constants.physics.width;

      compiled_template = _.template(Screen, data);
      this.$el.html(compiled_template);
    },
    drawDebug : function () {
      world.DrawDebugData();
      world.ClearForces();
    }
  });
  return mapView;
});
