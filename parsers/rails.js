#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var debug = false;

/*
 * Parsers
 */
exports.rails = function(msg, index) {
	var request = {};
	// DEBUG:: Comment this out to ease debugging as it can get noisy
	request.full_log = msg;
	var lines = msg.split(/\n/), line = null;

	while ((line = lines.shift()) !== undefined) {
		if (line === '') continue;
		// Controller, Action, Format, IP, Date, Method
		if ((tmp = line.match(/^Processing (.*?)Controller#([^\s]+?)(?: to ([^\s]+?))? \(for ([0-9\.]+?) at ([^)]+?)\) \[([^\]]+)\]$/))) {
			request["date"] = exports.dateToArray(tmp[5]);
			request.processing = {
				"controller"	: tmp[1],
				"action"		: tmp[2],
				"format"		: tmp[3],
				"ip"			: tmp[4],
				"date"			: tmp[5],
				"method"		: tmp[6]
			};
		// Params Ruby hash
		} else if ((tmp = line.match(/^\s+Parameters: ([{].+[}])$/))) {
			request.params = JSON.parse(tmp[1].replace(/(['"])\s?=>\s?(['"{])/g, '$1 : $2'));
		} else if (line.match(/^Rendering/)) {
			if ( ! request.render) {
				request.render = [];
			}
			if ((tmp = line.match(/^Rendering template within (.*)/))) {
				request.render.push({"type" : "layout", "file" : tmp[1]});
			} else if ((tmp = line.match(/^Rendering ([^\s]+)$/))) {
				request.render.push({"type" : "view", "file" : tmp[1]});
			} else if ((tmp = line.match(/^Rendering ([^\s]+) \(([^\)]+)\)$/))) {
				request.render.push({"type" : "view", "file" : tmp[1], "error" : tmp[2]});
			} else {
				if (exports.isDebug()) {
					util.puts("***ERROR:: Could not parse Render line***");
					util.puts("\t"+line);
				}
			}
		} else if ((tmp = line.match(/^Redirected to ([^\s]+)$/))) {
			request.redirect = tmp[1];
		} else if ((tmp = line.match(/^Filter chain halted as \[([^\]]+)\]/))) {
			request.chain_filter = tmp[1];
		// TimeTaken, ViewTime, DBTime, HTTP Status, URL
		} else if ((tmp = line.match(/^Completed in ([^\s]+) \((?:View: ([0-9]+))?(?:, )?(?:DB: ([0-9]+))\) \| ([0-9]{3} .+?) \[([^\]]+)\]$/))) {
			request.success = {
				"elapsed_time"	: tmp[1],
				"view_time"		: tmp[2],
				"db_time"		: tmp[3],
				"http_status"	: tmp[4],
				"request_url"	: tmp[5]
			};
		} else if ((tmp = line.match(/^(?:([^:\s]+)::)?([^\s]+?Error|UnknownAction) \((.+?)\)?:$/))) {
			var error = {
				"klass"			: tmp[1],
				"error_type"	: tmp[2],
				"error_msg"		: tmp[3],
				"stack_trace"	: []
			};
			if (error.error_type == 'RoutingError' && (tmp_error = error.error_msg.match(/^No route matches "([^"]+)" with ([{].+[}])$/))) {
				error.route = tmp_error[1];
				error.params = JSON.parse(tmp_error[2].replace(/:([^\s=,]+)/g, '"$1"').replace(/(['"])\s?=>\s?(['"{])/g, '$1 : $2').replace(/"=>/g, '" :'));
			} else if (error.error_type == 'TemplateError' && (tmp_error = error.error_msg.match(/^wrong number of arguments \((([0-9]+) for ([0-9]+))\)\) on line #([0-9]+) of (.+)$/))) {
				error.arguments_msg	= tmp_error[1];
				error.arguments_one	= tmp_error[2];
				error.arguments_two	= tmp_error[3];
				error.line_number	= tmp_error[4];
				error.file			= tmp_error[5];
				error.view_trace	= [];
				while ((line = lines.shift()) !== undefined && line !== '') {
					error.view_trace.push(line.trim());
				}
			} else {
				if (exports.isDebug())
					util.puts("Count not match error("+error.error_type+"): " + error.error_msg);
			}
			while ((line = lines.shift()) !== undefined && line !== '') {
				error.stack_trace.push(line.trim());
			}
			request.error = error;
		} else {
			if (exports.isDebug())
				util.puts("Could not process line: "+line);
		}
	}
	if (request.processing) {
		if (exports.isDebug()) {
			util.puts(util.inspect(request));
			util.puts("\n");
		}
		return request;
	} else {
		if (exports.isDebug()) {
			util.puts("\nERROR:: Could not process log message:\n\n");
			util.puts(util.inspect(request.full_log));
			util.puts("\n");
		}
		return false;
	}
};

