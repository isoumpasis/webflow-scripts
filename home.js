/* System Identification */
const urlMake = 'https://lovatohellas.herokuapp.com/vehicleDB/make';
const urlModel = 'https://lovatohellas.herokuapp.com/vehicleDB/model';

let selectedModels;
let selectedVehicles;

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const cylinderOrEngineSelect = document.querySelector(
	'#cylinderOrEngineSelect'
);
// const suggestedDivs = document.querySelectorAll('.suggested-system-div');
// const suggestedContainers = document.querySelectorAll('.suggested-container');
// let suggestedSystems;

document.addEventListener('DOMContentLoaded', () => {
	initSelects();

	if (typeof Storage !== 'undefined' && sessionStorage.selectedModels) {
		selectedModels = JSON.parse(sessionStorage.selectedModels);
		console.log('Parsed json local storage', selectedModels);
		selectMakeOption();
		populateModelSelect();
		if (sessionStorage.selectedModel) {
			selectModelOption(); //from storage
			populateYearSelect();
			if (sessionStorage.selectedYear) {
				selectYearOption(); //from storage
				populateCylinderOrEngineSelect();
				if (sessionStorage.selectedCylinder) {
					selectCylinderOption(); //from storage
					//showResults();
				}
			}
		}
	}
	// suggestedDivs.forEach(suggestedDiv => {
	//   suggestedDiv.querySelector('.suggested-btn').addEventListener('click', e => {
	//     const selectedSystem = suggestedDiv.querySelector('.suggested-name').textContent;
	//     sessionStorage.selectedSystem = selectedSystem;
	//   });
	// });
});

function initSelects() {
	modelSelect.disabled = true;
	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
	yearSelect.disabled = true;
	yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
	cylinderOrEngineSelect.disabled = true;
	cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
	makeSelect.focus();
}

