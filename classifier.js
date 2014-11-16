var dclassify = require('dclassify');
var csvReader = require('./csv-reader');

var Classifier = dclassify.Classifier;
var DataSet    = dclassify.DataSet;
var Document   = dclassify.Document;

var documentForTweet = function(tweet) {
	return new Document(tweet.text, tweet.text.replace(/[^\w ]/g, '').replace(/\s\s/, ' ').split(' '));
}

module.exports.init = function(callback) {
	csvReader('./data/danger.csv', function(dangerData) {
		csvReader('./data/not-danger.csv', function(notDangerData) {
			var data = new DataSet();

			dangerData.forEach(function(tweet) {
				data.add('danger', documentForTweet(tweet));
			});

			notDangerData.forEach(function(tweet) {
				data.add('notDanger', documentForTweet(tweet));
			});

			var classifier = new Classifier();
			classifier.train(data);

			var classify = function(str) {
				var doc = documentForTweet({text: str});
				return classifier.classify(doc);
			}

			callback(classify);

		});
	});
};
