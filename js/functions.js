export async function importLinks() {
	const links = [...document.querySelectorAll('link[rel="import"][name]')];
	return Promise.all(links.map(link => {
		return new Promise(resolve => {
			if (link.import === null) {
				link.addEventListener('load', () => resolve({
					name: link.name,
					content: link.import,
					source: new URL(link.href),
				}));
			} else {
				resolve({
					name: link.name,
					content: link.import,
					source: new URL(link.href),
				});
			}
		});
	}));
}

export async function importLink(name) {
	const link = document.querySelector(`link[rel="import"][name="${name}"]`);
	if (link instanceof HTMLLinkElement) {
		return new Promise(resolve => {
			if (link.import === null) {
				link.addEventListener('load', () => resolve({
					name: link.name,
					content: link.import,
					source: new URL(link.href),
				}));
			} else {
				resolve({
					name: link.name,
					content: link.import,
					source: new URL(link.href),
				});
			}
		});
	} else {
		throw new Error(`Unable to finnd import link name "${name}"`);
	}
}