makeSelect.addEventListener('change', function () {
	console.log('make changed', this.value);

	yearSelect.disabled = true;
	cylinderOrEngineSelect.disabled = true;
	yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
	cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
	//suggestedContainer.style.display = 'none';
	if (!this.value) {
		modelSelect.disabled = true;
		modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
		sessionStorage.clear(); //reset //DO YOU WANT TO ERASE EVERYTHING? maybe there is an autonomous var you want to keep
		return;
	}
	modelSelect.disabled = false;
	modelSelect.innerHTML = '';
	startLoadingSelect(modelSelect);

	let status;
	fetch(urlMake, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ make: this.value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			console.log('Success Models Fetch:', data);
			if (status !== 200) {
				endLoadingSelect(modelSelect);
				makeSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			selectedModels = data;

			sessionStorage.clear(); //reset every time make changes
			sessionStorage.selectedModels = JSON.stringify(selectedModels);

			populateModelSelect();
			endLoadingSelect(modelSelect);
		})
		.catch(error => {
			endLoadingSelect(modelSelect);
			modelSelect.innerHTML =
				'<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
});

function startLoadingSelect(select) {
	select.classList.add('loading-select');
}
function endLoadingSelect(select) {
	select.classList.remove('loading-select');
}

function populateModelSelect() {
	let modelOptionsStr = '<option value="">Επιλέξτε Μοντέλο</option>';
	selectedModels.forEach(model => {
		modelOptionsStr += `<option value="${model}">${model}</option>`;
	});
	modelSelect.innerHTML = modelOptionsStr;
	modelSelect.disabled = false;
	modelSelect.focus();
}

modelSelect.addEventListener('change', function () {
	console.log('model changed', this.value);
	cylinderOrEngineSelect.disabled = true;
	// suggestedContainer.style.display = 'none';
	sessionStorage.removeItem('selectedYear');
	sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!this.value) {
		yearSelect.disabled = true;
		yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
		cylinderOrEngineSelect.innerHTML =
			'<option value="">Περιγραφή</option>';
		sessionStorage.removeItem('selectedVehicles');
		return;
	}
	// selectedModel = selectedModels.models.filter(model => model.name === this.value)[0];
	// console.log('selectedModel', selectedModel);
	// sessionStorage.selectedModel = JSON.stringify(selectedModel);
	yearSelect.disabled = false;
	yearSelect.innerHTML = '';
	startLoadingSelect(yearSelect);
	let status;
	fetch(urlModel, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ make: makeSelect.value, model: this.value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			console.log('Success Vehicles Fetch:', data);
			if (status !== 200) {
				endLoadingSelect(yearSelect);
				makeSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			selectedVehicles = data;

			sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

			cylinderOrEngineSelect.innerHTML = `<option value="">${
				selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
			}</option>`;
			populateYearSelect();
			endLoadingSelect(yearSelect);
		})
		.catch(error => {
			endLoadingSelect(yearSelect);
			modelSelect.innerHTML =
				'<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});

	// populateYearSelect();
});

function populateYearSelect() {
	let yearOptionsArray = ['<option value="">Επιλέξτε Χρονολογία</option>'];

	let vehicleYears = [];
	selectedVehicles.vehicles.forEach(vehicle => {
		const vehicleFrom = vehicle.years[0];
		const vehicleTo = vehicle.years[1];
		for (let y = vehicleFrom; y <= vehicleTo; y++) {
			vehicleYears.push(y);
		}
	});
	vehicleYears = [...new Set(vehicleYears)].sort();
	vehicleYears.forEach(year => {
		yearOptionsArray.push(`<option value="${year}">${year}</option>`);
	});

	yearSelect.innerHTML = yearOptionsArray.join('');
	yearSelect.disabled = false;
	yearSelect.focus();
	//One option -> auto populate
	if (yearOptionsArray.length === 2) {
		yearSelect.selectedIndex = 1;
		yearOnChange(yearSelect.value);
		return;
	}
}

yearSelect.addEventListener('change', e => yearOnChange(e.target.value));

function yearOnChange(yearValue) {
	console.log('year changed', yearValue);
	// suggestedContainer.style.display = 'none';
	sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!yearValue) {
		cylinderOrEngineSelect.disabled = true;
		cylinderOrEngineSelect.innerHTML = `<option value="">${
			selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
		}</option>`;
		sessionStorage.removeItem('selectedYear');
		return;
	}
	sessionStorage.selectedYear = yearValue;
	populateCylinderOrEngineSelect();
}

function populateCylinderOrEngineSelect() {
	if (typeof Storage !== 'undefined' && !sessionStorage.selectedYear) return; //dont know if bug? why return??
	let optionsArray;

	if (selectedVehicles.isDirect) {
		optionsArray = ['<option value="">Επιλέξτε Κινητήρα</option>'];
		let engineCodes = [];
		selectedVehicles.vehicles.forEach(vehicle => {
			if (
				yearSelect.value >= vehicle.years[0] &&
				yearSelect.value <= vehicle.years[1]
			) {
				vehicle.engineCodes.forEach(code => {
					engineCodes.push(code);
				});
			}
		});
		engineCodes = [...new Set(engineCodes)].sort(
			(a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0])
		);
		engineCodes.forEach(engineCode => {
			optionsArray.push(
				`<option value="${engineCode}">${engineCode}</option>`
			);
		});
	} else {
		optionsArray = ['<option value="">Επιλέξτε Κυλίνδρους</option>'];
		let cylinders = [];
		selectedVehicles.vehicles.forEach(vehicle => {
			if (
				yearSelect.value >= vehicle.years[0] &&
				yearSelect.value <= vehicle.years[1]
			) {
				cylinders.push(vehicle.cylinders);
			}
		});
		cylinders = [...new Set(cylinders)].sort();
		cylinders.forEach(cylinder => {
			optionsArray.push(
				`<option value="${cylinder}">${cylinder}</option>`
			);
		});
	}

	cylinderOrEngineSelect.innerHTML = optionsArray.join('');
	cylinderOrEngineSelect.disabled = false;
	cylinderOrEngineSelect.focus();
	//One option -> auto populate
	if (optionsArray.length === 2) {
		cylinderOrEngineSelect.selectedIndex = 1;
		cylinderOrEngineSelect.disabled = false;
		cylinderOrEngineOnChange(cylinderOrEngineSelect.value);
		return;
	}
}

cylinderOrEngineSelect.addEventListener('change', e =>
	cylinderOrEngineOnChange(e.target.value)
);

function cylinderOrEngineOnChange(value) {
	console.log('cylinder changed', value);

	if (!value) {
		//suggestedContainer.style.display = 'none';
		sessionStorage.removeItem('selectedCylinder');
		//sessionStorage.removeItem('suggestedSystems');
		//sessionStorage.removeItem('selectedSystem');
		return;
	}
	sessionStorage.selectedCylinder = value;
	//showResults();
}

function selectMakeOption() {
	let opts = makeSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (selectedModels.make === opts[i].value) {
			makeSelect.selectedIndex = i;
			break;
		}
	}
}
function selectModelOption() {
	selectedModel = JSON.parse(sessionStorage.selectedModel);
	let opts = modelSelect.options;
	console.log('select model option opts', opts);
	for (let i = 0; i <= opts.length; i++) {
		if (selectedModel.name === opts[i].value) {
			modelSelect.selectedIndex = i;
			break;
		}
	}
}
function selectYearOption() {
	const selectedYear = sessionStorage.selectedYear;
	let opts = yearSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (selectedYear === opts[i].value) {
			yearSelect.selectedIndex = i;
			break;
		}
	}
}
function selectCylinderOption() {
	const selectedCylinder = sessionStorage.selectedCylinder;
	let opts = cylinderOrEngineSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (selectedCylinder === opts[i].value) {
			cylinderOrEngineSelect.selectedIndex = i;
			break;
		}
	}
}

