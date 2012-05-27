define(["lib/core/sandbox", "lib/core/transport", "lib/app/widgetLoader"], function (Sandbox, Transport, Widgets) {
  console.log("loading widget module");
  var widgets = {};

  return {
    init : function () {
      this.create_all_widgets();
      this.start_all_widgets();
      Transport.on(this.emit);
    },
    unique_id : function () {
      // todo: check against existing IDs...
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },
    create_all_widgets : function () {
      var widget, randID;
      for(widget in Widgets){
        this.create_widget(widget, Widgets[widget]);
      }
    },
    create_widget : function (widgetID, widget) {
      // store widget
      widgets[widgetID] = {
        create : widget["creator"],
        instance : null
      };
      // place widget template
      $("#" + widgetID).html(widget["template"]());
    },
    place_template : function (widgetID) {
    
    },
    start_widget : function(widgetID) {
      var widget = widgets[widgetID];
      if (widget) {
        sb = new Sandbox(this, widgetID);
        widget.instance = widget.create(sb);
        widget.instance.init();
      }
    },
    start_all_widgets : function () {
      var widgetID;
      for(widgetID in widgets){
        this.start_widget(widgetID);
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
