define( function (require) {
  console.log("loading entityLoader module");

  var entities = {
    box : require("lib/app/entities/box"),
    ship : require("lib/app/entities/ship")
  };

  return entities;

});
