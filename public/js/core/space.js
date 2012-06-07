define(['core/physics', 'app/entities/box'], function (Physics, Box) {
  // not sure where else to place this?
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(/* function */ callback, /* DOMElement */ element){
                  window.setTimeout(callback, 1000 / 60);
                };
  })();
  
  var world;
  var entities = [];
  var loopCallbacks = [];
  var selfShip; // holds the Self (Ship) entity
  var update = function () {
    requestAnimFrame(update);
    world.Step(1/60, 10, 10);
    world.ClearForces();
    updateEntities();
    runLoopCallbacks();
  };

  var updateEntities = function () {
    $.each(entities, function(i, entity){
      entity.update();
    });
  };

  var runLoopCallbacks = function () {
    $.each(loopCallbacks, function (i, callback) {
      var fn = callback.fn;
      var scope = callback.scope;
      fn.call(scope);
    });
  };


  return {
    addToLoopCallbacks : function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    setSelfShip : function (ship) {
      selfShip = ship;
    },
    getSelfShip : function () { return selfShip },
    generateSpace : function () {
      world = Physics.generateWorld();
      requestAnimFrame(update);
    },
    addBox : function (name, isSelfShip, xPos, yPos) {
      var box = new Box({ xPos: xPos, yPos : yPos});
      box.set({name : name});
      if(isSelfShip) {
        box.set({ selfShip : true});
        this.setSelfShip(box);
      }
      entities.push(box);
      Physics.placeEntities([box], world);
    }
  };
});
