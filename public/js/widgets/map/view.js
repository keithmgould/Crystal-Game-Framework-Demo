define(['common/constants','space', 'backbone', 'text!widgets/map/templates/screen.html', 'underscore'], function (Constants, Space, Backbone, Screen, _) {

   var canvas,
       ctx,
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
      this.drawEntityFlightInfo();
      world.ClearForces();
    },
    drawEntityFlightInfo : function () {
      var entities = Space.getAllEntities(),
          x,
          y,
          snapshot,
          text;

      _.each(entities, function (entity) {
        snapshot = entity.getSnapshot();
        x = scale * entity.get('xPos') + 10;
        y = scale * entity.get('yPos') - 25;
        ctx.fillText("x:" + snapshot.x, x, y);
        ctx.fillText("y:" + snapshot.y, x, y + 10);
        ctx.fillText("xv:" + snapshot.xv, x, y + 20);
        ctx.fillText("yv:" + snapshot.yv, x, y + 30);
        ctx.fillText("a:" + snapshot.a, x, y + 40);
        ctx.fillText("av:" + snapshot.av, x, y + 50);
      });
    }
  });
  return mapView;
});
