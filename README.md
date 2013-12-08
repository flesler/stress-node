stress-node
===========

## Description

Stress test library for Node JS

## Installation

Using npm:

	$ npm install stress-node

## Usage example

```js
var stress = require('stress-node');
stress({
	url: 'http://google.com',
	method: 'GET',
	amount: 1000,
	concurrent: 5,
	data: null,
	progress: function(report) {
	}
}, function(report) {
});
```

## The report object

Both functions will receive a report object that looks like this:

```js
{ 
	url: 'http://google.com',
	ok: 990,
	fail: 5,
	completed: 995,
	ongoing: 4,
	pending: 1,
	total: 1000,
	start: [object Date],
	end: [object Date],
	responses: [
		{ status:200, amount: 990 }
	],
	errors: [ 
		{ code: 'ECONNREFUSED', amount: 4 },
		{ code: 404, amount: 1 }
	]
}
```

# Stress server

I also made a CLI server that runs a stress test using this library.

Go check it out at https://github.com/flesler/stress-node-server.

# TODOs

- `timeout` setting doesn't seem to be working correctly