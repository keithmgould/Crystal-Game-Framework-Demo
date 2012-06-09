define(["app/constants", "box2d"], function (Constants,xx) {

    // Prep our Box2D variables
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2AABB = Box2D.Collision.b2AABB;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

    // Prep the size of our space
    var scale = Constants.physics.scale;
    var height = Constants.physics.height;
    var width = Constants.physics.width;

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    return {

      // create a world
      generateWorld : function () {
        world = new b2World(
          new b2Vec2(0, 0),  //zero gravity
          true               //allow sleep
        );
        return world;
      },

      // Places an array of entities.
      placeEntities : function (entities, world) {
        that = this;
        $.each(entities, function(i, entity){
          var body = that.buildBody(entity, world);
          entity.set( { body : body } );
          fixDef.shape = that.registerShape(entity);
          body.CreateFixture(fixDef);
        });
      },

      // Register the positon and dynamics
      buildBody : function (entity, world) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = entity.get('xPos');
        bodyDef.position.y = entity.get('yPos');
        var body = world.CreateBody(bodyDef);
        a = 1;
        return body;
      },

      // Register the geometry
      registerShape : function (entity) {
        var shape = new b2PolygonShape;
        // todo: investigate halfWidth and halfHeight
        // replace constants below with halfWidth etc..
        shape.SetAsBox(1, 1);
        return shape;
      }

    }

});

