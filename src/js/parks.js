let cityParksGetter = {

	nashville: () => {
		return new Promise((resolve, reject) => {
			$.get('https://data.nashville.gov/resource/xbru-cfzi.json', {
				'dog_park': 'Yes'
			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.mapped_location;
				}).map((park) => {
					let entry = {
						name: park.park_name,
						latitude: park.mapped_location.coordinates[0],
						longitude: park.mapped_location.coordinates[1],
						cityid: 'nashville',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	},

	chicago: () => {
		return new Promise((resolve, reject) => {
			$.get("https://data.cityofchicago.org/resource/4xwe-2j3y.json", {
				'$where': 'dog_friendly >= 0'
			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.location;
				}).map((park) => {
					let entry = {
						name: park.park_name,
						latitude: park.location.coordinates[0],
						longitude: park.location.coordinates[1],
						cityid: 'chicago',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	},

	losangeles: () => {
		return new Promise((resolve, reject) => {
			$.get('https://data.lacity.org/resource/xyvg-dst2.json', {
				'locationtype': 'Dog Parks'
			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.geolat && park.geolong;
				}).map((park) => {
					let entry = {
						name: park.location_name,
						latitude: parseFloat(park.geolat),
						longitude: parseFloat(park.geolong),
						cityid: 'losangeles',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	},

	newyork: () => {
		return new Promise((resolve, reject) => {
			$.get('https://data.cityofnewyork.us/resource/p7jc-c8ak.json', {
				'typecatego': 'Community Park'
			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.the_geom;
				}).map((park) => {
					let coords = park.the_geom.coordinates[0][0][0];
					let entry = {
						name: park.signname,
						latitude: coords[0],
						longitude: coords[1],
						cityid: 'newyork',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	},

	calgary: () => {
		return new Promise((resolve, reject) => {
			$.get('https://data.calgary.ca/resource/enr4-crti.json', {

			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.the_geom;
				}).map((park) => {
					let coords = park.the_geom.coordinates[0][0][0];
					let entry = {
						name: park.description,
						latitude: coords[0],
						longitude: coords[1],
						cityid: 'calgary',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	}

}

let ParksModule = () => {

	let pmod = {

		getParks: (cityid) => {
			return new Promise((resolve, reject) => {
				let getter = cityParksGetter[cityid];
				if (getter) {
					getter().then(resolve).catch(reject);
				} else {
					reject('We do not currently have data for this city. Message your city council!');
				}
			});
		}

	}

	return pmod;
}

export {ParksModule};