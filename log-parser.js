#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
global.debug = false;
global.config = require('./config');

// Load in filters
require('./filter'); 
// Load in CUSTOM filters
require('./custom/filter'); 

// Load in parsers
require('./parser');
// Load in CUSTOM parsers
require('./custom/parser');

// Load in Database Drivers
require('./driver');
// Load in CUSTOM Database Drivers
require('./custom/driver');

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

	// Read Data : Read data form file
	// Pre-Filter: Get bad data into common format
	// Parse     : Parse common data into semi-strucuted JSON
	// Post-Filter: Mess with common semi-structured JSON
	// Save to Database
	read_stream.on('data', file.parse)
	parser.on('parsed', util.log('parsed!'))
	writer.on('parsed', db.write)

	read_stream.on("data", 
		file.parser(data, 
			config.db.driver(json)
		});
	});
	
	read_stream.on("error", function(err){
		util.error("Error occured while trying to read from %s. Error: %s", file.path, err);
	});

	read_stream.on("close", function(){
		util.log("File Closed for reading: %s", file.path);
	});
};

var events = require('events')
var Parser = function () {
}
util.inherits(Parser,events.EventEmitter)

Parser.emit('error', new Error())
Parser.emit('parsed', { })

validate_config(function(){
   for(var i in config.files){
      console.log(config.files[i].path);
      process_logs(config.files[i]);
   }
});
