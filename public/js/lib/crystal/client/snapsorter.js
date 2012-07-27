/*
  The SnapSorter takes a look at the most recent server snapshot and sees if it knows about
  the client's last update.  If so, it sets updates to use FastForward Snapshots. Otherwise
  it sets updates to use Prediction.
*/
define(['crystal/common/api', 'crystal/common/physics', 'underscore'], function (CrystalApi, Physics, _) {
  // var avgLag = 0,
  var selfEntity,
      updateMethod;

  var initialize = function () {
    // // Store avgLag
    // CrystalApi.Subscribe('crystalDebug', function (data) {
    //   if(data.type === "lagInfo"){
    //     avgLag = data.avgLag;
    //   }
    // });

    // Compare current Server Snapshot to Lagged Client Snapshot
    CrystalApi.Subscribe('messageFromServer:crystal', function (data) {
      if(data.type != "snapshot") {return;}
      if(storeSelfEntity === false){return;}
      if(data.lastLag > 0){
        processSnapshot(data);
        updateMethod = "snapshots"
      }else{
        updateMethod = "prediction"
      }
      CrystalApi.Publish('updateMethodChange', {use: updateMethod});
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

  var processSnapshot = function (data) {


      // var lastClientSnapshot = selfEntity.getSnapshot();
      // if(_.isUndefined(lastClientSnapshot)){
      //   console.log("no snapshot yet");
      //   return;
      // }

      // Extract the selfEntity from the snapshot
      var serverEntitySnapshot = _.find(data.message.entities, function (entity) {
        return entity.id === selfEntity.get('id');
      });
      if(_.isUndefined(serverEntitySnapshot)){ return false; }
      
      var futureSnapshot = Physics.seeFuture(serverEntitySnapshot, data.lastLag);
      CrystalApi.Publish('serverSelfEntityFutureSnapshot', futureSnapshot);
      // CrystalApi.Publish('finalSnapshot', futureSnapshot);
      CrystalApi.Publish('serverSelfEntitySnapshot', serverEntitySnapshot);

      // var resetSelfEntity = compareSnapshots(lastClientSnapshot, futureSnapshot);
      // if(resetSelfEntity){
      //   CrystalApi.Publish('correctedSnapshot', futureSnapshot);
      // }
  }



  var compareSnapshots = function (client, server) {
    var results = {};
    
    results.x = compareAttribute(client.x, server.x);
    results.y = compareAttribute(client.y, server.y);
    results.a = compareAttribute(client.a, server.a);
    CrystalApi.Publish("crystalDebug", {type: 'selfEntityError', error: results});
    if(results.x > 1 || results.y > 1 || results.a > 1){
      return true;
    }else{ 
      return false;
    }
  }

  var compareAttribute = function (client, server) {
    return Math.abs(client - server);
  }

  return {
    initialize: initialize
  };
});