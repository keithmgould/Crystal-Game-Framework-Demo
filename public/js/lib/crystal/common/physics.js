define(["common/constants", "crystal/common/lib/box2d.min", "crystal/common/api", "underscore"], function (Constants, Box, CrystalApi, _) {

        // Prep our Box2D variables
    var b2Vec2            = Box.Common.Math.b2Vec2,
        b2AABB            = Box.Collision.b2AABB,
        b2BodyDef         = Box.Dynamics.b2BodyDef,
        b2Body            = Box.Dynamics.b2Body,
        b2FixtureDef      = Box.Dynamics.b2FixtureDef,
        b2FixtureDef      = Box.Dynamics.b2Fixture,
        b2World           = Box.Dynamics.b2World,
        b2MassData        = Box.Collision.Shapes.b2MassData,
        b2PolygonShape    = Box.Collision.Shapes.b2PolygonShape,
        b2CircleShape     = Box.Collision.Shapes.b2CircleShape,
        b2DebugDraw       = Box.Dynamics.b2DebugDraw,
        b2RevoluteJointDef = Box.Dynamics.Joints.b2RevoluteJointDef,
        b2MouseJointDef   =  Box.Dynamics.Joints.b2MouseJointDef,

        // Prep the size of our space
        scale   = Constants.physics.scale,
        height  = Constants.physics.height,
        width   = Constants.physics.width,

        // Holds instance of the physics engine
        world;

    // Prep a fixture for future use
    var fixDef          = new b2FixtureDef;
    fixDef.density      = 1.0;
    fixDef.friction     = 0.5;
    fixDef.restitution  = 0.5; // 0 = no energy transfer (no bounce).  1 = 100% transfer (bounce)

    var initialize = function () {
      CrystalApi.Subscribe("generateWorld", function (data) {
        generateWorld();
      });

      CrystalApi.Subscribe("addEntity", function (data) {
        placeEntity(data);
      });

      CrystalApi.Subscribe("removeEntity", function (data) {
        removeEntity(data);
      });
    }

    var step = function () {
      world.Step(1/60, 10, 10); // Hz, Iteration, Position
      world.ClearForces();
    }


    // Register the positon and dynamics
    var buildBody = function (entity) {
      var bodyDef = new b2BodyDef,
          body;
      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = entity.get('xPos');
      bodyDef.position.y = entity.get('yPos');
      bodyDef.angle      = entity.get('angle');
      bodyDef.linearVelocity = {x: entity.get('xVel'), y: entity.get('yVel')};
      body = world.CreateBody(bodyDef);
      return body;
    }

    var registerPolygonShape = function (entity) {
      var points = [],
          shape = new b2PolygonShape;
      _.each(entity.getShapePoints(), function (point) {
        points.push(point)
      });
      shape.SetAsArray(points);
      return shape;
    }

    var registerCircleShape = function (entity) {
      var shape = new b2CircleShape( entity.get('radius'));
      return shape;
    }

    var placeEntity = function (entity) {
      var body = buildBody(entity);
      entity.set( { body: body } );
      switch (entity.shape) {
        case "polygon":
          fixDef.shape = registerPolygonShape(entity);
          break;
        case "circle":
          fixDef.shape = registerCircleShape(entity);
          break;
        case "box":
          fixDef.shape = registerBoxShape(entity);
          break;
        default:
          throw new Error("unknown entity shape in physics#placeEntites: " + entity.shape);
          break;
      }
      body.CreateFixture(fixDef);      
    }

    var placeEntities = function (entities) {
      _.each(entities, function(entity){
        placeEntity(entity);
      });
    }

    var removeEntity = function () {
      var body = entity.get('body');
      world.DestroyBody(body);
    }

    var enableDebugDraw = function (context) {
      var debugDraw = new b2DebugDraw();
      debugDraw.SetSprite(context);
      debugDraw.SetDrawScale(Constants.physics.scale);
      debugDraw.SetFillAlpha(0.3);
      debugDraw.SetLineThickness(1.0);
      debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
      world.SetDebugDraw(debugDraw);
    }

    // todo: move this to the Space game.  
    // todo: Create a registerBoxShape method.
    var generateWalls = function () {
      var scale = Constants.physics.scale,
          cwidth = Constants.physics.width / scale,
          cheight = Constants.physics.height / scale,
          bodyDef = new b2BodyDef;
      console.log("scale: " + scale);
      console.log("cwidth: " + cwidth);
      console.log("cheight: " + cheight);
      bodyDef.type = b2Body.b2_staticBody;
      fixDef.shape = new b2PolygonShape;
      // south
      bodyDef.position.x = cwidth / 2;
      bodyDef.position.y = cheight;
      fixDef.shape.SetAsBox( cwidth / 2, 0.5);
      console.log("world: " + world);
      foo = world.CreateBody(bodyDef);
      console.log("foo: " + foo);
      console.log("fixDef: " + fixDef);
      foo.CreateFixture(fixDef);
      // world.CreateBody(bodyDef).CreateFixture(fixDef);
      // north
      bodyDef.position.x = cwidth / 2;
      bodyDef.position.y = 0;
      fixDef.shape.SetAsBox( cwidth / 2, 0.5);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
      // east
      bodyDef.position.x = cwidth;
      bodyDef.position.y = cheight / 2;
      fixDef.shape.SetAsBox( 0.5, cheight / 2);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
      // west
      bodyDef.position.x = 0;
      bodyDef.position.y = cheight / 2;
      fixDef.shape.SetAsBox( 0.5, cheight / 2);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
    }

    var generateWorld = function () {
      world = new b2World(
        new b2Vec2(0, 0),  //zero gravity (x,y)
        true               //allow sleep
      );
      generateWalls();
    }

    return {
      initialize: initialize
    }
});

