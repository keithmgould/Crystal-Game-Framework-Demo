var app = require('http').createServer(handler),
    static = require('node-static')

app.listen(3000);

// Handle static files
var file = new(static.Server)('./public');
function handler (req, res) {
  req.addListener('end',function(){
    file.serve(req, res);
  });
}

