/*
 *   Binds a div ID to a Widget
 */

define(function (require) {
  console.log("loading widgetLoader module");

  var widgets = {
    radarWidget : {
      creator  : require("lib/app/widgets/radar/code"), // note no extention
      template : require("ext/tpl!lib/app/widgets/radar/template.tpl") // note extension
    }
  }

  return widgets;
});
