var sendgrid  = require('sendgrid')(process.env.SENDGRID_API_USER, process.env.SENDGRID_API_KEY);

var Twilio = require('twilio');
var twilio = new Twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = function(Parse, campus) {
	var Campus = Parse.Object.extend('Campus');
	var Subscriber = Parse.Object.extend('Subscriber');
	var query = new Parse.Query(Subscriber);
	query.equalTo("campus", campus);
	query.find({
		success: function(subscribers) {
			subscribers.forEach(function(subscriber) {

				if(subscriber.attributes.emailAddress) {
					sendgrid.send({
						to: subscriber.attributes.emailAddress,
						from: "alert@dangr.me",
						subject: "ALERT: stay safe!",
						text: "As deemed by our tweet analysis bot, your area (" + campus.attributes.name + 
							") may be at risk. Please assess the situation and stay safe."
					});
				}

				if(subscriber.attributes.phoneNumber) {
					twilio.sms.messages.create({
						to: subscriber.attributes.phoneNumber,
						from: process.env.TWILIO_NUMBER,
						body:'ALERT: stay safe. Your area (' + campus.attributes.name + ') may be at risk.'
					}
				}

			});
		}
	});
};
