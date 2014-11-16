var init = require('./classifier').init;

init(function(classify) {
	console.log(classify(process.argv.slice(2).join(' ')));
});
