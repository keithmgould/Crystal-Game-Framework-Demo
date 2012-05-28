define(function () {
  console.log("loading radar widget code module");

  var entities = [],
      canvas,
      ctx,
      physics,
      world,
      canvasWidth,
      canvasHeight;

  var update = function () {
      console.log(".");
      requestAnimFrame(update);

      world.Step(
        1 / 60   //frame-rate: 60Hz
        ,  10    //velocity iterations
        ,  10    //position iterations
      );

      // learn about this....
      world.ClearForces();

      updateEntities();
      drawEntities();

  }

  function updateEntities(){
    $.each(entities, function(i, entity){
      entity.update();
    });
  }

  function drawEntities(){
    ctx.clearRect(0,0, canvasWidth, canvasHeight);
    $.each(entities, function(i, entity){
      entity.draw(ctx);
    });
  }

  return function (sb) {

    this.init = function () {
      console.log("starting up radar widget");

      // bind to dom
      canvas = sb.dom.find("canvas")[0];
      ctx = canvas.getContext("2d");
      canvasWidth = ctx.canvas.width;
      canvasHeight = ctx.canvas.height;


      // genesis (create a world)
      physics = new sb.physics;
      world = physics.generateWorld();
      entities.push(new sb.entities.box(10,10));
      physics.placeEntities(entities, world);
      requestAnimFrame(update);
    }

  };
});
