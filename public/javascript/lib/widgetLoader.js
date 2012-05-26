define(function (require) {
  console.log("loading widgetLoader module");

  var widgets = [
    require("lib/widgets/radar")
  ]

  return widgets;
});
