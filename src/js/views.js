let Views = () => {

	let views = {

		getExperienceCard: (model) => {
			let html = `
				<div class="media">
					<div class="media-left">
						<figure class="image is-64x64">
							<img src="./public/img/doggoaward.png" alt="Placeholder image">
						</figure>
					</div>
					<div class="media-content">
						<h3 class="title is-3">${model.title}</h3>
						<p class="subtitle is-5">${model.range}</p>
						<p>${model.description}</p>
					</div>
				</div>
			`;
			let div = document.createElement('div');
				div.innerHTML = html;
				div.classList.add('profile-experience');
			return div;
		},

		getSkillRow: (model) => {
			let classColor = (model.frequency < 0.45) ? 'is-success' : 'is-warning';
			let html = `
				<td>
					<div class="tags has-addons">
						<span class="tag is-medium">${model.skill}</i></span>
						<span class="tag is-medium ${classColor}">${model.endorsements}</i></span>
					</div>
				</td>
				<td>
					<p class="has-text-right"><span class="is-bold">${Math.round(model.frequency * 100)}%</span> of members are skilled in this.</p>
				</td>
			`;
			let tr = document.createElement('tr');
				tr.innerHTML = html;
			return tr;
		},

		getConnectionCard: (model) => {
			let topSkill = Object.keys(model.skills).map((key) => model.skills[key]).sort((a, b) => {
				return b.confidence - a.confidence;
			}).sort((a, b) => {
				return b.endorsements - a.endorsements;
			}).sort((a, b) => {
				return a.frequency - b.frequency;
			})[0];
			let html = `
				<div class="media">
					<div class="media-left">
						<figure class="image is-64x64">
							<div class="is-filled-image" style="background-image: url('${model.image}');"></div>
						</figure>
					</div>
					<div class="media-content">
						<h4 class="title is-4">${model.name}</h4>
						<p class="subtitle is-6 is-followed">Highly Skilled at ${topSkill.skill}</p>
					</div>
				</div>
			`;
			let div = document.createElement('div');
				div.innerHTML = html;
				div.classList.add('column');
				div.classList.add('is-6');
			return div;
		}

	}

	return views;

}

export {Views};