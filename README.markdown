# CrystalJS

Realtime Multiplayer Game Platform.  Written entirely in JS.

## Stack

### Server:

Node, Socket.io, RequireJS, Underscore

## Client:

Backbone, Underscore


## Major Todo (for included game):

Add and adhere to a "widget API", aka Nicholas Z's "sandbox" (facade pattern)

## Current Goal:

introduce first method to compensate for lag

## Box2D Components refresher:

- Body:     owns mass and velocity
- Shape:    owns collision geometry, friction and restitution.
- Fixture:  binds shapes to bodies.

## Timing refresher:

- Game Loop:        This is the fastest loop.  It runs faster than all loops, so for each iteration we have to check if its time to run
                    the actual update method(s).  With CrystalJS, the serve and client side loop.js files handle this.
- Update (hz):      How often the game loop calls the game's update method.
- FPS (Hz):         Frequency canvas is repainted (drawn).  This is usually called (and thusly tied) to the update frequency.
- Box2D Step (Hz):  Tells how much "time" should pass in the simulation during one step.
                    So 1/30 would mean 1/30th of a second per step.  1/60 would mean 1/60th of a second per step.
                    Given a constant rate of calling Step, increasing this number number will cause the world to "speed up."


