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

	function quoteIfSpace(e) {
		if (e.indexOf(" ") >= 0) return '"' + e + '"';
		return e;
	}

/*	function addQuotes(arr) {
		return (arr ? arr.map(quoteIfSpace(e)) : []);
	}*/

	function formatSearch(text, prefix, join) {
		if (text) {
			return text.split("\n").map(function(e) {if (e.indexOf(" ") >= 0) return prefix + '"' + e.trim() + '"'; return prefix + e.trim()}).filter(String).join(join) + " ";
		}
		return "";
	}

	function addNegate(arr) {
		if (arr && typeof arr == "object" && arr != []) {
			return arr.map(function(e) {return '-' + e});
		}
		return [];
	}

	Vue.use(VueTimeago, {locale: 'en-US', locales: {'en-US': ["just now", ["%s second ago", "%s seconds ago"], ["%s minute ago", "%s minutes ago"], ["%s hour ago", "%s hours ago"], ["%s day ago", "%s days ago"], ["%s week ago", "%s weeks ago"], ["%s month ago", "%s months ago"], ["%s year ago", "%s years ago"]]}}); // Load TimeAgo, which will live update how long ago a time was
	Vue.use(Buefy.default) // Load the buefy plugin
	vm = new Vue({el: '#root',
		data: {
			title: "Woo!",
			tab: 0,
			projects: {
				Chiropractic: {description: "Chiropractic clinics based in New Zealand", searches: [ //{required: ["Chiropractor","New Zealand"], nz: false}
					{required: "Chiropractor", nz: false, shop: false}
				]},
				Acupuncture: {description: "Terms in the Medicines Act along with the word acupuncture", searches: [
					{required: "acupuncture", key: "Alcoholism\nAppendicitis\nArteriosclerosis\nArthritis\nBaldness\nBlood pressure\nBust\nCancer\nCataract\nNervous system\nDiabetes\nDiphtheria\nDropsy\nEpilepsy\nGallstones\nKidney stones\nBladder stones\nGangrene\nGlaucoma\nGoitre\nHeart disease\nInfertility\nLeukemia", excluded: "animal\nvet", nz: true, shop: false},
					{required: "acupuncture", key: "Mental disorder\nMenopause\nMenstrual\nNephritis\nPernicious\nanaemia\nPleurisy\nPneumonia\nPoliomyelitis\nProstate\nSepticaemia\nSexual impotence\nSmallpox\nTetanus\nThrombosis\nTrachoma\nTuberculosis\nTumours\nTyphoid Fever\nUlcers\nVenereal", excluded: "animal\nvet", nz: true, shop: false}
				]},
			},
			searchresults: [{title: "", link: "", description: "", href: ""}],
			project: "",
			scan: "",
			search: "chiropractic colic site:nz"
		},
		computed: {
			projectsarray: function() {return Object.values(this.projects);}, // Return an array of devices, for our devices table
		},
		methods: {
			searchString: function(search) {
				//return (addQuotes(search.required).join(" ")  + " " + addQuotes(search.key).join(" OR ") + " " + addNegate(addQuotes(search.excluded)).join(" ") + (search.nz ? " site:nz" : "")).trim().split(" ").filter(String).join(" ");
				return (formatSearch(search.required, "", " ") + formatSearch(search.key, "", "|") + formatSearch(search.excluded, "-", " ") + (search.nz ? "site:nz " : "") + (search.shop ? "cart|appointment|practitioner|booking|service|buy|price -site:mightyape.co.nz -site:fishpond.co.nz" : "")).trim();
			}
		}
	});

	function sendSearch() {
		socket.emit('search', vm.search);
	}

	var socket = io(); // Create a new socket.io object
	socket.on('connect', function() { // When we've successfully connected
		console.log("socket.io connected"); // Log our connection
		//socket.emit('handshake', 'syn');
		//console.log("Sent:", "syn");
		socket.emit('search', vm.search);
	});
	socket.on('disconnect', function() { // When we've been disconnected
		console.log("socket.io disconnected"); // Log our disconnection
	});
/*	socket.on('handshake', function(data) { // Respond to handshake requests (for testing)
		console.log("Received:", data); // Log it
		if (data == "syn") {
			socket.emit('handshake', 'syn-ack');
			console.log("Sent:", 'syn-ack'); // Log it
		} else if (data == "syn-ack") {
			socket.emit('handshake', 'ack');
			console.log("Sent:", 'ack'); // Log it
		}
	});*/
	socket.on('search', function(data) {
		vm.searchresults = data;
	});
});
