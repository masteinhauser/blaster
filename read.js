var fs = require('fs')
var Stream = require('stream')

// filter 1
var filter1 = new Stream
filter1.writable = true
filter1.readable = true
var lineRegExp = new RegExp('\n')
lineRegExp.compile();
var buffer = null;
filter1.write = function (chunk) {
   console.log("filter1:", arguments)
   if(lineRegExp.test(chunk)){
      console.log('splitting: ', chunk)
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

   console.log("Emitting data: ", arguments)
	// pass data to next pipe
	chunk.forEach( function(piece){
		this.emit('data', piece)
	}, this)
}
filter1.end = function (chunk) {
   console.log('ending', arguments)
}
filter1.on('error', function () {
   console.log('filter1', arguments)
})

// filter 2
var filter2 = new Stream
filter2.writable = true
filter2.readable = true
filter2.write = function (chunk) {
	chunk.toString().replace('this', 'that')
   console.log('filtering this->that: ', chunk)
   this.emit('data', chunk) // pass data to next pipe
}
filter2.end = function (chunk) {
   console.log('ending', arguments)
}
filter2.on('error', function () {
   console.log('filter2', arguments)
})

// filter 2
var filter3 = new Stream
filter3.writable = true
filter3.readable = true
filter3.write = function (chunk) {
	chunk.toString().replace('line', 'chunk')
   console.log('filtering line->chunk: ', chunk)
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
   console.log('writing', arguments)
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
   console.log('writing2', arguments)
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
	bufferSize: 8 // 1 byte
};

var fsstream = fs.createReadStream('./readit.txt', read_flags)
var arr = [fsstream, filter1, stream1, filter2, filter3, stream2]
arr.reduce(function (prev, next) {
   if (!prev) return next
   return prev.pipe(next)
})
