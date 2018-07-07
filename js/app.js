//Setting up required packages 
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mainRoutes = require('./index.js');
const Twit = require('twit');
const config = require("../config.js")
const T = new Twit(config);

// Socket.io plugin
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(bodyParser.urlencoded({ extended: false}));
app.set("view engine", "pug");
app.use(express.static('public'));
app.use(mainRoutes);

// Recieving the message
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    postTweet(msg);
  });
});

// POST request to the twitter API
function postTweet(msg){
	T.post('statuses/update', { status: `${msg}` }, function(err, data, response) {
    if(err) {
  		console.log(err)
  	}
  });
}

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('Page is loaded on localhost:3000');
});
