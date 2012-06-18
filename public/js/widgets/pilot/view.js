define(['common/constants', 'backbone', 'space'], function (Constants, Backbone, Space) {
  var mediator = new Mediator();
  var pilotView = Backbone.View.extend({
    el : $("#pilotWidget"),
    initialize : function () {
      this.listen();
    },
    listen : function () {
      // todo: there needs to be a centralized way to register keystroke 
      // listeners.  Right now its only the pilot but there are two?

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
