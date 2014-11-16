var _ = require('underscore');

var dangerSearch = require('./lib/danger-search');
var alertSubscribers = require('./lib/alert-subscribers');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var serveStatic = require('serve-static')
app.use(bodyParser.json());
app.use(serveStatic('public'));

var Parse = require('parse').Parse;
Parse.initialize(process.env.PARSE_APPLICATION_ID, process.env.PARSE_JAVASCRIPT_KEY);
var Campus = Parse.Object.extend('Campus');
var Subscriber = Parse.Object.extend('Subscriber');

var initClassifier = require('./lib/classifier').init;
initClassifier(function(classify) {

	var queryByCoordinates = function(req, res) {
		var point = new Parse.GeoPoint({
			latitude: parseFloat(req.query.latitude), 
			longitude: parseFloat(req.query.longitude)
		});
		var query = new Parse.Query(Campus);
		query.near("center", point);
		query.limit(10);
		query.find({success: function(objects) {
			if(objects.length == 0) {
				return res.status(404).send();
			};
			var closest = _.min(objects, function(object) {
				return object.attributes.center.kilometersTo(point);
			});
			if(closest.attributes.center.kilometersTo(point) > closest.attributes.radius) {
				return res.status(404).send();
			}
			return res.status(200).send(closest);
		}, error: function(err) {
			return res.status(400).send();
		}});	
	};

	var queryByName = function(req, res) {
		var query = new Parse.Query(Campus);
		query.equalTo("name", req.query.name);
		query.first({success: function(campus) {
			return res.status(200).send(campus);
		}, error: function(err) {
			return res.status(400).send();
		}});
	};

	app.get('/campus', function(req, res) {
		if(req.query.latitude && req.query.longitude) {
			queryByCoordinates(req, res);
		} else if(req.query.name) {
			queryByName(req, res);
		} else {
			res.status(400).send();
		}
	});

	app.post('/classify', function(req, res) {
		res.status(200).send(classify(req.body.text));
	});

	app.post('/subscribe', function(req, res) {
		var query = new Parse.Query(Campus);
		query.equalTo("name", req.body.campusName);
		query.first({success: function(campus) {
			var subscriber = new Subscriber();
			subscriber.set('phoneNumber', req.body.phoneNumber);
			subscriber.set('emailAddress', req.body.emailAddress);
			subscriber.set('campus', campus);
			subscriber.save(null, {
				success: function(subscriber) {
					return res.status(200).send(subscriber);
				}, error: function(subscriber, err) {
					return res.status(400).send(err);
				}
			});

		}, error: function(err) {
			return res.status(400).send();
		}});
	})

	app.listen(process.env.PORT || 3000);


	setTimeout(function() {
		console.log('-----');
		var query = new Parse.Query(Campus);
		query.limit(100);
		query.find({success: function(results) {
			results.forEach(function(campus) {
				dangerSearch(campus, classify, function(dangerLevel){
					console.log("The danger level for " + campus.attributes.name + " is " + dangerLevel);

					if(dangerLevel > 0.20) {
						alertSubscribers(Parse, campus);
					}
				});
			});
		}, error: function(err) {
			console.log(err);
		}});
	}, 120000);

});

