define(["app/constants", "box2d", "underscore"], function (Constants, Box, _) {

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
    fixDef.restitution = 0.2;


    // Register the positon and dynamics
    var buildBody = function (entity, world) {
      var bodyDef = new b2BodyDef,
          body;
      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = entity.get('xPos');
      bodyDef.position.y = entity.get('yPos');
      body = world.CreateBody(bodyDef);
      return body;
    }

    var registerShipShape = function (entity) {
      var height      = entity.get('height'),
          halfWidth   = entity.get('width') / 2,
          vec         = b2Vec2(),
          points      = [],
          shape       = new b2PolygonShape;

      points.push(new b2Vec2(0, -height)); // nose
      points.push(new b2Vec2(halfWidth, 0)); // rear right
      points.push(new b2Vec2(-halfWidth, 0)); // rear left
      shape.SetAsArray(points);
      return shape;
    }

    return {

      box2d : {
        b2Vec2 : b2Vec2
      },

      generateWorld : function () {
        world = new b2World(
          new b2Vec2(0, 0),  //zero gravity (x,y)
          true               //allow sleep
        );
        return world;
      },

      enableDebugDraw : function (world, context) {
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(context);
        debugDraw.SetDrawScale(Constants.physics.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
      },

      // Places an array of entities.
      placeEntities : function (entities, world) {
        _.each(entities, function(entity){
          var body = buildBody(entity, world);
          entity.set( { body : body } );
          fixDef.shape = registerShipShape(entity);
          body.CreateFixture(fixDef);
        });
      }
    }
});

