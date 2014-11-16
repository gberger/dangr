var Twitter = require('twitter');

var twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY, 
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET 
});

module.exports = function(lat, long, radius, callback) {

	twitter.search('', {geocode: lat+','+long+','+radius+'km', lang: 'en', count: 100}, function(data) {
		callback(data);
	});

}