var Twitter = require('twitter');

var twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY, 
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET 
});

twitter.search(process.argv.slice(2).join(' '), {lang: 'en', count: 40}, function(data) {
	data.statuses.forEach(function(status) {
		console.log(status.user.screen_name + "\t" + status.text.replace(/[\n\t]/g, ' '));
	});
});
