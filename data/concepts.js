const fs = require('fs');
const Twitter = require('twitter');
const Clarifai = require('clarifai');

const CONCEPTS_FILE = './data/concept-map.json';

const twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

const clarifai = new Clarifai.App({
	apiKey: process.env.CLARIFAI_KEY
});

function wait(ms) {
	let waitTill = new Date(new Date().getTime() + ms);
	while(waitTill > new Date()){}
}

function predictImageContents(imageUrl) {
	return new Promise((resolve, reject) => {
		clarifai.models.predict(Clarifai.GENERAL_MODEL, imageUrl).then(resolve, reject);
	});
}

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

let params = {
	screen_name: 'dog_rates',
	count: 100,
	include_entities: true
};

const MAX_ID = process.env.TWITTER_MAX_ID || false;
if (MAX_ID) {
	params.max_id = MAX_ID;
}

let conceptMap = {};
let conceptStr = fs.readFileSync(CONCEPTS_FILE).toString();
if (conceptStr) {
	conceptMap = JSON.parse(conceptStr);
}

getManyMediaTweets(params, 15).then((all) => {

	console.log(`Found ${all.length} media tweets.`);

	let tweets = [];
	for (let i = 0; i < all.length; i++) {
		let t = all[i];
		let include = (i < 10);
		if (include) {
			tweets.push(t);
		} else {
			console.log(`Last Tweet ID: ${t.id}`);
			break;
		}
	}

	let tweetMap = {};
	let promises = [];
	for (let t = 0; t < tweets.length; t++) {
		let tweet = tweets[t];
		let imageUrl = tweet.entities.media[0].media_url_https;
		let p = predictImageContents(imageUrl);
			p.tweetid = tweet.id_str;
			tweetMap[tweet.id_str] = tweet;
		promises.push(p);
	}

	Promise.all(promises).then((results) => {

		let dogImages = results.map((res, idx) => {
			let hasDog = false;
			let tweetid = promises[idx].tweetid;
			let conceptList = res.outputs[0].data.concepts;
			for (let i = 0; i < conceptList.length; i++) {
				let concept = conceptList[i];
				if (concept.name === 'dog') {
					hasDog = true;
					break;
				}
			}
			return {
				hasDog: hasDog,
				tweet: tweetMap[tweetid],
				concepts: conceptList
			};
		});

		console.log(`Analyzed media: ${dogImages.length}/${tweets.length} have pictures of dogs.`)

		dogImages.forEach((entry) => {
			let tweet = entry.tweet;
			let concepts = entry.concepts.map((c) => `${c.name} (${c.value})`);
			let imageUrl = tweet.entities.media[0].media_url_https;
			//console.log(imageUrl);
			//console.log(tweet.text);
			//console.log(concepts.join(', '));
			entry.concepts.forEach((c) => {
				if (!(c.name in conceptMap)) {
					conceptMap[c.name] = {
						name: c.name,
						count: 0,
						values: [],
						tweets: []
					};
				}
				conceptMap[c.name].count++;
				conceptMap[c.name].values.push(c.value);
				conceptMap[c.name].tweets.push(tweet.id);
			});
			//console.log('\n')
		});

		fs.writeFileSync(CONCEPTS_FILE, JSON.stringify(conceptMap));
		console.log(`Finished writing concept map to: ${CONCEPTS_FILE}`);

		/*Object.keys(conceptMap).map((key) => conceptMap[key]).map((data) => {
			let sum = data.values.reduce((agg, val) => {
				return agg + val;
			}, 0);
			data.expected = (sum / data.values.length);
			return data;
		}).sort((a, b) => {
			return b.expected - a.expected;
		}).sort((a, b) => {
			return b.count - a.count;
		}).forEach((data) => {
			console.log(`${data.name}: ${data.count} (${data.expected})`);
		});*/

	}).catch(console.error);

}).catch(console.error);




