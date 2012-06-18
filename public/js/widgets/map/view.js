define(['common/constants','space', 'backbone', 'text!widgets/map/templates/screen.html', 'underscore'], function (Constants, Space, Backbone, Screen, _) {

   var canvas,
       ctx,
       canvasWidth,
       canvasHeight,
       scale,
       world;

  var round = function (floater, deg) {
    var deg = deg || 2,
        multiple = 10 * deg;
    return Math.round(floater * multiple) / multiple;
  }

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
      this.drawEntityFlightInfo();
      world.ClearForces();
    },
    drawEntityFlightInfo : function () {
      var entities = Space.getEntities(),
          x,
          y,
          snapshot,
          text;

      _.each(entities, function (entity) {
        snapshot = entity.getSnapshot();
        x = scale * entity.get('xPos') + 10;
        y = scale * entity.get('yPos') - 25;
        ctx.fillText("x:" + round(snapshot.x), x, y);
        ctx.fillText("y:" + round(snapshot.y), x, y + 10);
        ctx.fillText("xv:" + round(snapshot.xv), x, y + 20);
        ctx.fillText("yv:" + round(snapshot.yv), x, y + 30);
        ctx.fillText("a:" + round(snapshot.a), x, y + 40);
        ctx.fillText("av:" + round(snapshot.av), x, y + 50);
      });
    }
  });
  return mapView;
});
