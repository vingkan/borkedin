let Views = () => {

	let views = {

		getExperienceCard: (model) => {
			let html = `
				<div class="media">
					<div class="media-left">
						<figure class="image is-64x64">
							<img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
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
		}

	}

	return views;

}

export {Views};