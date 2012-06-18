define({
  // Socket.IO
  server: "collabfighter.local:3000",

  // Artificial Latency (in Ms)
  extraLatency: {
    server: 50,
    client: 50
  },

  // Physics
  physics: {
    scale:  4,
    height: 400,
    width:  400
  },
  keystrokes: {
    KEY_LEFT_ARROW:   37,
    KEY_UP_ARROW:     38,
    KEY_RIGHT_ARROW:  39,
    KEY_SPACE_BAR:    32
  }
});
