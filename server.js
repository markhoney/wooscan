const db = new (require('tingodb')()).Db('db', {});

const _ = require('lodash');
const webshot = require('webshot');
const axios = require('axios');
const google = require('google')
google.resultsPerPage = 100
const sanitisehtml = require('sanitize-html');
const sanitisefilename = require("sanitize-filename");

const send   = require('koa-send');
const app    = new (require('koa'))();
const router = new (require('koa-router'))();
const io     = new (require('koa-socket'))();

function screenshotPage(url) {
	const filename = sanitisefilename(url) + '.png';
	webshot(url, 'screenshots/' + filename, function(err) {
		return false;
	});
	return filename;
}

function scrapePage(url) {
	axios.get(url).then(function (response) {
		 return sanitisehtml(response.data, {allowedTags: []});
	})
	.catch(function (err) {
		console.error(err);
		return false;
	});
}

function getGoogleResults(search) {
	google(search, function(err, res) {
		if (err) {
			console.error(err);
			return false;
		} else {
			res.links.forEach(function(link) {
				link._id = link.href;
				delete link.href;
				delete link.link;
				link.created = new Date();
				link.modified = link.created;
				//console.log(link);
			});
			console.log("Inserting!");
			//console.log(db);
			db.collection("pages").insert(res.links, function(err, result) {
				console.log(err);
			});
			return res.links;
		}
	});
}

app.use(async (ctx) => {
  await send(ctx, ctx.path, {root: __dirname + '/client', index: 'index.html'});
});

app.use(router.routes()).use(router.allowedMethods());
io.attach(app);

const port = 3000;
app.listen(port);

console.log("Listening on port:", port);

/*io.on('search', function(client) { // Initial handshake to check Websocket is working
	client.socket.emit('search', getGoogleResults(client.data));
});*/

/*io.on('handshake', function(client) { // Initial handshake to check Websocket is working
	console.log("Received:", client.data); // Log it
	if (client.data == "syn") {
		client.socket.emit('handshake', 'syn-ack');
		console.log("Sent:", 'syn-ack'); // Log it
	} else if (client.data == "syn-ack") {
		client.socket.emit('handshake', 'ack');
		console.log("Sent:", 'ack'); // Log it
	}
});*/

io.on('search', function(client) {
	getGoogleResults(client.data);
	google(client.data, function (err, res) {
		if (err) {
			console.error(err);
			return false;
		} else {
			client.socket.emit('search', res.links);
		}
	});
});

io.on('page', function(client) {
	axios.get(client.data).then(function (response) {
		client.socket.emit('page', sanitisehtml(response.data, {allowedTags: []}));
	})
	.catch(function (err) {
		console.error(err);
		return false;
	});
});
