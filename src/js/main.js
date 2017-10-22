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

let CURRENT_PROFILE_ID = false;

function initProfile(profileid, editMode) {
	CURRENT_PROFILE_ID = profileid;
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
let fullVal = {};

function initLanding() {
	showPage('landing');
	let ref = db.ref(`profile`);
	ref.once('value', (snap) => {
		let val = snap.val() || {};
		landingHolder.innerHTML = '';
		for (let did in val) {
			let doggo = val[did];
			let v = views.getLandingCard(doggo);
			landingHolder.appendChild(v);
		}
		fullVal = val;
	});
}

function initSearch(search) {
	showPage('landing');
	landingHolder.innerHTML = '';
	let val = fullVal;
	for (let did in val) {
		let doggo = val[did];
		let keep = false;
		if (doggo.name.indexOf(search) > -1) {
			keep = true;
		}
		let sk = doggo.skills || {};
		let skills = Object.keys(sk).map(k => sk[k]).forEach((s) => {
			if (s.skill.indexOf(search) > -1) {
				keep = true;
			}
		});
		if (keep) {
			let v = views.getLandingCard(doggo);
			landingHolder.appendChild(v);
		}
	}
}

let sb = document.getElementById('search-bar');
sb.addEventListener('keyup', (e) => {
	if (e.keyCode === 13) {
		initSearch(sb.value);
	}
});

document.getElementById('secret-rename').addEventListener('click', (e) => {
	let name = prompt("Enter a New Name");
	db.ref(`profile/${CURRENT_PROFILE_ID}/name`).set(name);
});

/*db.ref(`profile`).once('value', (snap) => {
	let val = snap.val() || {};
	let pids = Object.keys(val);
	let idx = 0;
	let nextID = pids[idx];
	document.location = `/#/profile/${nextID}`;
	let next = document.getElementById('next');
	next.addEventListener('click', (e) => {
		if (nextID) {
			let name = doggoName.innerText;
			db.ref(`profile/${nextID}/name`).set(name).then((done) => {
				idx++;
				nextID = pids[idx];
				if (!nextID) {
					alert('all done!!');
				} else {
					document.location = `/#/profile/${nextID}`;
				}
			}).catch(console.error);
		}
	});
});*/

window.sendPats = () => {
	/*Array.from(document.getElementsByClassName('pat')).forEach((p) => {
		p.style.display = 'block';
	});*/
	let ph = document.getElementById('pats-holder');
	ph.innerHTML = `
		<ul class="pats">
			<div class="pat"></div>
			<div class="pat"></div>
			<div class="pat"></div>
			<div class="pat"></div>
			<div class="pat"></div>
		</ul>
	`;
	setTimeout(function() {
		Array.from(document.getElementsByClassName('pat')).forEach((p) => {
			p.style.display = 'none';
		});
	}, 7000);
}

const PRETTY_NAMES = {
	'bruno': '889880896479866881',
	'snuggles': '900429189278511105'
}

window.main = () => {

	initLanding();

	let routes = {

		'/': () => {
			initLanding();
		},

		'/profile': () => {
			initLanding();
		},

		'/profile/:profileid': (profileid) => {
			console.log(profileid);
			if (profileid in PRETTY_NAMES) {
				profileid = PRETTY_NAMES[profileid];
			}
			initProfile(profileid, false);
		},

		'/profile/:profileid/edit': (profileid) => {
			console.log(profileid);
			if (profileid in PRETTY_NAMES) {
				profileid = PRETTY_NAMES[profileid];
			}
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