var fs = require('fs')
var Stream = require('stream')

// filter 1
var filter1 = new Stream
filter1.writable = true
filter1.readable = true
filter1.write = function (chunk) {
   chunk = chunk.split('\n')
   console.log('splitting: ', arguments)
   this.emit('data', chunk) // pass data to next pipe
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
	chunk.forEach(function(piece, idx, arr){ arr[idx] = piece.toString().replace('this', 'that')})
   console.log('filtering this->that: \n', chunk)
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
	chunk.forEach(function(piece, idx, arr){ arr[idx] = piece.toString().replace('line', 'chunk')})
   console.log('filtering line->chunk: \n', chunk)
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
	bufferSize: 8 // 1KiB
};

var fsstream = fs.createReadStream('./readit.txt', read_flags)
var arr = [fsstream, filter1, stream1, filter2, filter3, stream2]
arr.reduce(function (prev, next) {
   if (!prev) return next
   return prev.pipe(next)
})