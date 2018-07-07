//setting up required packages
const express = require("express");
const Twit = require('twit');
const bodyParser = require("body-parser");
const moment = require('moment');
const app = express();
const router = express.Router();
const config = require("../config.js")
const T = new Twit(config);

const user = {};
const friends = [];
const messages = [];
const tweets = [];

app.use(bodyParser.urlencoded({ extended: false}));
app.set("view engine", "pug");
app.use(express.static('public'));

// Get user information based on credentials
T.get('account/verify_credentials', (err, data, res, next) => {
	if(err) {
		console.log(err)
	}

	// Add user information to the user object
	user.name = data.name;
	user.screenName = data.screen_name;
  user.id = data.id;
	user.picture = data.profile_image_url;
  user.background = data.profile_banner_url;
	user.friendCount = data.friends_count;
});

// Get your last 5 tweets
T.get('statuses/user_timeline', { count: 5 },  function (err, data, response) {
	if(err) {
		console.log(err)
	}

	// Adding tweets to the tweets array
  data.forEach(function(tweet) {
    const tweetObject = {};
    tweetObject.text = tweet.text;
    tweetObject.date = moment(tweet.created_at).fromNow();
    tweetObject.retweets = tweet.retweet_count;
    tweetObject.likes = tweet.favorite_count;
    tweets.push(tweetObject);
  });
})

// Get your 5 most recent friends
T.get('friends/list', { count: 5 },  function (err, data, response) {
	if(err) {
		console.log(err)
	}

	// Adding friends to the friends array
	for (let i = 0; i < data.users.length; i++){
		let friendObject = {
			"name" : data.users[i].name,
			"screenName" : data.users[i].screen_name,
			"picture" : data.users[i].profile_image_url_https,
			"user_id" : data.users[i].id
		}
    friends.push(friendObject);
  }
})

// Get the 5 most recent messages
T.get("direct_messages/events/list", { count: 5 }, (err, data, res) => {
	if(err) {
		console.log(err)
	}

	// Adding DMs to the messages array
  data.events.forEach(message => {
    const messageObject = {};
    messageObject.text = message.message_create.message_data.text;
    messageObject.date = moment(parseInt(message.created_timestamp)).fromNow();
    messageObject.id = message.message_create.sender_id;

    // Get name and picture based on sender_id
    T.get(`https://api.twitter.com/1.1/users/show.json?user_id=${messageObject.id}`, function (err, data, response) {
      messageObject.name = data.name;
      messageObject.picture = data.profile_image_url_https;
    });
    messages.push(messageObject);
  });
})

// Rendering index.pug
router.get('/', (req, res) => {
	res.render('index', { user, friends, messages, tweets });
});

// 404 error page
router.get('*', function(req, res){
  res.render('error');
});
moment.suppressDeprecationWarnings = true;
module.exports = router;