function showResults() {
	let cyls = cylinderOrEngineSelect.value;
	let years = yearSelect.value;

	if (cyls == 5 || cyls == 6) {
		suggestedSystems = ['C-OBD II 6cyl'];
	} else if (cyls == 8) {
		suggestedSystems = ['C-OBD II 8cyl'];
	} else if (years < 1999) {
		suggestedSystems = ['E-GO'];
	} else if (years >= 1999 && years < 2007) {
		suggestedSystems = ['E-GO', 'Smart ExR E/P'];
	} else if (years >= 2007 && years < 2012) {
		suggestedSystems = ['Smart ExR K/P', 'C-OBD II'];
	} else {
		suggestedSystems = ['C-OBD II'];
	}

	sessionStorage.suggestedSystems = JSON.stringify(suggestedSystems);

	suggestedDivs.forEach((suggestedDiv, i) => {
		suggestedDiv.querySelector('.suggested-name').textContent =
			suggestedSystems[i];
		suggestedDiv.querySelector(
			'.suggested-price'
		).textContent = getSystemPrice(suggestedSystems[i]);
		suggestedDiv.querySelector('.suggested-btn').textContent =
			'Γνωρίστε το ' + suggestedSystems[i];
	});

	//if (suggestedSystems.length === 2) {
	//suggestedContainer.style.display = 'grid';
	//suggestedDivs[1].style.display = 'flex';
	//} else {
	//suggestedDivs[1].style.display = 'none';
	//suggestedContainer.style.display = 'flex';
	//suggestedContainer.style.justifyContent = 'center';
	//}
}

function getSystemPrice(system) {
	switch (system) {
		case 'E-GO':
			return '600€ + ΦΠΑ';
		case 'Smart ExR E/P':
			return '640€ + ΦΠΑ';
		case 'Smart ExR K/P':
			return '680€ + ΦΠΑ';
		case 'C-OBD II':
			return '720€ + ΦΠΑ';
		case 'C-OBD II 6cyl':
			return '1000€ + ΦΠΑ';
		case 'C-OBD II 8cyl':
			return '1100€ + ΦΠΑ';
		default:
			return 'default error: ' + system;
	}
}
/* System Identification END */

/* Calculator */
const lpgConsumption = 1.15; //15% more than petrol
const cngConsumption = -0.444; //44,44% less than petrol

