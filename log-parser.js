#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var debug = false;

/*
 * Parser Dispatcher
 */
// Takes file path, log process function and save log function
exports.process_logs = function(file, process_func, save_func) {
	fs.readFile(file, 'utf8', function(read_error, content) {
		var logs = [];
		if (read_error) return util.error(read_error);

		// TODO:: Remove these hardcode rails filters
		// switch filters and split functions to a nested helper in process func
		content.replace(/^Starting the New Relic Agent[^\n]+/,'').replace(/^\*\*\s+vote_fu[^\n]+/, '').split(/\n{3,}/).forEach(function(msg, index) {
			if ((tmp = process_func(msg, index)))
				logs.push(tmp);
		});
		save_func(logs);
	});
};

/*
 * Parsers
 */

