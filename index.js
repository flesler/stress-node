var http = require('http'),
	url = require('url');

module.exports = function(opts, done) {
	var u = url.parse(opts.url);

	var info = {
		hostname: u.hostname,
		port: u.port,
		path: u.path,
		method: opts.method,
		agent: new http.Agent(),
		// TODO
		headers: null
	};
	// WARNING: if you get EMFILE errors, you're reaching the limit
	// https://github.com/joyent/node/issues/793
	info.agent.maxSockets = opts.concurrent;

	var responses = {}, errors = {};
	var report = {
		url: opts.url,
		ok: 0,
		fail: 0,
		completed: 0,
		ongoing: 0,
		pending: opts.amount,
		total: opts.amount,
		start: new Date()
	};


	while (opts.concurrent--) {
		request();
	}

	function request() {
		if (report.pending <= 0) return;
		report.pending--;
		report.ongoing++;
		
		var req = http.request(info, function(res) {
			var status = res.statusCode;
			if (status >= 400) {
				error(status);
			} else {
				success(status);
			}
		});

		// FIXME: Doesn't seem to be working
		req.setTimeout(opts.timeout);
		req.on('error', function(e) {
			error(e.code);
		});

		req.end(opts.data);
	}

	function success(status) {
		if (responses[status]) {
			responses[status].amount++;
		} else {
			responses[status] = { status:status, amount:1 }
		}

		report.ok++;
		completed();
	}

	function error(code) {
		if (errors[code]) {
			errors[code].amount++;
		} else {
			errors[code] = {code:code, amount:1};
		}

		report.fail++;
		completed();
	}

	function completed() {
		report.ongoing--;
		report.completed++;
		request();
		
		if (opts.progress) {
			opts.progress(report);
		}

		if (report.completed < report.total) return;

		report.end = new Date();
		report.responses = values(responses);
		report.errors = values(errors);
		done(report);
	}
};

function values(obj) {
	var arr = [];
	for (var key in obj) {
		arr.push(obj[key]);
	}
	return arr;
}