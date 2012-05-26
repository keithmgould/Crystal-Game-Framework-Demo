require(["lib/widgets", "lib/core/physics"], function (widgets, physics) {
  console.log("loading main module");
  
  // initialize the physics engine
  physics.init();

  // initialize the interface
  widgets.init();
});
