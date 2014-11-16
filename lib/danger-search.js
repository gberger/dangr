var geoSearch = require('./geo-search');

module.exports = function(campus, classify, callback) {
	geoSearch(campus.attributes.center.latitude, campus.attributes.center.longitude, campus.attributes.radius, function(tweets) {
		var classifications = tweets.statuses.map(function(status) {
			return classify(status.text);
		});
		var value = classifications.map(function(classification) {
			return classification.category === "danger" ? 1 : 0;
		}).reduce(function(a, b) {
			return a+b;
		}, 0.0) / classifications.length;
		callback(value);
	});
};
