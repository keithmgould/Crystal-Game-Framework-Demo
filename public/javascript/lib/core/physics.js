define(["ext/Box2dWeb-2.1.a.3.min"], function (xx) {
  console.log("loading Physics module");


  // not sure where else to place this?
  // Once this works see if we can move it into the object below (Physics object)
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // later update this to just block out sucky browsers
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




  return {

    init : function () {
      // Prep our Box2D variables
      this.b2Vec2 = Box2D.Common.Math.b2Vec2;
      this.b2AABB = Box2D.Collision.b2AABB;
      this.b2BodyDef = Box2D.Dynamics.b2BodyDef;
      this.b2Body = Box2D.Dynamics.b2Body;
      this.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
      this.b2Fixture = Box2D.Dynamics.b2Fixture;
      this.b2World = Box2D.Dynamics.b2World;
      this.b2MassData = Box2D.Collision.Shapes.b2MassData;
      this.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
      this.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
      this.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
      this.b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
      this.b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

      // todo: move these values into constants
      this.scale = 30;
      this.height = 600;
      this.width = 1000;
      this.world = new this.b2World(
        new this.b2Vec2(0, 0),  //zero gravity
        true                    //allow sleep
      );

      this.fixDef = new this.b2FixtureDef;
      this.fixDef.density = 1.0;
      this.fixDef.friction = 0.5;
      this.fixDef.restitution = 0.2;
      requestAnimFrame(this.update);
    },

    // Places an array of entities.
    placeEntities : function(entities){
      that = this;
      $.each(entities, function(i, entity){
      var body = that.buildBody(entity);
      entity.body = body;
      that.fixDef.shape = that.registerShape(entity);
      body.CreateFixture(that.fixDef);
      });
    },

    // Register the positon and dynamics
    buildBody : function(entity){
      var bodyDef = new this.b2BodyDef;
      bodyDef.type = box.b2Body.b2_dynamicBody;
      bodyDef.position.x = entity.x;
      bodyDef.position.y = entity.y;
      var body = this.world.CreateBody(bodyDef);
      return body;
    },

    // Register the geometry
    registerShape : function(entity){
      var shape = new this.b2PolygonShape;
      // todo: investigate halfWidth and halfHeight
      // replace constants below with halfWidth etc..
      shape.SetAsBox(1, 1);
      return shape;
    },
    update : function () {
      this.world.Step(
        1 / 60   //frame-rate: 60Hz
        ,  10    //velocity iterations
        ,  10    //position iterations
      );
 
     // learn about this....
     this.world.ClearForces();

     //updateEntities();
     //drawEntities();
     requestAnimFrame(this.update);
    }
  };
});
