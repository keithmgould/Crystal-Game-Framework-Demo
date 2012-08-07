# Crystal

Crystal is a client/server "twitch" game platform with:
- physics engine (box2d), (server side and client side)
- authorative server (no cheating!)
- client-side prediction and jerk-free error correction (makes latency acceptable)
- client-side interpolation (handles entity location inbetween snapshots)
- coming soon: server-side lag compensation

## Details

When playing multiplayer real-time "twitch" games, there is a lot needed to make the experience fun.  Any sort of lag makes the user experience suck for a number of reasons, and lag is inevitable.  There are extensive solutions to these problems (see references below), but they are all locked inside of huge game engines such as Valve's Source Engine.

Crystal brings these solutions to browser based games written in javascript.

### Server:

Node, Socket.io, RequireJS, Underscore

### Client:

Backbone, Underscore

## Timing refresher:

Timing is everything.  There are a few different timing concepts needed to understand what is going on with Crystal.

- Game Loop:        This is the fastest loop.  It runs faster than all loops, so for each iteration we have to check if its time to run
                    the actual update method(s).  With Crystal, the server and client side loop.js files handle this.
- Update (hz):      How often the game loop calls the game's update method.  Usually between 30 and 60 times per sec.
- FPS (Hz):         Frequency canvas is repainted (drawn).  This is usually called (and thusly tied) to the update frequency.
- Box2D Step (Hz):  Tells how much "time" should pass in the simulation during one step.
                    So 1/30 would mean 1/30th of a second per step.  1/60 would mean 1/60th of a second per step.
                    Given a constant rate of calling Step, increasing this number number will cause the world to "speed up."


## Crystal Api

Crystal uses the mediator pattern to power its Api.  
To learn more about mediator, check out: https://github.com/ajacksified/Mediator.js

### Example Calls

- CrystalApi.Publish("addEntity", entity);
- CrystalApi.Subscribe("update", function (data) { renderStuff(); });

### Api Docs

Crystal's Documentation is found in the repo's documentation dir :)


