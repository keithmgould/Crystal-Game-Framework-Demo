/*
  The Fastforwarder takes a look at the most recent server snapshot and fastforward it.
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
        console.log("no selfEntity yet");
        return false;
      }
    }
    return true;
  }

  var fastforwardSnapshot = function (data) {

    // Extract the selfEntity from the snapshot
    var serverEntitySnapshot = _.find(data.message.entities, function (entity) {
      return entity.id === selfEntity.get('id');
    });
    if(_.isUndefined(serverEntitySnapshot)){ return false; }
    
    var futureSnapshot = Physics.seeFuture(serverEntitySnapshot, data.lag);
    futureSnapshot.current = data.current;
    CrystalApi.Publish('serverSelfEntityFutureSnapshot', futureSnapshot);
    CrystalApi.Publish('serverSelfEntitySnapshot', serverEntitySnapshot);
  }

  return {
    initialize: initialize
  };
});