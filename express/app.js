/**** External libraries ****/
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
/**** Configuration ****/
const appName = "Foobar";
const port = (process.env.PORT || 8080);
const app = express();
app.use(bodyParser.json()); // Parse JSON from the request body
app.use(morgan('combined')); // Log all requests to the console
app.use(express.static(path.join(__dirname, '../build')));

// Additional headers for the response to avoid trigger CORS security
// errors in the browser
// Read more here: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

  // intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    // respond with 200
    console.log("Allowing OPTIONS");
    res.send(200);
  }
  else {
    // move on
    next();
  }
});

const data = [];

/**** Routes ****/
app.get('/api/data', (req, res) => res.json(data));

/**** Reroute all unknown requests to the React index.html ****/
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

/**** Start! ****/
const server = app.listen(port, () => console.log(`${appName} API running on port ${port}!`));
const io = require('socket.io').listen(server);
/**** Socket.io event handlers ****/
io.of('/my_app').on('connect', function (socket) {
  socket.on('hello', function (from, msg) {
    console.log(`I received a private message from '${from}' saying '${msg}'`);
  });
  socket.on('disconnect', () => {
    console.log("Someone disconnected...");
  });
});

app.post('/api/data', (req, res) => {
  // do some POST stuff using mongoose
  data.push(req.body.data);
  io.of('/my_app').emit('new-data', {
    msg: 'New data is available on /api/my_data'
  });
  res.json({ msg: "New data has been posted" });
  // send response using res.json()
});
