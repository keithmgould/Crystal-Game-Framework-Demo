define(['common/constants','space', 'backbone', 'text!widgets/debug/templates/screen.html', 'underscore', 'common/utility'], function (Constants, Space, Backbone, Screen, _, Utility) {

   var canvas,
       ctx,
       canvasWidth,
       canvasHeight,
       scale,
       world;

  var debugView = Backbone.View.extend({
    el : $("#debugWidget"),
    initialize : function () {
      scale = Constants.physics.scale;
      this.render();
      canvas = this.$el.find("#debugCanvas")[0];
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
        ctx.fillText("x:" + Utility.round(snapshot.x), x, y);
        ctx.fillText("y:" + Utility.round(snapshot.y), x, y + 10);
        ctx.fillText("xv:" + Utility.round(snapshot.xv), x, y + 20);
        ctx.fillText("yv:" + Utility.round(snapshot.yv), x, y + 30);
        ctx.fillText("a:" + Utility.round(snapshot.a), x, y + 40);
        ctx.fillText("av:" + Utility.round(snapshot.av), x, y + 50);
      });
    }
  });
  return debugView;
});
