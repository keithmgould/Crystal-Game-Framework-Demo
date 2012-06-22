define(['common/constants', 'backbone', 'space'], function (Constants, Backbone, Space) {
  var pilotView = Backbone.View.extend({
    el : $("#pilotWidget"),
    initialize : function () {
      this.listen();
    },
    listen : function () {
      var validKeys = _.values(Constants.keystrokes);
      $("body").keydown(function(e){
        if(_.include(validKeys, e.which)){
          console.log("just pressed valid key: " + e.which);
          Space.mediator.Publish("pilotControl", { keystroke : e.which });
        }else{
          console.log("invalid key pressed: " + e.which);
        }
      });
    }
  });
  return pilotView;
});
