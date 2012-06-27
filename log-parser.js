#!/usr/bin/env node

var events = require('events');
var fs = require('fs');
var util = require('util');
global.debug = false;
global.config = require('./config');

// Load in prefilters
require('./filter/pre');
// Load in CUSTOM prefilters
require('./custom/filter/pre');
// Load in postfilters
require('./filter/post');
// Load in CUSTOM postfilters
require('./custom/filter/post');

// Load in parsers
require('./parser');
// Load in CUSTOM parsers
require('./custom/parser');

// Load in Output Writers
require('./writer');
// Load in CUSTOM Output Writers
require('./custom/writer');

/*
 * Validate config and files exist
 */ 
validate_config = function(next){
	util.log("Config validated");
	next();
};

/*
 * Parser Dispatcher
 */
// Takes file path, log process function and save log function
process_logs = function(file) {
   var read_flags = {
		encoding: file.encoding || 'utf8',
		bufferSize: 64 * 1024 // 64KiB
	};
	var read_stream = fs.createReadStream(file.path, read_flags);

	read_stream.pipe(file.parse).pipe(db.write)

	// Read Data  : Read data from file
	// Pre-Filter : Get bad data into common format
	// Parse      : Parse common data into semi-strucuted JSON
	// Post-Filter: Mess with common semi-structured JSON
	// Writer     : Send to Database/Message Queue
	read_stream.on('data', prefilter.parse);
   prefilter.on('parse', parser.parse);
	parser.on('postfilter', postfilter.parse);
   prefilter.on('write', writer.write);

	read_stream.on("error", function(err){
		util.error("Error occured while trying to read from %s. Error: %s", file.path, err);
	});

   read_stream.on("end", function(){
		util.log("File finished reading: %s", file.path);
	});

	read_stream.on("close", function(){
		util.log("File closed for reading: %s", file.path);
	});
};


validate_config(function(){
   for(var i in config.files){
      console.log(config.files[i].path);
      process_logs(config.files[i]);
   }
});