const sliders = document.querySelectorAll('.range-slider');
const outputs = document.querySelectorAll('input[type=number]');
const lpgResult = document.querySelector('#lpg-result');
const cngResult = document.querySelector('#cng-result');
const lpgPercentageEl = document.querySelector('#lpg-percentage');
const cngPercentageEl = document.querySelector('#cng-percentage');
const petrolCost = document.querySelector('#petrolCost');
const lpgCost = document.querySelector('#lpgCost');
const cngCost = document.querySelector('#cngCost');
const perYearCheckbox = document.querySelector('#perYearCheckbox');
const costLabels = document.querySelectorAll('.cost-label');
const lpgResultLabel = document.querySelector('#lpg-result-label');
const cngResultLabel = document.querySelector('#cng-result-label');

const covers = document.querySelectorAll('.cover');

sliders.forEach((slider, i) => {
	outputs[i].value = slider.value;
	covers[i].style.width = calcCoverWidth(slider) + '%';

	slider.addEventListener('input', () => {
		outputs[i].value = slider.value;
		covers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
	});
	outputs[i].addEventListener('input', function () {
		slider.value = this.value;
		covers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
	});
});
perYearCheckbox.addEventListener('change', calcResult);

calcResult(); //init

function calcResult() {
	let res = 0;
	let petrolCostPerMonth, lpgCostPerMonth, cngCostPerMonth;

	const ltPer100Km = parseInt(document.querySelector('.lt-100km').value);
	const kmPerYear = parseInt(document.querySelector('.km-year').value);
	const petrolPrice = parseFloat(
		document.querySelector('.petrol-price').value
	);
	const lpgPrice = parseFloat(document.querySelector('.lpg-price').value);
	const cngPrice = parseFloat(document.querySelector('.cng-price').value);

	petrolCostPerMonth = (ltPer100Km * kmPerYear * petrolPrice) / (100 * 12); // €/month

	lpgCostPerMonth =
		(ltPer100Km * lpgConsumption * kmPerYear * lpgPrice) / (100 * 12);
	cngCostPerMonth =
		(ltPer100Km * (cngConsumption + 1) * kmPerYear * cngPrice) / (100 * 12);

	const lpgPercentageValue =
		(100 * (petrolCostPerMonth - lpgCostPerMonth)) / petrolCostPerMonth;
	const cngPercentageValue =
		(100 * (petrolCostPerMonth - cngCostPerMonth)) / petrolCostPerMonth;

	if (perYearCheckbox.checked) {
		costLabels.forEach(label => (label.textContent = 'Ετήσια Έξοδα:'));
		lpgResultLabel.textContent = 'Ετήσιο όφελος';
		cngResultLabel.textContent = 'Ετήσιο όφελος';

		petrolCost.textContent = (petrolCostPerMonth * 12).toFixed(1) + '€';
		lpgCost.textContent = (lpgCostPerMonth * 12).toFixed(1) + '€';
		cngCost.textContent = (cngCostPerMonth * 12).toFixed(1) + '€';

		lpgResult.textContent =
			((petrolCostPerMonth - lpgCostPerMonth) * 12).toFixed(2) + '€';
		lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

		cngResult.textContent =
			((petrolCostPerMonth - cngCostPerMonth) * 12).toFixed(2) + '€';
		cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';
	} else {
		costLabels.forEach(label => (label.textContent = 'Μηνιαία Έξοδα:'));
		lpgResultLabel.textContent = 'Μηνιαίο όφελος';
		cngResultLabel.textContent = 'Μηνιαίο όφελος';

		petrolCost.textContent = petrolCostPerMonth.toFixed(1) + '€';
		lpgCost.textContent = lpgCostPerMonth.toFixed(1) + '€';
		cngCost.textContent = cngCostPerMonth.toFixed(1) + '€';

		lpgResult.textContent =
			(petrolCostPerMonth - lpgCostPerMonth).toFixed(2) + '€';
		lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

		cngResult.textContent =
			(petrolCostPerMonth - cngCostPerMonth).toFixed(2) + '€';
		cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';
	}
}

function calcCoverWidth(slider) {
	let offset =
		(slider.max - slider.value) / (slider.max - slider.min) > 0.2 ? 0 : 1.5;
	return (
		((slider.max - slider.value) / (slider.max - slider.min)) * 100 + offset
	);
}
/* Calculator END */
