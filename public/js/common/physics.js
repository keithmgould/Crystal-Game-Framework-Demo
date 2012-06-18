define(["common/constants", "box2d", "underscore"], function (Constants, Box, _) {

    // Prep our Box2D variables
    var b2Vec2 = Box.Common.Math.b2Vec2;
    var b2AABB = Box.Collision.b2AABB;
    var b2BodyDef = Box.Dynamics.b2BodyDef;
    var b2Body = Box.Dynamics.b2Body;
    var b2FixtureDef = Box.Dynamics.b2FixtureDef;
    var b2Fixture = Box.Dynamics.b2Fixture;
    var b2World = Box.Dynamics.b2World;
    var b2MassData = Box.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box.Dynamics.b2DebugDraw;
    var b2RevoluteJointDef = Box.Dynamics.Joints.b2RevoluteJointDef;
    var b2MouseJointDef =  Box.Dynamics.Joints.b2MouseJointDef;

    // Prep the size of our space
    var scale = Constants.physics.scale;
    var height = Constants.physics.height;
    var width = Constants.physics.width;

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.5; // 0 = no energy transfer (no bounce).  1 = 100% transfer


    // Register the positon and dynamics
    var buildBody = function (entity, world) {
      var bodyDef = new b2BodyDef,
          body;
      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = entity.get('xPos');
      bodyDef.position.y = entity.get('yPos');
      bodyDef.angle      = entity.get('angle');
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

    var placeEntities = function (entities, world) {
      _.each(entities, function(entity){
        var body = buildBody(entity, world);
        entity.set( { body: body } );
        switch (entity.shape) {
          case "polygon":
            fixDef.shape = registerPolygonShape(entity);
          default:
            console.log("unknown entity shape in physics#placeEntites");
            break;
        }
        body.CreateFixture(fixDef);
      });
    }

    var enableDebugDraw = function (world, context) {
      var debugDraw = new b2DebugDraw();
      debugDraw.SetSprite(context);
      debugDraw.SetDrawScale(Constants.physics.scale);
      debugDraw.SetFillAlpha(0.3);
      debugDraw.SetLineThickness(1.0);
      debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
      world.SetDebugDraw(debugDraw);
    }

    var generateWalls = function (world) {
      var scale = Constants.physics.scale,
          cwidth = Constants.physics.width / scale,
          cheight = Constants.physics.height / scale,
          bodyDef = new b2BodyDef;
      bodyDef.type = b2Body.b2_staticBody;
      fixDef.shape = new b2PolygonShape;
      // south
      bodyDef.position.x = cwidth / 2;
      bodyDef.position.y = cheight;
      fixDef.shape.SetAsBox( cwidth / 2, cheight / 30);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
      // north
      bodyDef.position.x = cwidth / 2;
      bodyDef.position.y = 0;
      fixDef.shape.SetAsBox( cwidth / 2, cheight / 30);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
      // east
      bodyDef.position.x = cwidth;
      bodyDef.position.y = cheight / 2;
      fixDef.shape.SetAsBox( cwidth / 30, cheight / 2);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
      // west
      bodyDef.position.x = 0;
      bodyDef.position.y = cheight / 2;
      fixDef.shape.SetAsBox( cwidth / 30, cheight / 2);
      world.CreateBody(bodyDef).CreateFixture(fixDef);
    }

    var generateWorld = function () {
      var world = new b2World(
        new b2Vec2(0, 0),  //zero gravity (x,y)
        true               //allow sleep
      );
      generateWalls(world);
      return world;
    }

    return {
      generateWorld : generateWorld,
      enableDebugDraw : enableDebugDraw,
      placeEntities : placeEntities,
      removeEntity : function (entity, world) {
        var body = entity.get('body');
        world.DestroyBody(body);
      }
    }
});

