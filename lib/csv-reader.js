var Converter = require("csvtojson").core.Converter;
var fs = require("fs");

module.exports = function(filename, cb) {
	var fileStream = fs.createReadStream(filename);
	var csvConverter = new Converter({constructResult:true});
	csvConverter.on("end_parsed", cb);
	fileStream.pipe(csvConverter);
};
