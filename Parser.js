var events = require('events');
var util = require('util');

// Require the Parser as a module
module.exports = Parser;

var ParseStream = Parser.ParseStream = function(){
	if (!(this instanceof ParseStream)) return new ParseStream();

	Stream.call(this);

	this.writable = true;
	this.readable = true;
	this.paused = false;
}

Parser.prototype.write = function(chunk, encoding){
	return this.emit('data', chunk);
}

Parser.prototype.end = function(){
	return this.emit('end');
}

util.inherits(Parser, stream.Stream);

parse = new Parser();

parse.pipe(process.stdout);
process.stdin.pipe(parse);
process.stdin.resume();

//Parser.emit('error', new Error());
//Parser.emit('postfilter', { json: json});

