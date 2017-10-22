const fs = require('fs');
const moment = require('moment');
const Twitter = require('twitter');
const firebase = require('firebase');
let config = require('../src/js/config');
let FirebaseApp = firebase.initializeApp(config);
let db = FirebaseApp.database();

const SKILLS = require('../src/js/skills');
const CONCEPTS_FILE = './data/concept-map.json';

const twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

function getMediaTweets(params) {
	return new Promise((resolve, reject) => {
		twitter.get('statuses/user_timeline', params, (error, list, response) => {
			if (!error) {
				resolve(list);
			} else {
				reject(error);
			}
		});
	});
}

function getManyMediaTweets(params, max, cl) {
	let all = cl || [];
	return new Promise((resolve, reject) => {
		if (all.length < max) {
			getMediaTweets(params).then((list) => {
				let tweets = list.filter((t) => {
					return t.entities.media;
				});
				tweets.forEach((t) => {
					all.push(t);
				});
				console.log(`Fetched tweets: ${tweets.length}/${list.length} have media.`)
				params.max_id = list[list.length - 1].id;
				getManyMediaTweets(params, max, all).then(resolve).catch(reject);
			}).catch(reject);
		} else {
			resolve(all);
		}
	});
}

let conceptMap = {};
let conceptStr = fs.readFileSync(CONCEPTS_FILE).toString();
if (conceptStr) {
	conceptMap = JSON.parse(conceptStr);
}

let tweetMap = {};
for (let cid in conceptMap) {
	let entry = conceptMap[cid];
	entry.tweets.forEach((tweetid) => {
		if (!(tweetid in tweetMap)) {
			tweetMap[tweetid] = {
				skills: []
			}
		}
		tweetMap[tweetid].skills.push(cid);
	});
}

let params = {
	screen_name: 'dog_rates',
	count: 100,
	include_entities: true
};

getManyMediaTweets(params, 200).then((all) => {

	console.log(`Found ${all.length} media tweets.`);

	let dogs = all.filter((tweet) => {
		return (tweet.id in tweetMap);
	}).map((tweet) => {
		let imageUrl = tweet.entities.media[0].media_url_https;
		let text = tweet.text;
		let retweeets = tweet.retweet_count;
		let skillsMap = {};
		tweetMap[tweet.id].skills.filter((cid) => {
			return SKILLS[cid];
		}).map((cid) => {
			let s = SKILLS[cid];
			s.endorsements = Math.round(retweeets * s.confidence);
			return s;
		}).forEach((s) => {
			skillsMap[s.id] = s;
		});
		let date = new Date(tweet.created_at);
		let dog = {
			id: tweet.id_str,
			name: 'Premium BorkedIn Member',
			image: imageUrl,
			experience: {
				rate: {
					title: 'Featured on We Rate Dogs',
					range: moment(date).format('MMMM YYYY'),
					description: tweet.text
				}
			},
			skills: skillsMap
		};
		return dog;
	});

	let promises = [];
	dogs.forEach((dog) => {
		let p = db.ref(`profile/${dog.id}`).set(dog);
		promises.push(p);
	});

	Promise.all(promises).then((done) => {
		console.log(`Saved all ${promises.length} doggos successfully!`);
	}).catch(console.error);

}).catch(console.error);




