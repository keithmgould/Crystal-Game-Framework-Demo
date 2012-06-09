define(['app/constants', 'backbone', 'core/space'], function (Constants, Backbone, Space) {
  var mediator = new Mediator();
  var pilotView = Backbone.View.extend({
    el : $("#pilotWidget"),
    initialize : function () {
      this.listen();
    },
    listen : function () {
      console.log("listening...");
      // todo: there needs to be a centralized way to register keystroke 
      // listeners...
      $("body").keydown(function(e){
        switch(e.which)
        {
          case Constants.keystrokes.KEY_LEFT_ARROW:
            Space.mediator.Publish("pilotControl", { keystroke : "left" });
            break;
          case Constants.keystrokes.KEY_UP_ARROW:
            Space.mediator.Publish("pilotControl", { keystroke : "up" });
            break;
          case Constants.keystrokes.KEY_RIGHT_ARROW:
            Space.mediator.Publish("pilotControl", { keystroke : "right" });
            break;
        }
      });
    }
  });
  return pilotView;
});
