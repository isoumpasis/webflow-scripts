//System Identification
const url = 'https://lovatohellas.herokuapp.com/vehicleDB';
let vehicleData;
let selectedModel;

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const cylinderSelect = document.querySelector('#cylinderSelect');
const suggestedDivs = document.querySelectorAll('.suggested-system-div');
const suggestedContainer = document.querySelector('.suggested-container');

document.addEventListener('DOMContentLoaded', () => {
	modelSelect.disabled = true;
	yearSelect.disabled = true;
	cylinderSelect.disabled = true;
	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
	yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
	cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
	makeSelect.focus();
});

makeSelect.addEventListener('change', function () {
	console.log('make changed', this.value);

	yearSelect.disabled = true;
	cylinderSelect.disabled = true;
	yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
	cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
	suggestedContainer.style.display = 'none';
	if (!this.value) {
		modelSelect.disabled = true;
		modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
		return;
	}
	modelSelect.disabled = false;
	modelSelect.innerHTML = '';
	startLoadingModelSelect();

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ make: this.value })
	})
		.then(response => response.json()) //FOR JSON (WORKING)
		//.then(response => response.text()) //FOR TEXT (WORKING)
		.then(data => {
			console.log('Success Fetch Response Data:', data);
			if (data.msg === 'no vehicles') return;
			vehicleData = data;

			populateModelSelect();
			endLoadingModelSelect();
			modelSelect.disabled = false;
			modelSelect.focus();
		})
		.catch(error => {
			endLoadingModelSelect();
			modelSelect.innerHTML =
				'<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
});

function populateModelSelect() {
	let modelOptionsStr = '<option value="">Επιλέξτε Μοντέλο</option>';
	vehicleData.models.forEach(model => {
		modelOptionsStr += `<option value="${model.name}">${model.name}</option>`;
	});
	modelSelect.innerHTML = modelOptionsStr;
}

modelSelect.addEventListener('change', function () {
	console.log('model changed', this.value);
	cylinderSelect.disabled = true;
	cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
	suggestedContainer.style.display = 'none';

	if (!this.value) {
		yearSelect.disabled = true;
		yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
		return;
	}
	selectedModel = vehicleData.models.filter(
		model => model.name === this.value
	)[0];
	console.log('selectedModel', selectedModel);

	populateYearSelect();
	yearSelect.disabled = false;
	yearSelect.focus();
});

function populateYearSelect() {
	let yearOptionsStr = '<option value="">Επιλέξτε Χρονολογία</option>';

	const [fromYear, toYear] = selectedModel.years;
	for (let year = fromYear; year <= toYear; year++) {
		yearOptionsStr += `<option value="${year}">${year}</option>`;
	}
	yearSelect.innerHTML = yearOptionsStr;
}

yearSelect.addEventListener('change', function () {
	console.log('year changed', this.value);
	suggestedContainer.style.display = 'none';

	if (!this.value) {
		cylinderSelect.disabled = true;
		cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
		return;
	}
	populateCylinderSelect();
	cylinderSelect.disabled = false;
	cylinderSelect.focus();
});

function populateCylinderSelect() {
	let cylinderOptionsStr = '<option value="">Επιλέξτε Κυλίνδρους</option>';
	selectedModel.cylinders.forEach(cylinder => {
		cylinderOptionsStr += `<option value="${cylinder}">${cylinder}</option>`;
	});
	cylinderSelect.innerHTML = cylinderOptionsStr;
}

cylinderSelect.addEventListener('change', function () {
	console.log('cylinder changed', this.value);
	if (!this.value) {
		suggestedContainer.style.display = 'none';
		return;
	}
	showResults();
});

function showResults() {
	let systemStr;
	let cyls = cylinderSelect.value;
	let years = yearSelect.value;

	if (cyls === 5 || cyls === 6) {
		systemStr = ['C-OBD II 6cyl'];
	} else if (cyls === 8) {
		systemStr = ['C-OBD II 8cyl'];
	} else if (years < 1999) {
		systemStr = ['E-GO'];
	} else if (years >= 1999 && years < 2007) {
		systemStr = ['E-GO', 'Smart ExR E/P'];
	} else if (years >= 2007 && years < 2012) {
		systemStr = ['Smart ExR K/P', 'C-OBD II'];
	} else {
		systemStr = ['C-OBD II'];
	}

	suggestedDivs.forEach((suggestedDiv, i) => {
		suggestedDiv.querySelector('.suggested-name').textContent =
			systemStr[i];
		suggestedDiv.querySelector('.suggested-price').textContent =
			getSystemPrice[systemStr[i]];
		suggestedDiv.querySelector('.suggested-btn').textContent =
			'Γνωρίστε το ' + systemStr[i];
	});

	if (systemStr.length === 2) {
		suggestedContainer.style.display = 'grid';
		suggestedDivs[1].style.display = 'flex';
	} else {
		suggestedDivs[1].style.display = 'none';
		suggestedContainer.style.display = 'flex';
		suggestedContainer.style.justifyContent = 'center';
	}
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
	}
}

function startLoadingModelSelect() {
	modelSelect.classList.add('loading-model-select');
}
function endLoadingModelSelect() {
	modelSelect.classList.remove('loading-model-select');
}

// Calculator
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
