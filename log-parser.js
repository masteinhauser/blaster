#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var config = require('./config');
var debug = false;

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
 * Parser Dispatcher
 */
// Takes file path, log process function and save log function
exports.process_logs = function(file) {
        var read_flags = {
		encoding: file.encoding || 'utf8',
		bufferSize: 64 * 1024 // 64KiB
	};
	var read_stream = fs.createReadStream(file.path, read_flags);

	read_stream.on("data", function(data){
		file.processor(msg, function(){
			config.db.driver(data)
			save_func(logs);
		});
	});
	
	read_stream.on("error", function(err){
		util.error("Error occured while trying to read from %s. Error: %s", file.path, err);
	});

	read_stream.on("close", function(){
		util.log("File Closed for reading: %s", file.path);
	});
};

/*
 * Parsers
 */

