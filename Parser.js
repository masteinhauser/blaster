var events = require('events');
var util = require('util');

// Require the Parser as a module
module.exports = Parser;

var Parser = function(){
   this.writable = true;
   this.readable = true;
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

