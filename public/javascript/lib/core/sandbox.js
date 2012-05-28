define(["lib/core/physics", "lib/app/entityLoader"], function (Physics, Entities) {
  console.log("loading sandbox module");
  return function (core, moduleID) {
    return {
      physics : Physics,
      entities : Entities,
      dom : $("#" + moduleID),
      emit : function (msg) {
        core.emit(msg);
      },
      on : function (msgs) {
        core.on(msgs, moduleID);
      }
    }
   }
});
