#!/usr/bin/env node

var util = require('util');
var couchdb = require('cradle');
var logsDB = new couchdb.Db(config.db.name);

var couchdb_save_func = function(logs) {
	if (debug)
		util.puts("Processing "+logs.length+" logs");

	logsDB.get('/_uuids?count='+logs.length, function(err, result) {
		if (err) return util.error(err.stack);
		var uuids = result.uuids;

		for (var i = 0, l = logs.length; i < l; i++) {
			var uuid = uuids[i];
			var log = logs[i];

			logsDB.put(uuid, log, function(err, result) {
				if (err) return util.error(err.stack);
				if (debug)
					util.log('Created doc at '+uuid+' with --> '+util.inspect(result));
			});
		}
	});
};

parser.process_logs(config.file, parser.railsLogParser, couchdb_save_func);
