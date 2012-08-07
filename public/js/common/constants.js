/*
  This file is required by Crystal and must be in the common directory.
*/
define({

  // Required: Server URL
  server: "collabfighter.local:3000",

  // Required: Physics Simulation size and scale
  physics: {
    scale:  10,
    height: 700,
    width:  1000
  },


  // You can also place constants needed for your game in this file!
  // Keystrokes
  keystrokes: {
    KEY_LEFT_ARROW:   37,
    KEY_UP_ARROW:     38,
    KEY_RIGHT_ARROW:  39,
    KEY_SPACE_BAR:    32
  }
});
