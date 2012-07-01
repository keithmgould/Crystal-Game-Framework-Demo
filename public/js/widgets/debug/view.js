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
      Space.enableDebugDraw(ctx);
    },
    render : function (event) {
      var data = {},
          compiled_template;
      data.canvasHeight = Constants.physics.height;
      data.canvasWidth = Constants.physics.width;

      compiled_template = _.template(Screen, data);
      this.$el.html(compiled_template);
    }
  });
  return debugView;
});
