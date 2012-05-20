CF.namespace("CF.Core");

CF.Core.Physics = (function () {

  var box = CF.Ext.Physics,
      Screen;

  Screen = function () {
    this.scale = 30;
    this.height = 600;
    this.width = 1000;

    this.world = new box.b2World(
      new b2Vec2(0, 0)   //gravity
      ,  true             //allow sleep
    );

    this.fixDef = new box.b2FixtureDef;
    this.fixDef.density = 1.0;
    this.fixDef.friction = 0.5;
    this.fixDef.restitution = 0.2;
  };

  // Places an array of entities.
  CF.Screen.prototype.placeEntities = function(entities){
    that = this;
    $.each(entities, function(i, entity){
    var body = that.buildBody(entity);
    entity.body = body;
    that.fixDef.shape = that.registerShape(entity);
    body.CreateFixture(that.fixDef);
    });
  }

  // Register the positon and dynamics
  CF.Screen.prototype.buildBody = function(entity){
    var bodyDef = new box.b2BodyDef;
    bodyDef.type = box.b2Body.b2_dynamicBody;
    bodyDef.position.x = entity.x;
    bodyDef.position.y = entity.y;
    var body = this.world.CreateBody(bodyDef);
    return body;
  }

  // Register the geometry
  CF.Screen.prototype.registerShape = function(entity){
    var shape = new box.b2PolygonShape;
    // todo: investigate halfWidth and halfHeight
    // replace constants below with halfWidth etc..
    shape.SetAsBox(1, 1);
    return shape;
  }

  return {
    Screen : this.Screen
  };
})();
