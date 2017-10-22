const fs = require('fs');

const CONCEPTS_FILE = './data/concept-map.json';
const SKILLS_FILE = './data/skills-list.data';

let conceptMap = {};
let conceptStr = fs.readFileSync(CONCEPTS_FILE).toString();
if (conceptStr) {
	conceptMap = JSON.parse(conceptStr);
}

let rawText = '';

Object.keys(conceptMap).map((key) => conceptMap[key]).map((data) => {
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
	//console.log(`${data.name}: ${data.count} (${data.expected})`);
	rawText += `${data.name},${data.count},${data.expected}\n`;
});

fs.writeFileSync(SKILLS_FILE, rawText);
console.log(`Finished writing skills list to: ${SKILLS_FILE}`);



