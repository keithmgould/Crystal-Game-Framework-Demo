define(["lib/sandbox", "lib/core/transport", "lib/widgets"], function (Sandbox, Transport, Widgets) {
  console.log("loading core");
  var widgets = {};

  return {
    init : function () {
      this.create_all_widgets();
      this.start_all();
      Transport.listen(this.emit);
    },
    create_all_widgets : function () {
      var widgetID;
      for(widgetID in Widgets){
        this.create_widget(widgetID, Widgets[widgetID]);
      }
    },
    create_widget : function (widgetID, creator) {
      widgets[widgetID] = {
        create : creator,
        instance : null
      };
    },
    start : function(widgetID) {
      var widget = widgets[widgetID];
      if (widget) {
        sb = new Sandbox(this, widgetID);
        widget.instance = widget.create(sb);
        widget.instance.init();
      }
    },
    start_all : function () {
      var widgetID;
      for(widgetID in widgets){
        this.start(widgetID);
      }
    },
    on : function (msgs, widget) {
      if (widgets[widget]) {
          widgets[widget].events = msgs;
      } else {
          this.log(1, "");
      }
    },
    emit : function (msg) {
        var widget;
        for (widget in widgets) {
            if (widgets.hasOwnProperty(widget)){
                widget = widgets[widget];
                if (widget.events && widget.events[msg.type]) {
                    widget.events[msg.type](msg.data);
                }
            }
        }
        Transport.emit(msg);
    }
  }
});
