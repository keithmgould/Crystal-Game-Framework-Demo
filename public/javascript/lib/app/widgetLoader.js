/*
 *   Binds a div ID to a Widget.
 *   Note this syntax is a weakness of Require.js, which must have '("")'
 *   for its sugar to work.  I should patch this and submit...
 */

define(function (require) {
  console.log("loading widgetLoader module");

  var widgets = {
    radarWidget : {
      code : require("lib/app/widgets/radar/code"), // note no extention
      template : require("ext/tpl!lib/app/widgets/radar/template.tpl") // note extension
    }
  }

  return widgets;
});
