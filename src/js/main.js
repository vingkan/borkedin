let vm = require('./views');
let views = vm.Views();
let pm = require('./parks');
let parksModule = pm.ParksModule();
let config = require('./config');
let FirebaseApp = firebase.initializeApp(config);
let db = FirebaseApp.database();

const GOOGLE_MAPS_API_KEY = 'AIzaSyBIZRYftboGELfzOFmSUrcMkYwWtQN7sF8';
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


let parkName = document.getElementById('park-name');
let parkImage = document.getElementById('park-image');

function onMarkerClick(park) {
	parkName.innerText = park.name;
	//parkImage.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${park.latitude},${park.longitude}&heading=151.78&pitch=-0.76&key=${GOOGLE_MAPS_API_KEY}`;

}

let expTitle = document.getElementById('experience-title');
let expRange = document.getElementById('experience-range');
let expDesc = document.getElementById('experience-description');
let expSubmit = document.getElementById('experience-submit');

function addExperience(profileid) {
	let exp = {
		title: expTitle.value,
		range: expRange.value,
		description: expDesc.value
	}
	return db.ref(`profile/${profileid}/experience`).push(exp);
}

let expHolder = document.getElementById('experience-holder');

function renderProfile(profile) {
	expTitle.value = '';
	expRange.value = '';
	expDesc.value = '';
	expHolder.innerHTML = '';
	let expMap = profile.experience || {};
	for (let expid in expMap) {
		let exp = profile.experience[expid];
		let v = views.getExperienceCard(exp);
		expHolder.appendChild(v);
	}
}

window.main = () => {

	let routes = {

		'/profile/:profileid': (profileid) => {

			console.log(profileid);
			showPage('profile');

			db.ref(`profile/${profileid}`).on('value', (snap) => {
				let val = snap.val() || {};
				renderProfile(val);
			});

			expSubmit.addEventListener('click', (e) => {
				addExperience(profileid).then((done) => {
					// 
				}).catch(console.error);
			});

		},

		'/parks/:cityid': (cityid) => {
			console.log(cityid);
			showPage('parks');
			parksModule.getParks(cityid).then((data) => {

				let mapEl = document.getElementById('map-holder');
				let map = parksModule.renderMap(data, mapEl, onMarkerClick);

			}).catch(console.error);
		}

	}

	let router = Router(routes);
	router.init();

}