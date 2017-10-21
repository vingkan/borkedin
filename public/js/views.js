let Views = () => {

	let views = {

		getFullProfile: (model) => {
			let html = `

			`;
			let div = document.createElement('div');
				div.innerHTML = html;
			return div;
		}

	}

	return views;

}

export {Views};