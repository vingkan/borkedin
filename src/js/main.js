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

const PARK_SPECIALS = {
	'Centennial Park': {
		vr: 'cen',
		meetup: 'https://www.facebook.com/329221374096563/photos/a.329225124096188.1073741827.329221374096563/559837747701590'
	},
	'William A. Pitts Park': {
		vr: 'wap'
	},
	'Edwin Warner Park': {
		meetup: 'https://www.meetup.com/Nashville-BarkHappy-Dog-Meetup/'
	}
}

let parkName = document.getElementById('park-name');
let parkAddress = document.getElementById('park-address');
let parkImage = document.getElementById('park-image');
let parkMeetup = document.getElementById('park-meetup');
let parkVR = document.getElementById('park-vr');

function onMarkerClick(park) {
	parkName.innerText = park.name;
	parkAddress.innerText = park.address;
	parkImage.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${park.latitude},${park.longitude}&heading=151.78&pitch=-0.76&key=${GOOGLE_MAPS_API_KEY}`;
	parkMeetup.style.display = 'none';
	parkVR.style.display = 'none';
	if (park.name in PARK_SPECIALS) {
		let spec = PARK_SPECIALS[park.name];
		if (spec.vr) {
			parkVR.href = `./${spec.vr}.html`;
			parkVR.style.display = 'inline-block';
		}
		if (spec.meetup) {
			parkMeetup.href = spec.meetup;
			parkMeetup.style.display = 'inline-block';
		}
	}
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

function initProfile(profileid, editMode) {
	showPage('profile');
	db.ref(`profile/${profileid}`).on('value', (snap) => {
		let val = snap.val() || {};
		renderProfile(val);
	});
	Array.from(document.getElementsByClassName('for-editor')).forEach((el) => {
		if (editMode) {
			el.classList.remove('is-hidden');
		} else {
			el.classList.add('is-hidden');
		}
	});
	if (editMode) {
		expSubmit.addEventListener('click', (e) => {
			addExperience(profileid).then((done) => {
				// 
			}).catch(console.error);
		});
	}
}

let doggoName = document.getElementById('profile-doggo-name');
let doggoImage = document.getElementById('profile-doggo-image');
let expHolder = document.getElementById('experience-holder');
let skillHolder = document.getElementById('skill-holder');
let connectionHolder = document.getElementById('connection-holder');

function renderProfile(profile) {
	console.log(profile);
	doggoName.innerText = profile.name;
	doggoImage.style.backgroundImage = `url('${profile.image}')`;
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
	skillHolder.innerHTML = '';
	let skillMap = profile.skills || {};
	let skills = Object.keys(skillMap).map((key) => skillMap[key]).sort((a, b) => {
		return b.endorsements - a.endorsements;
	});
	skills.forEach((skill) => {
		let v = views.getSkillRow(skill);
		skillHolder.appendChild(v);
	});
	connectionHolder.innerHTML = '';
	let skillid = skills[0].id;
	let query = db.ref(`profile`).orderByChild(`skills/${skillid}/endorsements`).limitToLast(6);
	query.once('value', (snap) => {
		let val = snap.val() || {};
		for (let did in val) {
			let connec = val[did];
			let v = views.getConnectionCard(connec);
			connectionHolder.appendChild(v);
		}
	});
}

function initCityParks(cityid) {
	if (parksModule.CITIES.indexOf(cityid) > -1) {
		showPage('parks');
		parksModule.getParks(cityid).then((data) => {
			let mapEl = document.getElementById('map-holder');
			let map = parksModule.renderMap(data, mapEl, onMarkerClick);
			onMarkerClick(data[0]);
		}).catch(console.error);
	} else {
		document.location = './#/404';
	}
}

let landingHolder = document.getElementById('landing-holder');

function initLanding() {
	showPage('landing');
	let ref = db.ref(`profile`)
	ref.once('value', (snap) => {
		let val = snap.val() || {};
		landingHolder.innerHTML = '';
		for (let did in val) {
			let doggo = val[did];
			let v = views.getLandingCard(doggo);
			landingHolder.appendChild(v);
		}
	});
}

window.main = () => {

	initLanding();

	let routes = {

		'/': () => {
			initLanding();
		},

		'/profile/:profileid': (profileid) => {
			console.log(profileid);
			initProfile(profileid, false);
		},

		'/profile/:profileid/edit': (profileid) => {
			console.log(profileid);
			initProfile(profileid, true);
		},

		'/parks': () => {
			initCityParks('nashville');
		},

		'/parks/:cityid': (cityid) => {
			console.log(cityid);
			initCityParks(cityid);
		},

		'/vr/:parkid': (parkid) => {
			console.log(parkid);
			document.location = `./${parkid}.html`;
		},

		'/404': () => {
			showPage('404');
		}

	}

	let router = Router(routes);
	router.init();

}