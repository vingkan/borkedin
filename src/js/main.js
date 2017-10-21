let pm = require('./parks');
let parksModule = pm.ParksModule();
let config = require('./config');
let FirebaseApp = firebase.initializeApp(config);
let db = FirebaseApp.database();

const PARAMS = getQueryParams(document.location.search);
const GAME = PARAMS.game;

function getQueryParams(qs) {
	qs = qs.split('+').join(' ');
	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

function showPage(id) {
	Array.from(document.getElementsByClassName('page-hidden')).forEach((page) => {
		page.style.display = 'none';
	});
	document.getElementById(`page-${id}`).style.display = 'block';
}

let routes = {
	'/profile/:profileid': (profileid) => {
		console.log(profileid);
		showPage('profile');
	},
	'/parks/:cityid': (cityid) => {
		console.log(cityid);
		showPage('parks');
		parksModule.getParks(cityid).then((data) => {
			console.log(data);
		}).catch(console.error);
	}
}

let router = Router(routes);
router.init();