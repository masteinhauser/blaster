var fs = require('fs')
var Stream = require('stream')
var debug = process.env.DEBUG || false

// Filter to 'cleanup' buffered data back into a single line of input
var lineFilter = new Stream
lineFilter.writable = true
lineFilter.readable = true
var lineRegExp = new RegExp('\n')
lineRegExp.compile();
var buffer = null;
lineFilter.write = function (chunk) {
   if(lineRegExp.test(chunk)){
      chunk = chunk.split('\n')

      if(buffer != null){
         chunk[0] = buffer + chunk[0]
         buffer = null;
      }
      buffer = chunk.pop()
   }else{
      buffer = chunk
      return
   }

   if(debug) console.log("lineFilter: ", arguments)
	// pass data to next pipe
	chunk.forEach( function(piece){
		this.emit('data', piece)
	}, this)
}
lineFilter.end = function (chunk) {
   console.log('ending', arguments)
}
lineFilter.on('error', function () {
   console.log('lineFilter', arguments)
})

// nullFilter
var nullFilter = new Stream
nullFilter.writable = true
nullFilter.readable = true
nullFilter.write = function (chunk) {
	if(chunk == '') return
   if(debug) console.log('nullFilter: ', chunk)
   this.emit('data', chunk) // pass data to next pipe
}
nullFilter.end = function (chunk) {
   console.log('ending', arguments)
}
nullFilter.on('error', function () {
   console.log('nullFilter', arguments)
})

// filter 2
var filter3 = new Stream
filter3.writable = true
filter3.readable = true
filter3.write = function (chunk) {
	chunk.toString().replace('line', 'chunk')
   if(debug) console.log('filtering line->chunk: ', chunk)
   this.emit('data', chunk) // pass data to next pipe
}
filter3.end = function (chunk) {
   console.log('ending', arguments)
}
filter3.on('error', function () {
   console.log('filter3', arguments)
})

// stream 1
var stream1 = new Stream
stream1.writable = true
stream1.readable = true
stream1.write = function (chunk) {
   if(debug) console.log('writing1', arguments)
   this.emit('data', chunk) // pass data to next pipe
}
stream1.end = function (chunk) {
   console.log('ending', arguments)
}
stream1.on('error', function () {
   console.log('stream1', arguments)
})

// stream 2
var stream2 = new Stream
stream2.writable = true
stream2.readable = true
stream2.write = function (chunk) {
   if(debug) console.log('writing2', arguments)
}
stream2.end = function (chunk) {
   console.log('ending2', arguments)
}
stream2.on('error', function () {
   console.log('stream2', arguments)
})

// pipage
var read_flags = {
	encoding: 'utf8',
//	bufferSize: 8 // 1 byte
   bufferSize: 64 * 1024 // 64KiB
};

//var fsstream = fs.createReadStream('./readit.txt', read_flags)
var fsstream = fs.createReadStream('/media/Storage/tmp/wwt-virt-extra-web8_access.log', read_flags)
var arr = [fsstream, lineFilter, nullFilter, filter3, stream1, stream2]
arr.reduce(function (prev, next) {
   if (!prev) return next
   return prev.pipe(next)
})
