define(['core/space', 'backbone', 'text!app/widgets/radar/templates/screen.html'], function (Space, Backbone, Screen) {
  var radarView = Backbone.View.extend({
    el : $("#radarWidget"),
    initialize : function () {
      Space.addToLoopCallbacks(this, this.render);
      this.render();
    },
    render : function (event) {
      if( typeof Space.getSelfShip() == "object"){
        coords = Space.getSelfShip().get('body').GetPosition();
        data = { xpos : coords.x, ypos : coords.y};
      } else {
        data = { xpos : -1, ypos : -1};
      }
      var compiled_template = _.template(Screen, data);
      this.$el.html(compiled_template);
    }
  });
  return radarView;
});
