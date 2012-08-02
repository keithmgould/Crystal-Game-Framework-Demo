/*
  The Fastforwarder takes a look at the most recent server snapshot and fastforwards it.

  The amount the snapshot is fastforwarded depends on how long it took for a client to send a PilotControl,
  and receive a snapshot acknowledging the pilotControl.  In other words, it's pretty much the lag time.

  Theory: When it comes to the selfEntity (the client's entity), the server is ALWAYS behind, since Crystal
  utilizes client side prediction.  Therefore, when we start rendering based off of the snapshots form the 
  server, they will be "behind."  So we fastforward them.

  More Theory: Crystal uses a "predict/fastforward" algorithm to ensure a smooth lag free experience in the face of entities
  that continue to move due to some momentum (like spaceships....in space.)  This reality is a bit harder to 
  handle than objects which move a predictable amount and stop when the client taps "move left."
*/
define(['crystal/common/api', 'crystal/common/physics', 'underscore'], function (CrystalApi, Physics, _) {
  var selfEntity,
      updateMethod;

  var initialize = function () {

    // Compare current Server Snapshot to Lagged Client Snapshot
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
      if(storeSelfEntity() === false){return;}
      if(_.isUndefined(data.lag) || _.isUndefined(data.current)){
        throw new Error("data.lag or data.current was not defined");
      }
      fastforwardSnapshot(data);
    });

    CrystalApi.Subscribe("updateMethodChange", function (data) {
      updateMethod = data.use;
    });
  }

  var storeSelfEntity = function () {
    if(_.isUndefined(selfEntity)){
      selfEntity = _.find(Physics.getEntities(), function (entity) {
        return entity.get('selfEntity') === true;
      });
      if(_.isUndefined(selfEntity)){
        return false;
      }
      globalSelfEntity = selfEntity;
    }
    return true;
  }

  var fastforwardSnapshot = function (data) {
    var futureSnapshot;

    // Extract the selfEntity from the snapshot
    var serverEntitySnapshot = _.find(data.message.entities, function (entity) {
      return entity.id === selfEntity.get('id');
    });
    if(_.isUndefined(serverEntitySnapshot)){ return false; }
    futureSnapshot = Physics.seeFuture(serverEntitySnapshot, data.lag);
    futureSnapshot.current = data.current;
    CrystalApi.Publish('serverSelfEntityFutureSnapshot', futureSnapshot);
    CrystalApi.Publish('serverSelfEntitySnapshot', serverEntitySnapshot);
  }

  return {
    initialize: initialize
  };
});