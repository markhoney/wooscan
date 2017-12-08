var vm;

document.addEventListener('DOMContentLoaded', function() {
	Vue.component('highlight', {
		props: ['msg', 'search', 'effect'],
		template: '<span><span v-for="(s, i) in parsedMsg" v-bind:class="getClass(i%2)">{{s}}</span></span>',
		methods: {
			getClass: function(i) {
				var myClass = {};
				myClass[this.effect] = !!i;
				return myClass;
			},
		},
		computed: {
			parsedSearch : function () {
					return '(' + this.search.trim().replace(/ +/g, '|') + ')';
			},
			parsedMsg: function() {
					return this.msg.split(
					new RegExp(this.parsedSearch , 'gi'));
			}
		}
	});
	Vue.use(VueTimeago, {locale: 'en-US', locales: {'en-US': ["just now", ["%s second ago", "%s seconds ago"], ["%s minute ago", "%s minutes ago"], ["%s hour ago", "%s hours ago"], ["%s day ago", "%s days ago"], ["%s week ago", "%s weeks ago"], ["%s month ago", "%s months ago"], ["%s year ago", "%s years ago"]]}}); // Load TimeAgo, which will live update how long ago a time was
	Vue.use(Buefy.default) // Load the buefy plugin
	vm = new Vue({el: '#root',
		data: {
			title: "Woo!",
			tab: 0,
			projects: {},
			searchresults: [{title: "", link: "", description: "", href: ""}],
			project: "",
			scan: "",
			search: "chiropractic colic site:nz"
		},
		computed: {
			projectsarray: function() {return Object.values(this.projects);}, // Return an array of devices, for our devices table
		}
	});

	var socket = io(); // Create a new socket.io object
	socket.on('connect', function() { // When we've successfully connected
		console.log("socket.io connected"); // Log our connection
		console.log("Sent:", "syn");
		socket.emit('handshake', 'syn');
	});
	socket.on('disconnect', function() { // When we've been disconnected
		console.log("socket.io disconnected"); // Log our disconnection
	});
	socket.on('handshake', function(data) { // Respond to handshake requests (for testing)
		console.log("Received:", data); // Log it
		if (data == "syn") {
			socket.emit('handshake', 'syn-ack');
			console.log("Sent:", 'syn-ack'); // Log it
		} else if (data == "syn-ack") {
			socket.emit('handshake', 'ack');
			console.log("Sent:", 'ack'); // Log it
			socket.emit('search', vm.search);
		}
	});
	socket.on('search', function(data) { // Respond to handshake requests (for testing)
		vm.searchresults = data;
	});
});
