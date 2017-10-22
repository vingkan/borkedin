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
						address: park.mapped_location_address,
						latitude: park.mapped_location.coordinates[1],
						longitude: park.mapped_location.coordinates[0],
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
				'$where': 'dog_friendly >= 1'
			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.location;
				}).map((park) => {
					let entry = {
						name: park.park_name,
						address: park.location_address,
						latitude: park.location.coordinates[1],
						longitude: park.location.coordinates[0],
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
						address: `${park.stnumber || ''} ${park.stdirection || ''} ${park.stname || ''} ${park.stsuffix || ''}`,
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
						address: park.location,
						latitude: coords[1],
						longitude: coords[0],
						cityid: 'newyork',
						data: park
					}
					return entry;
				});
				resolve(cleaned);
			}).catch(reject);
		});
	},

	seattle: () => {
		return new Promise((resolve, reject) => {
			$.get('https://data.seattle.gov/resource/fa7z-wkeh.json', {

			}).then((data) => {
				let cleaned = data.filter((park) => {
					return park.location_1;
				}).map((park) => {
					let entry = {
						name: park.common_name,
						address: JSON.parse(park.location_1).address,
						latitude: parseFloat(park.location_1.latitude),
						longitude: parseFloat(park.location_1.longitude),
						cityid: 'seattle',
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
				console.log(data);
				let cleaned = data.filter((park) => {
					return park.the_geom;
				}).map((park) => {
					let coords = park.the_geom.coordinates[0][0][0];
					let entry = {
						name: park.description,
						address: park.off_leash_area_id,
						latitude: coords[1],
						longitude: coords[0],
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

		CITIES: Object.keys(cityParksGetter),

		getParks: (cityid) => {
			return new Promise((resolve, reject) => {
				let getter = cityParksGetter[cityid];
				if (getter) {
					getter().then(resolve).catch(reject);
				} else {
					reject('We do not currently have data for this city. Message your city council!');
				}
			});
		},

		renderMap: (list, element, onMarkerClick) => {

			var first = list[0];

			var map = new google.maps.Map(element, {
				center: {lat: first.latitude, lng: first.longitude},
				zoom: 10,
				styles: [	{		"featureType":"landscape",		"stylers":[			{				"hue":"#FFA800"			},			{				"saturation":0			},			{				"lightness":0			},			{				"gamma":1			}		]	},	{		"featureType":"road.highway",		"stylers":[			{				"hue":"#53FF00"			},			{				"saturation":-73			},			{				"lightness":40			},			{				"gamma":1			}		]	},	{		"featureType":"road.arterial",		"stylers":[			{				"hue":"#FBFF00"			},			{				"saturation":0			},			{				"lightness":0			},			{				"gamma":1			}		]	},	{		"featureType":"road.local",		"stylers":[			{				"hue":"#00FFFD"			},			{				"saturation":0			},			{				"lightness":30			},			{				"gamma":1			}		]	},	{		"featureType":"water",		"stylers":[			{				"hue":"#00BFFF"			},			{				"saturation":6			},			{				"lightness":8			},			{				"gamma":1			}		]	},	{		"featureType":"poi",		"stylers":[			{				"hue":"#679714"			},			{				"saturation":33.4			},			{				"lightness":-25.4			},			{				"gamma":1			}		]	}]
			});

			let lastWindow = false;

			for (var i = 0; i < list.length; i++) {

				let park = list[i];

				let html = `
					<h1>${park.name}</h1>
				`;

				let infowindow = new google.maps.InfoWindow({
					content: html
				});

				let marker = new google.maps.Marker({
					position: {lat: park.latitude, lng: park.longitude},
					map: map,
					title: park.name
				});

				marker.addListener('click', function() {
					onMarkerClick(park);
					infowindow.open(map, marker);
					if (lastWindow) {
						lastWindow.close();
					}
					lastWindow = infowindow;
				});
			}

			return map;

		}

	}

	return pmod;
}

export {ParksModule};