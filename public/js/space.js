define(['common/entityLoader', 'underscore', 'mediator', 'crystal/common/api'], function (EntityLoader, _, Mediator, CrystalApi) {

  var entities = [],                  // holds all entities
      selfShip,                       // pointer to entity that is our own ship
      loopCallbacks = [],             // lets widgets etc have callbacks during the update method
      mediator = new Mediator();      // mediator instance used for cross-talk by widgets etc..

  
  /**
   * initPubSub
   *
   * both game internal communication, as well as game commuication with crystal framework
   * is done using the mediator pattern.  There are two mediator instances below.  One owned
   * by this Space module (game), and one owned by crystal framework.  The initPubSub initializes Publishers
   * and Subscriptions to both mediator instances.
   */

  var initPubSub = function () {
    // listen for pilot controls (from Pilot Widget)
    mediator.Subscribe('pilotControl', function (data) {
      if(_.isObject(selfShip)){
        CrystalApi.Publish('messageToServer', {target: 'game', type: 'pilotControl', message: {key: data.keystroke}});
      }else{
        throw new Error("received pilot control but selfship is: " + typeof(selfShip));
      }
    });

    // listen for messages from Crystal's Loop.
    // We should receive this 60 times per second
    CrystalApi.Subscribe('update', function (data) {
      update(data);
    });

    // listen for messages from the server (via Crystal's Transporter)
    CrystalApi.Subscribe('messageFromServer:game', function (data) {
      switch(data.type){
        case "shipDelivery":
          generateSelfShip(data.message);
          break;
        default:
          throw new Error("we have a message with an unknown type: " + data.type);
      }
    });

  }

  var requestSelfShip = function () {
    CrystalApi.Publish('messageToServer', {target: 'game', type: 'requestShip', message: {}});
  }

  var generateSelfShip = function (data){
    console.log("generating selfship!");
    addShip(true, data.x, data.y, data.a, data.id);
    mediator.Publish("selfShip", selfShip);
  }

  var update = function (data) {
    updateEntities();
    runLoopCallbacks();
  };

  var updateEntities = function () {
    _.each(entities, function(entity){
      entity.update();
    });
  };

  var runLoopCallbacks = function () {
    _.each(loopCallbacks, function (callback) {
      var fn = callback.fn;
      var scope = callback.scope;
      fn.call(scope);
    });
  };

  var addShip = function (isSelfShip, xPos, yPos, angle, id) {
    var ship = new EntityLoader.Ship({ xPos: xPos, yPos: yPos, angle: angle, id: id});
    if(isSelfShip) {
      ship.set({ selfEntity: true, color: "blue"});
      selfShip = ship;
    }else{
      ship.set({ color : "red" });
    }
    entities.push(ship);
    CrystalApi.Publish("addEntity", ship, function() {
      if(isSelfShip){
        mediator.Publish("generatedSelfShip", ship);
      }
    });
    return ship;
  };

  return {
    mediator: mediator,
    getEntities: function () { return entities; },
    getSelfShip: function () { return selfShip; },
    hasSelfShip: function () {
      return !(typeof selfShip === 'undefined');
    },
    initialize: function () {
      initPubSub();
      requestSelfShip();
      
    },
    addToLoopCallbacks: function (scope, fn) {
      loopCallbacks.push({ scope : scope, fn : fn});
    },
    enableDebugDraw: function (context) {
      CrystalApi.Publish("enableDebugDraw", context);
    }
  };
});
