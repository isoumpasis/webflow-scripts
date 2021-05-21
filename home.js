/* System Identification */
const urlYears = 'https://lovatohellas.herokuapp.com/vehicleDB/get/years';
const urlModels = 'https://lovatohellas.herokuapp.com/vehicleDB/get/models';
const urlDescriptions = 'https://lovatohellas.herokuapp.com/vehicleDB/get/descriptions';
const urlFuelPrices = 'https://lovatohellas.herokuapp.com/fuelPrices';
const downloadPdfUrl = 'https://lovatohellas.herokuapp.com/pdf';

let fetchedYears;
let fetchedModels;
let fetchedModelObj;
let foundVehicleObj;
let suggestedPricesChanges = [];
let userSelections = { vehicle: {}, systems: {} };

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const descriptionSelect = document.querySelector('#descriptionSelect');

const suggestedContainers = document.querySelectorAll('.suggested-container');
let containerId;
let suggestedSystems;

const systemQueryDict = {
	'DI 3000B': 'di3000b',
	'DI 60': 'di60',
	'DI 108': 'di108',
	'DI 108 8cyl': 'di108-8cyl'
};
const emulatorPriceDict = {
	p: 85,
	b6: 95,
	b8: -250, // - from cobd 8cyl = 1000€
	hp: 90
};
//90eurw sthn timh gia ta panw apo 180 hp
const makeImgPrefix = 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f';
const makeImgDict = {
	'ALFA ROMEO': '1d502c7ef4d03ff154b_Alfa_Romeo.png',
	AUDI: '607b580721ba1274496_Audi.png',
	BMW: '607325eb960af680a4e_BMW.png',
	CHEVROLET: '60729203574193c205c_Chevrolet.png',
	CHRYSLER: '6077735848685f48c4d_Chrysler.png',
	CITROEN: '607703f5581b7a6b6e9_Citroen.png',
	DACIA: '607ac4c2566782969fa_Dacia.png',
	DAEWOO: '6096e3ae999700f15ad_Daewoo.png',
	DAIHATSU: '6095e0f21739e801c4d_Daihatsu.png',
	DODGE: '60929203581043c205d_Dodge.png',
	FIAT: '609aecccf25fc3868f0_Fiat.png',
	FORD: '609ed355314a4ea8ba7_Ford.png',
	HONDA: '6094bacedfa12748b66_Honda.png',
	HUMMER: '609325eb912c5680a51_Hummer.png',
	HYUNDAI: '60969316192201b5e9a_Hyundai.png',
	JAGUAR: '609703f555667a6b6eb_Jaguar.png',
	JEEP: '6099881859ece0dc158_Jeep.png',
	KIA: '609ed35535997ea8ba8_Kia.jpg',
	LADA: '60b7735848bc7f48c50_Lada.png',
	LANCIA: '60b703f55244fa6b6ec_Lancia.png',
	'LAND ROVER': '60baecccf47553868f2_Land_Rover.png',
	LEXUS: '60b02c7ef3588ff4bed_Lexus.png',
	MAZDA: '60bac4c25e840296a07_Mazda.png',
	'MERCEDES-BENZ': '60b2cf4c1fc9aeb4a97_Mercedes-Benz.png',
	MINI: '60dec0785fc99826f63_Mini.png',
	MITSUBISHI: '60df4fa193ad096cf91_Mitsubishi.png',
	NISSAN: '60c3f6057d3245ac3fd_Nissan.png',
	OPEL: '60d8ec314543c0c7030_Opel.png',
	PEUGEOT: '60da5cf01576cad4d60_Peugeot.png',
	PORSCHE: '60dec07850afc826f64_Porsche.png',
	RENAULT: '60e7c02f416a420a7ea_Renault.png',
	ROVER: '60deb33aa3e792d0d74_Rover.png',
	SAAB: '60dde273a2a845dc8c0_Saab.png',
	SEAT: '60e66bedcb79fa5a7ff_Seat.png',
	SKODA: '60e9d13c22e7326344f_Skoda.png',
	SMART: '60dacb311235e2254ff_Smart.png',
	SUBARU: '60f51e2742da00ac18a_Subaru.png',
	SUZUKI: '60f1fb9c523b6315031_Suzuki.png',
	TOYOTA: '60f163ba8861a8a41ee_Toyota.png',
	VOLVO: '60f6931617b461b5e9e_Volvo.png',
	VW: '60f66bedc404ea5a800_VW.png'
};

let suggestedSystemPrices = [];
let suggestedSystemNames = [];
const VAT = 1.24;

//EASY PAY
const prokatavoliNoCreditSlider = document.querySelector('.prokatavoli-no-credit-slider');
const doseisNoCreditSlider = document.querySelector('.doseis-no-credit-slider');
const prokatavoliNoCreditCover = document.querySelector('.prokatavoli-no-credit-cover');
const doseisNoCreditCover = document.querySelector('.doseis-no-credit-cover');
const outputNoCreditProkatavoli = document.querySelector('.output-no-credit-prokatavoli');
const outputNoCreditDoseis = document.querySelector('.output-no-credit-doseis');
const prokatavoliMinus = document.querySelector('.no-credit-prokatavoli-minus');
const prokatavoliPlus = document.querySelector('.no-credit-prokatavoli-plus');
const doseisMinus = document.querySelector('.no-credit-doseis-minus');
const doseisPlus = document.querySelector('.no-credit-doseis-plus');
const enapomeinanPoso = document.querySelector('.enapomeinan-poso');
const noCreditMonthlyCost = document.querySelector('.no-credit-monthly-cost');
const noCreditMonthlyGain = document.querySelector('.no-credit-monthly-gain');
let selectedEasyPaySystemPrice;

const creditCardPrice1 = document.querySelector('#creditCardPrice1');
const creditCardPrice2 = document.querySelector('#creditCardPrice2');
const creditCardInstallments = document.querySelector('#creditCardInstallments');

document.addEventListener('DOMContentLoaded', () => {
	initSelects();
	initFuelPrices();
	initEasyPay();

	//initStorage();
});

function initSelects() {
	modelSelect.disabled = true;
	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
	yearSelect.disabled = true;
	yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
	descriptionSelect.disabled = true;
	descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
	// makeSelect.focus();
}

function initFuelPrices() {
	fetch(urlFuelPrices, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(res => res.json())
		.then(data => {
			fuelPrices = data;
			modifyFuelPriceSliders('ΑΤΤΙΚΗΣ');
		})
		.catch(e => console.error('Error on FuelPrices Fetch:', e));
}

document.querySelector('#fuelPricesSelectNoVehicle').addEventListener('change', e => {
	document.querySelector('#fuelPricesSelectVehicle').value = e.target.value;
	modifyFuelPriceSliders(e.target.value);
});
document.querySelector('#fuelPricesSelectVehicle').addEventListener('change', e => {
	document.querySelector('#fuelPricesSelectNoVehicle').value = e.target.value;
	modifyFuelPriceSliders(e.target.value);
});

function modifyFuelPriceSliders(value) {
	const locationObj = fuelPrices.filter(obj => obj.place.indexOf(value) !== -1)[0];
	if (!locationObj) return;

	sliders[2].value = locationObj.petrol;
	outputs[2].value = locationObj.petrol;
	calcCovers[2].style.width = calcCoverWidth(sliders[2]) + '%';
	sliders[3].value = locationObj.lpg;
	outputs[3].value = locationObj.lpg;
	calcCovers[3].style.width = calcCoverWidth(sliders[3]) + '%';
	calcResult();
}

function initEasyPay() {
	prokatavoliNoCreditSlider.addEventListener('input', e => prokatavoliNoCreditSliderOnChange(e.target.value));
	function prokatavoliNoCreditSliderOnChange(value) {
		console.log('value', value);
		prokatavoliNoCreditSlider.value = value;
		outputNoCreditProkatavoli.value = prokatavoliNoCreditSlider.value;
		prokatavoliNoCreditCover.style.width = calcCoverWidth(prokatavoliNoCreditSlider) + '%';
		enapomeinanPoso.textContent = (selectedEasyPaySystemPrice - parseInt(value)).toFixed(1);
	}

	doseisNoCreditSlider.addEventListener('input', e => doseisNoCreditSliderOnChange(e.target.value));
	function doseisNoCreditSliderOnChange(value) {
		console.log('value', value);
		doseisNoCreditSlider.value = value;
		outputNoCreditDoseis.value = doseisNoCreditSlider.value;
		doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
		configureNoCreditResults();
	}

	outputNoCreditProkatavoli.addEventListener('input', function () {
		if (this.value > 500) this.value = parseInt(document.querySelector('.max-prokatavoli-slider-text').textContent.replace('€', ''));
		if (this.value < 0) this.value = 0;
		if (this.value) this.value = Math.round(this.value);
		prokatavoliNoCreditSliderOnChange(this.value);
	});

	outputNoCreditDoseis.addEventListener('input', function () {
		if (this.value > 60) this.value = 60;
		if (this.value < 3 && this.value) this.value = 3;
		if (this.value) this.value = Math.round(this.value);
		doseisNoCreditSliderOnChange(this.value);
	});

	prokatavoliMinus.addEventListener('click', () =>
		prokatavoliNoCreditSliderOnChange(parseInt(prokatavoliNoCreditSlider.value) - parseInt(prokatavoliNoCreditSlider.step))
	);
	prokatavoliPlus.addEventListener('click', () =>
		prokatavoliNoCreditSliderOnChange(parseInt(prokatavoliNoCreditSlider.value) + parseInt(prokatavoliNoCreditSlider.step))
	);

	doseisMinus.addEventListener('click', () =>
		doseisNoCreditSliderOnChange(parseInt(doseisNoCreditSlider.value) - parseInt(doseisNoCreditSlider.step))
	);
	doseisPlus.addEventListener('click', () =>
		doseisNoCreditSliderOnChange(parseInt(doseisNoCreditSlider.value) + parseInt(doseisNoCreditSlider.step))
	);
	// creditCardPrice1.previousElementSibling.checked = true;
	// creditCardInstallmentsOnChange(creditCardInstallments.value);
}

function initStorage() {
	const storageObj = JSON.parse(localStorage.getItem('userSelections'));
	if (storageObj && Object.keys(storageObj.vehicle).length !== 0) {
		userSelections = storageObj;
		console.log('Parsed json local storage', userSelections);

		populateAndSelectAllOptions(userSelections.vehicle);
	}
}

function populateAndSelectAllOptions(vehicle) {
	let opts = makeSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (vehicle.make === opts[i].value) {
			makeSelect.selectedIndex = i;
			break;
		}
	}
	populateYearSelect(vehicle.fetched.fetchedYears);
	opts = yearSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (vehicle.year == opts[i].value) {
			yearSelect.selectedIndex = i;
			break;
		}
	}
	populateModelSelect(vehicle.fetched.fetchedModels);
	opts = modelSelect.options;
	for (let i = 0; i <= opts.length; i++) {
		if (vehicle.model === opts[i].value) {
			modelSelect.selectedIndex = i;
			break;
		}
	}
	populateDescriptionSelect(vehicle.fetched.fetchedModelObj);
	opts = descriptionSelect.options;
	// if(opts.length > 2){
	for (let i = 0; i <= opts.length; i++) {
		if (vehicle.description === opts[i].value) {
			descriptionSelect.selectedIndex = i;
			break;
		}
	}
	// }
	suggestedContainers.forEach(cont => (cont.style.display = 'none'));
	showResults(vehicle.fetched.fetchedModelObj);
	calcResult();
}

makeSelect.addEventListener('change', function () {
	console.log('make changed', this.value);

	modelSelect.disabled = true;
	descriptionSelect.disabled = true;
	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
	descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	resetCalc();
	calcResult();

	// userSelections.vehicle = { make: this.value };
	userSelections.vehicle = {};
	userSelections.systems = {};
	localStorage.setItem('userSelections', JSON.stringify(userSelections));

	if (!this.value) {
		yearSelect.disabled = true;
		yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
		// sessionStorage.clear(); //reset //DO YOU WANT TO ERASE EVERYTHING? maybe there is an autonomous var you want to keep
		return;
	}
	yearSelect.disabled = false;
	yearSelect.innerHTML = '';
	startLoadingSelect(yearSelect);

	let status;
	fetch(urlYears, {
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
			if (status !== 200) {
				endLoadingSelect(yearSelect);
				yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			fetchedYears = data;
			// sessionStorage.clear(); //reset every time make changes
			// sessionStorage.fetchedYears = JSON.stringify(fetchedYears);

			populateYearSelect(fetchedYears);
			endLoadingSelect(yearSelect);
		})
		.catch(error => {
			endLoadingSelect(yearSelect);
			yearSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
});

function startLoadingSelect(select) {
	select.classList.add('loading-select');
}
function endLoadingSelect(select) {
	select.classList.remove('loading-select');
}

function populateModelSelect(fetchedModels) {
	let modelOptionsArray = ['<option value="">Επιλέξτε Μοντέλο</option>'];
	fetchedModels.forEach(model => {
		modelOptionsArray.push(`<option value="${model}">${model}</option>`);
	});

	modelSelect.innerHTML = modelOptionsArray.join('');
	modelSelect.disabled = false;
	modelSelect.focus();

	if (modelOptionsArray.length === 2) {
		modelSelect.selectedIndex = 1;
		modelOnChange(modelSelect.value);
		return;
	}
}

yearSelect.addEventListener('change', e => yearOnChange(e.target.value));
function yearOnChange(value) {
	descriptionSelect.disabled = true;
	descriptionSelect.innerHTML = '<option>Περιγραφή</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	resetCalc();
	calcResult();

	// userSelections.vehicle = { make: userSelections.vehicle.make, year: value };
	userSelections.vehicle = {};
	userSelections.systems = {};
	localStorage.setItem('userSelections', JSON.stringify(userSelections));
	// sessionStorage.removeItem('selectedYear');
	// sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!value) {
		modelSelect.disabled = true;
		modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
		descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
		// delete userSelections.vehicle.year;
		// sessionStorage.removeItem('selectedVehicles');
		return;
	}
	// selectedModel = fetchedModels.models.filter(model => model.name === this.value)[0];
	// console.log('selectedModel', selectedModel);
	// sessionStorage.selectedModel = JSON.stringify(selectedModel);
	modelSelect.disabled = false;
	modelSelect.innerHTML = '';
	startLoadingSelect(modelSelect);
	let status;
	fetch(urlModels, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ make: makeSelect.value, year: value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			console.log('Success Vehicles Fetch:', data);
			if (status !== 200) {
				endLoadingSelect(modelSelect);
				yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			fetchedModels = data;

			// sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

			// descriptionSelect.innerHTML = `<option value="">${
			//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
			// }</option>`;
			populateModelSelect(fetchedModels);
			endLoadingSelect(modelSelect);
		})
		.catch(error => {
			endLoadingSelect(modelSelect);
			yearSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
}

function populateYearSelect(fetchedYears) {
	let yearOptionsArray = ['<option value="">Επιλέξτε Χρονολογία</option>'];

	fetchedYears.forEach(year => {
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

modelSelect.addEventListener('change', e => modelOnChange(e.target.value));

function modelOnChange(value) {
	console.log('model changed', value);
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	resetCalc();
	calcResult();

	// userSelections.vehicle = { make: userSelections.vehicle.make, year: userSelections.vehicle.year, model: value };
	userSelections.vehicle = {};
	userSelections.systems = {};
	localStorage.setItem('userSelections', JSON.stringify(userSelections));
	// sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!value) {
		descriptionSelect.disabled = true;
		descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
		// descriptionSelect.innerHTML = `<option value="">${
		//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
		// }</option>`;
		// delete userSelections.vehicle.model;
		// sessionStorage.removeItem('selectedYear');
		return;
	}
	// sessionStorage.selectedYear = value;

	descriptionSelect.disabled = false;
	descriptionSelect.innerHTML = '';
	startLoadingSelect(descriptionSelect);
	let status;
	fetch(urlDescriptions, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ make: makeSelect.value, year: yearSelect.value, model: value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			console.log('Success Descriptions Fetch:', data);
			if (status !== 200) {
				endLoadingSelect(modelSelect);
				descriptionSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			fetchedModelObj = data;

			// sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

			// descriptionSelect.innerHTML = `<option value="">${
			//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
			// }</option>`;
			populateDescriptionSelect(fetchedModelObj);
			endLoadingSelect(descriptionSelect);
		})
		.catch(error => {
			endLoadingSelect(descriptionSelect);
			descriptionSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
}

function populateDescriptionSelect(fetchedModelObj) {
	console.log({ fetchedModelObj });
	let optionsArray;

	if (fetchedModelObj.isDirect) {
		optionsArray = ['<option value="">Επιλέξτε Κινητήρα</option>'];
		let engineCodesOptions = [];
		fetchedModelObj.vehicles.forEach(vehicle => {
			vehicle.engineCodes.forEach(code => {
				let convertibleSymbol = vehicle.isConvertible ? ' ✔️' : ' &#10060;';
				engineCodesOptions.push(code + convertibleSymbol);
			});
		});
		engineCodesOptions = [...new Set(engineCodesOptions)].sort((a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0]));
		engineCodesOptions.forEach(engineCode => {
			let engineCodeValue = engineCode.split(' ');
			engineCodeValue.pop();
			engineCodeValue = engineCodeValue.join(' ');
			optionsArray.push(`<option value="${engineCodeValue}">${engineCode}</option>`);
		});
	} else {
		const filteredVehicles = fetchedModelObj.vehicles.slice();

		console.log({ filteredVehicles });

		if (
			filteredVehicles.length === 1 ||
			(haveSameConsumption(filteredVehicles, { tolerance: 0.5 }) &&
				haveSameEmulators(filteredVehicles) &&
				(filteredVehicles.every(veh => veh.hp <= 180) || filteredVehicles.every(veh => veh.hp > 180)))
		) {
			optionsArray = ['<option value="">Επιλέξτε Κυλίνδρους</option>'];
			let cylinders = filteredVehicles.map(veh => veh.cylinders);
			cylinders = [...new Set(cylinders)].sort();
			cylinders.forEach(cylinder => {
				optionsArray.push(`<option value="${cylinder}">${cylinder} cyl</option>`);
			});
		} else {
			optionsArray = ['<option value="">Επιλέξτε Ιπποδύναμη</option>'];
			let hpOptions = filteredVehicles.map(veh => veh.hp);
			hpOptions = [...new Set(hpOptions)].sort((a, b) => parseInt(a) - parseInt(b));
			hpOptions.forEach(opt => {
				optionsArray.push(`<option value="${opt}">${opt} HP</option>`);
			});
		}
	}

	descriptionSelect.innerHTML = optionsArray.join('');
	descriptionSelect.disabled = false;
	descriptionSelect.focus();
	//One option -> auto populate
	if (optionsArray.length === 2) {
		descriptionSelect.selectedIndex = 1;
		descriptionOnChange(descriptionSelect.value);
		return;
	}
}

function haveSameConsumption(vehicles, { tolerance }) {
	return vehicles.every(
		veh =>
			Math.abs(parseFloat(veh.consumption[0]) - parseFloat(vehicles[0].consumption[0])) <= tolerance &&
			Math.abs(parseFloat(veh.consumption[1]) - parseFloat(vehicles[0].consumption[1])) <= tolerance &&
			Math.abs(parseFloat(veh.consumption[2]) - parseFloat(vehicles[0].consumption[2])) <= tolerance
	);
}

function haveSameEmulators(vehicles) {
	const emulators = [];
	vehicles.forEach(veh => {
		if (veh.hasOwnProperty('emulators')) {
			emulators.push(veh.emulators[0]);
			console.log(veh, 'veh contains emulator');
		} else {
			emulators.push(null);
		}
	});
	console.log('emulators', { emulators });
	return [...new Set(emulators)].length === 1;
}

descriptionSelect.addEventListener('change', e => descriptionOnChange(e.target.value));

function descriptionOnChange(value) {
	console.log('description changed', value);

	suggestedContainers.forEach(cont => (cont.style.display = 'none'));

	if (!value) {
		resetCalc();
		calcResult();

		// delete userSelections.vehicle.description;
		// delete userSelections.vehicle.foundVehicle;
		userSelections.vehicle = {};
		userSelections.systems = {};
		localStorage.setItem('userSelections', JSON.stringify(userSelections));
		// sessionStorage.removeItem('selectedDescription');
		//sessionStorage.removeItem('suggestedSystems');
		//sessionStorage.removeItem('selectedSystem');
		return;
	}

	showResults(fetchedModelObj);
	calcResult();

	// userSelections.vehicle = { ...userSelections.vehicle, description: value + `${value.length === 1 ? ' cyl' : value.includes(' - ') ? '' : ' hp'}` };
	userSelections = {
		vehicle: {
			make: makeSelect.value,
			year: yearSelect.value,
			model: modelSelect.value,
			description: value + `${value.length === 1 ? ' cyl' : value.includes(' - ') ? '' : ' hp'}`,
			fetched: { fetchedYears, fetchedModels, fetchedModelObj }
		},
		foundVehicleObj,
		systems: {
			containerId
		}
	};
	console.log({ containerId });
	localStorage.setItem('userSelections', JSON.stringify(userSelections));
	// sessionStorage.selectedDescription = value;
}

function showResults(fetchedModelObj) {
	const years = yearSelect.value;
	suggestedSystemPrices = [];
	suggestedSystemNames = [];

	if (suggestedPricesChanges.length) resetToDefaultPrices();

	if (fetchedModelObj.isDirect) {
		showDirectResults(fetchedModelObj);
	} else if (fetchedModelObj.isMonou) {
		showMonouResults(fetchedModelObj);
	} else {
		console.log(fetchedModelObj);
		showCylinderResults(fetchedModelObj, years);
	}

	const suggestedContainer = getActiveContainer();
	containerId = suggestedContainer.id;

	//If there is a suggestion
	if (suggestedContainer) {
		displayEmulatorInfo(suggestedContainer);
		suggestedContainer.querySelectorAll('.suggested-overlay-block').forEach(el => (el.style.height = '0px'));

		// [...suggestedContainers].filter(c => c.style.display !== 'none')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
		// document.querySelector('.suggest').scrollIntoView({ behavior: 'smooth', block: 'end' });
		// document.querySelector('.car-result-block').scrollIntoView({ behavior: 'smooth', block: 'end' });

		// document.querySelector('.step-2').style.marginBottom = '10vh';
		configureCalculator();
		configureEasyPay();
		document.querySelector('#vehicleForm').scrollIntoView({ behavior: 'smooth' });
	} else {
		resetCalc();
	}

	// sessionStorage.suggestedSystems = JSON.stringify(suggestedSystems);
}

function resetToDefaultPrices() {
	suggestedPricesChanges.forEach(priceChange => {
		priceChange.priceEl.textContent = priceChange.defaultPrice + '€ + ΦΠΑ';
	});
	suggestedPricesChanges = [];
}

function showDirectResults(fetchedModelObj) {
	// const selectedEngineCode = descriptionSelect.value;
	// label: for (let veh of fetchedModelObj.vehicles) {
	// 	for (let engineCode of veh.engineCodes) {
	// 		if (engineCode === selectedEngineCode) {
	// 			foundVehicleObj = veh;
	// 			break label;
	// 		}
	// 	}
	// }
	// console.log({ foundVehicleObj });

	const possibleVehicleObjs = [];
	const selectedEngineCode = descriptionSelect.value;
	for (let veh of fetchedModelObj.vehicles) {
		for (let engineCode of veh.engineCodes) {
			if (engineCode === selectedEngineCode) possibleVehicleObjs.push(veh);
		}
	}

	const consumptionsRace = runConsumptionRace(possibleVehicleObjs);

	console.log({ consumptionsRace });

	foundVehicleObj = consumptionsRace[0].veh;

	console.log({ foundVehicleObj });

	if (foundVehicleObj.isConvertible) {
		const directSystemDiv = document.querySelector(`#suggested-${systemQueryDict[foundVehicleObj.system]}`);
		let temp = descriptionSelect.value.split(' - ');
		directSystemDiv.querySelector('.di-engine-code-overlay').textContent = temp[1] + ' - ' + temp[0].replace(' ', ''); //descriptionSelect.value.split(' - ')[1];
		directSystemDiv.style.display = 'grid';
	} else {
		//not convertible !!! here...TODO
		suggestedContainers.forEach(container => {
			container.style.display = 'none';
		});
	}
}

function showMonouResults(fetchedModelObj) {
	foundVehicleObj = fetchedModelObj.vehicles[0];
	const selectedHp = descriptionSelect.value;
	for (let veh of fetchedModelObj.vehicles) {
		if (veh.hp == selectedHp) {
			foundVehicleObj = veh;
			break;
		}
	}
	console.log({ foundVehicleObj });
	document.querySelector('#suggested-monou').style.display = 'grid';
}

function showCylinderResults(fetchedModelObj, years) {
	foundVehicleObj = fetchedModelObj.vehicles[0]; // to be sure

	const descriptionValue = descriptionSelect.value;
	const consumptionsRace = runConsumptionRace(fetchedModelObj.vehicles);

	console.log({ consumptionsRace });

	for (const consumptionObj of consumptionsRace) {
		const vehAttribute = descriptionValue.length === 1 ? consumptionObj.veh.cylinders : consumptionObj.veh.hp;
		if (vehAttribute == descriptionValue) {
			foundVehicleObj = consumptionObj.veh;
			break;
		}
	}

	// for (let veh of fetchedModelObj.vehicles) {
	//   if (descriptionValue.length === 1) {
	//     //cyls mode
	//     if (veh.cylinders == descriptionValue) {
	//       foundVehicleObj = veh;
	//       break;
	//     }
	//   } else {
	//     //hp mode
	//     if (veh.hp == descriptionValue) {
	//       foundVehicleObj = veh;
	//       break;
	//     }
	//   }
	// }
	console.log({ foundVehicleObj });

	const cyls = foundVehicleObj.cylinders;

	if (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'B8') {
		suggestedSystems = ['C-OBD II 4x2=8cyl'];
		const cobdDiv = document.querySelector('#suggested-cobd-8cyl');
		cobdDiv.querySelector('.suggested-cylinder-text').textContent = '4x2 = 8cyl';
		cobdDiv.querySelector('.left-overlay-description').textContent = '4x2 = 8cyl έως 190HP';
		cobdDiv.style.display = 'grid';
	} else if (cyls == 5 || cyls == 6) {
		suggestedSystems = ['C-OBD II 6cyl'];
		const cobdDiv = document.querySelector('#suggested-cobd-6cyl');
		const cylinderDescrText = getCylinderDescrText();
		cobdDiv.querySelector('.suggested-cylinder-text').textContent = '5-6cyl' + cylinderDescrText;
		cobdDiv.querySelector('.left-overlay-description').textContent = '5-6cyl' + cylinderDescrText;
		cobdDiv.style.display = 'grid';
	} else if (cyls == 8) {
		suggestedSystems = ['C-OBD II 8cyl'];
		const cobdDiv = document.querySelector('#suggested-cobd-8cyl');
		const cylinderDescrText = getCylinderDescrText();
		cobdDiv.querySelector('.suggested-cylinder-text').textContent = '8cyl' + cylinderDescrText;
		cobdDiv.querySelector('.left-overlay-description').textContent = '8cyl' + cylinderDescrText;
		cobdDiv.style.display = 'grid';
	} else if (years <= 1998) {
		if (foundVehicleObj.hp > 180 || (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'T')) {
			suggestedSystems = ['Smart ExR'];
			const exrDiv = document.querySelector('#suggested-exr');
			exrDiv.querySelector('.left-overlay-description').textContent = '2-4cyl' + getCylinderDescrText();
			exrDiv.style.display = 'grid';
		} else {
			suggestedSystems = ['E-GO'];
			document.querySelector('#suggested-ego').style.display = 'grid';
		}
	} else if (years >= 1999 && years <= 2004) {
		if (foundVehicleObj.hp > 180 || (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'T')) {
			suggestedSystems = ['Smart ExR'];
			const exrDiv = document.querySelector('#suggested-exr');
			exrDiv.querySelector('.left-overlay-description').textContent = '2-4cyl' + getCylinderDescrText();
			exrDiv.style.display = 'grid';
		} else {
			suggestedSystems = ['Smart ExR', 'E-GO'];
			const exrEgoDiv = document.querySelector('#suggested-exr-ego');
			exrEgoDiv.querySelector('.left-overlay-description').textContent = '2-4cyl' + getCylinderDescrText();
			exrEgoDiv.style.display = 'grid';
		}
	} else if (years >= 2005 && years <= 2013) {
		suggestedSystems = ['C-OBD II', 'Smart ExR'];
		const cobdExrDiv = document.querySelector('#suggested-cobd-exr');
		const cylinderDescrText = getCylinderDescrText();
		cobdExrDiv.querySelectorAll('.left-overlay-description').forEach(el => (el.textContent = '2-4cyl' + cylinderDescrText));
		cobdExrDiv.style.display = 'grid';
	} else {
		suggestedSystems = ['C-OBD II'];
		// document.querySelector('#suggested-cobd .suggested-price').textContent = '750€ ΦΠΑ'; giati auto edw? lathos?
		const cobdDiv = document.querySelector('#suggested-cobd');
		cobdDiv.querySelector('.left-overlay-description').textContent = '2-4cyl' + getCylinderDescrText();
		cobdDiv.style.display = 'grid';
	}
}

function runConsumptionRace(vehicles) {
	const consumptionObjs = [];
	vehicles.forEach(veh => {
		consumptionObjs.push({ conSum: veh.consumption.reduce((prev, curr) => prev + curr, 0), veh });
	});
	return consumptionObjs.sort((a, b) => b.conSum - a.conSum);
}

function displayEmulatorInfo(suggestedContainer) {
	//Hide all emulator containers first
	suggestedContainer.querySelectorAll('.info-content-block').forEach(emCont => (emCont.style.display = 'none'));

	if (foundVehicleObj.hasOwnProperty('emulators') || hasUHPII(foundVehicleObj)) {
		const vehicleEmulatorType = hasUHPII(foundVehicleObj) ? 'hp' : foundVehicleObj.emulators[0].toLowerCase();

		suggestedContainer.querySelectorAll('.suggested-lpg-system').forEach(lpgSystem => {
			lpgSystem.querySelectorAll('.info-content-block').forEach(emCont => {
				if (emCont.classList.contains(`emulator-${vehicleEmulatorType}`)) {
					if (vehicleEmulatorType === 'p' || vehicleEmulatorType === 'b6' || vehicleEmulatorType === 'b8' || vehicleEmulatorType === 'hp') {
						const priceEl = lpgSystem.querySelector('.suggested-price');
						const defaultPrice = parseInt(priceEl.textContent.split('€')[0]);
						suggestedPricesChanges.push({ priceEl, defaultPrice });
						priceEl.textContent = defaultPrice + emulatorPriceDict[vehicleEmulatorType] + '€ + ΦΠΑ';
						console.log({ suggestedPricesChanges });
					}
					emCont.querySelector('.info-content').style.height = '0px';
					emCont.style.display = 'block';
				}
			});
		});
	}
}

function hasUHPII(vehObj) {
	return vehObj.hp > 180 && vehObj.cylinders <= 4 && !vehObj.hasOwnProperty('engineCodes');
}

function configureCalculator() {
	document.querySelector('#calcTitle').textContent = 'Υπολόγισε πόσα θα εξοικονομείς με το αυτοκίνητό σου!';

	document.querySelector('#makeImg').src = makeImgPrefix + makeImgDict[makeSelect.value];
	document.querySelector('#modelName').textContent = `${modelSelect.value} (${yearSelect.value})`;

	document.querySelector('#inConsumption .text-span').innerHTML = `(${foundVehicleObj.consumption[0]}L/100km)`;
	document.querySelector('#outConsumption .text-span').innerHTML = `(${foundVehicleObj.consumption[1]}L/100km)`;
	document.querySelector('#combinedConsumption .text-span').innerHTML = `(${foundVehicleObj.consumption[2]}L/100km)`;

	const consumptionRadios = document.querySelectorAll('.radio-button.w-radio');

	consumptionRadios[0].dataset.cons = foundVehicleObj.consumption[0];
	consumptionRadios[1].dataset.cons = foundVehicleObj.consumption[1];
	consumptionRadios[2].dataset.cons = foundVehicleObj.consumption[2];

	consumptionRadios[2].click();
	document.querySelector('#calcContainerVehicle').style.display = 'grid';
	document.querySelector('#calcContainerNoVehicle').style.display = 'none';

	sliders[1].value = foundVehicleObj.consumption[2];
	outputs[1].value = sliders[1].value;
	calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';

	document.querySelector('.in-consumption').textContent = foundVehicleObj.consumption[0];
	document.querySelector('.out-consumption').textContent = foundVehicleObj.consumption[1];
	document.querySelector('.combined-consumption').textContent = foundVehicleObj.consumption[2];
}

function resetCalc() {
	document.querySelector('#calcTitle').innerHTML = 'Υπολόγισε πόσα θα εξοικονομείς με ένα σύστημα Lovato!';

	document.querySelector('#calcContainerVehicle').style.display = 'none';
	document.querySelector('#calcContainerNoVehicle').style.display = 'flex';

	sliders[1].value = 8;
	outputs[1].value = 8;
	calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';

	// document.querySelector('.step-2').style.marginBottom = '40vh';
}

document.querySelectorAll('.radio-button.w-radio input').forEach(el => {
	el.addEventListener('change', e => {
		const consumptionLabelWithData = e.target.closest('.radio-button.w-radio');
		console.log(consumptionLabelWithData);

		document.querySelectorAll('.radio-button.w-radio .consumption-choice').forEach(el => (el.style.fontWeight = 'normal')); //DEBUG!!
		consumptionLabelWithData.querySelector('.consumption-choice').style.fontWeight = 'bold';

		sliders[1].value = consumptionLabelWithData.dataset.cons;
		outputs[1].value = consumptionLabelWithData.dataset.cons;
		calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';
		calcResult();
	});
});

function getCylinderDescrText() {
	if (foundVehicleObj.hasOwnProperty('hp')) {
		return foundVehicleObj.hp > 180 ? ' έως 350HP' : ' έως 190HP';
	} else {
		return Number(foundVehicleObj.engineCodes[0].split(' ')[0]) > 180 ? ' έως 350HP' : ' έως 190HP';
	}
}

function configureEasyPay() {
	configureModelEasyPay();
	configureSystemsEasyPay();
	configureNoCreditSliders();
	configureNoCreditResults();
	// for (let container of suggestedContainers) {
	// 	if (container.style.display !== 'none') {
	// 		container.querySelectorAll('.suggested-price').forEach(priceEl => {
	// 			let price = parseInt(priceEl.textContent.split(' ')[0].replace('€', ''));
	// 			price *= VAT;
	// 			suggestedSystemPrices.push(price);
	// 		});
	// 		container.querySelectorAll('.suggested-name').forEach(nameEl => {
	// 			suggestedSystemNames.push(nameEl.textContent);
	// 		});
	// 		break;
	// 	}
	// }
	// console.log(suggestedSystemPrices);
	// console.log(suggestedSystemNames);

	// setWithCreditCard();
}

function configureModelEasyPay() {
	const makeImgSrc = document.querySelector('#makeImg').src;
	const modelNameText = document.querySelector('#modelName').textContent;
	document.querySelector('#makeImgNoCredit').src = makeImgSrc;
	document.querySelector('#makeImgCredit').src = makeImgSrc;
	document.querySelector('#modelNameNoCredit').textContent = modelNameText;
	document.querySelector('#modelNameCredit').textContent = modelNameText;
}

function configureSystemsEasyPay() {
	const activeContainer = getActiveContainer();
	const systemLogoSrcs = [...activeContainer.querySelectorAll('.system-logo')].map(el => el.src);
	const systemLogoCreditEls = document.querySelectorAll('.system-logo-credit');
	const systemPriceCreditEls = document.querySelectorAll('.system-price-credit');
	const suggestedPrices = [...activeContainer.querySelectorAll('.suggested-price')].map(el => el.textContent.split('€')[0] * VAT + '€');

	systemLogoCreditEls.forEach((el, i) => (el.src = systemLogoSrcs[i % 2]));
	systemPriceCreditEls.forEach((el, i) => (el.textContent = suggestedPrices[i % 2]));

	if (systemLogoSrcs.length === 2) {
		[...document.querySelectorAll('.easy-pay-first-suggestion-text')].map(el => (el.textContent = 'Η ΙΔΑΝΙΚΟΤΕΡΗ ΠΡΟΤΑΣΗ ΜΑΣ'));
		[...document.querySelectorAll('.easy-pay-second-suggestion')].map(el => (el.style.display = 'block'));
	} else {
		[...document.querySelectorAll('.easy-pay-first-suggestion-text')].map(el => (el.textContent = 'ΠΡΟΤΑΣΗ ΣΥΣΤΗΜΑΤΟΣ'));
		[...document.querySelectorAll('.easy-pay-second-suggestion')].map(el => (el.style.display = 'none'));
	}
	document.querySelector('.easy-pay-suggested-system-div').click(); //default selection first suggestion

	console.log(systemLogoCreditEls, systemLogoSrcs, suggestedPrices);
}

function configureNoCreditSliders() {
	selectedEasyPaySystemPrice = getSelectedEasyPaySystemPrice();
	console.log({ selectedEasyPaySystemPrice });
	const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;

	prokatavoliNoCreditSlider.max = floorPrice - 500;
	document.querySelector('.max-prokatavoli-slider-text').textContent = floorPrice - 500 + '€';

	prokatavoliNoCreditCover.style.width = calcCoverWidth(prokatavoliNoCreditSlider) + '%';
	doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
	outputNoCreditProkatavoli.value = prokatavoliNoCreditSlider.value;
	outputNoCreditDoseis.value = doseisNoCreditSlider.value;

	document.querySelector('.enapomeinan-poso').textContent = (selectedEasyPaySystemPrice - parseInt(prokatavoliNoCreditSlider.value)).toFixed(1);
}

function getSelectedEasyPaySystemPrice() {
	const selectedSystemDiv = document.querySelector('.easy-pay-suggested-system-div');
	let priceText =
		selectedSystemDiv.querySelector('.system-checkmark').style.display !== 'none'
			? selectedSystemDiv.querySelector('.system-price-credit').textContent
			: document.querySelector('.easy-pay-second-suggestion .system-price-credit').textContent;

	console.log(selectedSystemDiv, priceText);
	return parseFloat(priceText.replace('€', ''));
}

function configureNoCreditResults() {
	const monthlyCost = parseFloat(enapomeinanPoso.textContent) / parseInt(doseisNoCreditSlider.value);
	noCreditMonthlyCost.textContent = monthlyCost.toFixed(2) + '€';

	//DEBUG LPG RESULT OR CNG RESULT
	let monthlyGain = parseFloat(lpgResult.textContent.replace('€', ''));
	if (!perMonthCheckbox.checked) {
		//DEBUG (&& selectedGas === LPG)
		monthlyGain /= 12;
	}
	noCreditMonthlyGain.textContent = monthlyGain.toFixed(2) + '€';
}

function setWithCreditCard() {
	setCostWithCreditCard();
	creditCardInstallmentsOnChange(creditCardInstallments.value);
}

function setCostWithCreditCard() {
	creditCardPrice1.innerHTML = `${suggestedSystemPrices[0]}€ <br>(${suggestedSystemNames[0]})`;
	creditCardPrice1.previousElementSibling.checked = true;
	creditCardPrice2.parentElement.style.display = 'block';

	if (suggestedSystemPrices.length === 2) {
		creditCardPrice2.innerHTML = `${suggestedSystemPrices[1]}€ <br>(${suggestedSystemNames[1]})`;
		creditCardPrice2.previousElementSibling.checked = true;
	} else {
		creditCardPrice2.parentElement.style.display = 'none';
		creditCardPrice2.previousElementSibling.checked = false;
	}
}

creditCardInstallments.addEventListener('change', e => creditCardInstallmentsOnChange(e.target.value));

function creditCardInstallmentsOnChange(value) {
	console.log({ suggestedSystemPrices });
	let cost = creditCardPrice1.previousElementSibling.checked
		? suggestedSystemPrices[0] || parseFloat(creditCardPrice1.textContent.replace(' €', ''))
		: suggestedSystemPrices[1] || parseFloat(creditCardPrice2.textContent.replace(' €', ''));

	let installments = +value;
	console.log({ installments });
	console.log({ cost });

	document.querySelector('#creditCardFinalCost').textContent = `${cost}€`;
	document.querySelector('#creditCardPerMonth').textContent = `${(cost / installments).toFixed(2)}€`;

	// let lpgPerMonthOrYearCost = parseFloat(lpgResult.textContent.replace('€', ''));

	if (!perMonthCheckbox.checked) {
		// document.querySelector('#creditCardBenefitLabel').textContent = 'Ετήσιο όφελος LPG';
	} else {
		// document.querySelector('#creditCardBenefitLabel').textContent = 'Μηνιαίο όφελος LPG';
	}

	document.querySelector('#creditCardBenefit').textContent = lpgResult.textContent;
}

document.querySelectorAll('.credit-card-radio').forEach(radio => {
	radio.addEventListener('change', e => {
		creditCardInstallmentsOnChange(creditCardInstallments.value);
	});
});

function calcEasyPay() {
	creditCardInstallmentsOnChange(creditCardInstallments.value);
}

function updateEasyPay() {
	if (!perMonthCheckbox.checked) {
		// document.querySelector('#creditCardBenefitLabel').textContent = 'Ετήσιο όφελος LPG';
	} else {
		// document.querySelector('#creditCardBenefitLabel').textContent = 'Μηνιαίο όφελος LPG';
	}
}

function getActiveContainer() {
	return [...suggestedContainers].filter(container => container.style.display !== 'none')[0];
}

/* System Identification END */

/* Calculator */
const lpgConsumption = 1.15; //15% more than petrol
const cngConsumption = -0.444; //44,44% less than petrol

const sliders = document.querySelectorAll('.range-slider-calc');
const outputs = document.querySelectorAll('input[type=number]');
const lpgResult = document.querySelector('#lpg-result');
const cngResult = document.querySelector('#cng-result');
const lpgPercentageEl = document.querySelector('#lpg-percentage');
const cngPercentageEl = document.querySelector('#cng-percentage');
const petrolCost = document.querySelector('#petrolCost');
const lpgCost = document.querySelector('#lpgCost');
const cngCost = document.querySelector('#cngCost');
const perMonthCheckbox = document.querySelector('#perMonthCheckbox');
const costLabels = document.querySelectorAll('.cost-label');
const lpgResultLabel = document.querySelector('#lpg-result-label');
const cngResultLabel = document.querySelector('#cng-result-label');
let fuelPrices;
const calcCovers = document.querySelectorAll('.calc-cover');

sliders.forEach((slider, i) => {
	outputs[i].value = slider.value;
	calcCovers[i].style.width = calcCoverWidth(slider) + '%';

	slider.addEventListener('input', () => {
		outputs[i].value = slider.value;
		calcCovers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
		calcEasyPay();
	});
	outputs[i].addEventListener('input', function () {
		slider.value = this.value;
		calcCovers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
		calcEasyPay();
	});
});

perMonthCheckbox.addEventListener('change', function () {
	calcResult();
	creditCardInstallmentsOnChange(creditCardInstallments.value);
});

calcResult(); //init
calcEasyPay(); //init

function calcResult() {
	let petrolCostPerMonth, lpgCostPerMonth, cngCostPerMonth;

	const ltPer100Km = parseFloat(document.querySelector('.lt-100km').value);
	const kmPerYear = parseInt(document.querySelector('.km-year').value);
	const petrolPrice = parseFloat(document.querySelector('.petrol-price').value);
	const lpgPrice = parseFloat(document.querySelector('.lpg-price').value);
	const cngPrice = parseFloat(document.querySelector('.cng-price').value);

	petrolCostPerMonth = (ltPer100Km * kmPerYear * petrolPrice) / (100 * 12); // €/month

	lpgCostPerMonth = (ltPer100Km * lpgConsumption * kmPerYear * lpgPrice) / (100 * 12);
	cngCostPerMonth = (ltPer100Km * (cngConsumption + 1) * kmPerYear * cngPrice) / (100 * 12);

	const lpgPercentageValue = (100 * (petrolCostPerMonth - lpgCostPerMonth)) / petrolCostPerMonth;
	const cngPercentageValue = (100 * (petrolCostPerMonth - cngCostPerMonth)) / petrolCostPerMonth;

	if (!perMonthCheckbox.checked) {
		costLabels.forEach(label => (label.textContent = 'Ετήσια Έξοδα:'));
		lpgResultLabel.textContent = 'Ετήσιο όφελος';
		cngResultLabel.textContent = 'Ετήσιο όφελος';

		petrolCost.textContent = (petrolCostPerMonth * 12).toFixed(1) + '€';
		lpgCost.textContent = (lpgCostPerMonth * 12).toFixed(1) + '€';
		cngCost.textContent = (cngCostPerMonth * 12).toFixed(1) + '€';

		lpgResult.textContent = ((petrolCostPerMonth - lpgCostPerMonth) * 12).toFixed(2) + '€';
		lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

		cngResult.textContent = ((petrolCostPerMonth - cngCostPerMonth) * 12).toFixed(2) + '€';
		cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';
	} else {
		costLabels.forEach(label => (label.textContent = 'Μηνιαία Έξοδα:'));
		lpgResultLabel.textContent = 'Μηνιαίο όφελος';
		cngResultLabel.textContent = 'Μηνιαίο όφελος';

		petrolCost.textContent = petrolCostPerMonth.toFixed(1) + '€';
		lpgCost.textContent = lpgCostPerMonth.toFixed(1) + '€';
		cngCost.textContent = cngCostPerMonth.toFixed(1) + '€';

		lpgResult.textContent = (petrolCostPerMonth - lpgCostPerMonth).toFixed(2) + '€';
		lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

		cngResult.textContent = (petrolCostPerMonth - cngCostPerMonth).toFixed(2) + '€';
		cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';
	}

	//EasyPay
	let monthlyGain = parseFloat(lpgResult.textContent.replace('€', ''));
	if (!perMonthCheckbox.checked) {
		//DEBUG (&& selectedGas === LPG)
		monthlyGain /= 12;
	}
	noCreditMonthlyGain.textContent = monthlyGain.toFixed(2) + '€';
}

function calcCoverWidth(slider) {
	let offset = (slider.max - slider.value) / (slider.max - slider.min) > 0.2 ? 0 : 1.5;
	return ((slider.max - slider.value) / (slider.max - slider.min)) * 100 + offset;
}

/* Calculator END */

/* PDF DOWNLOAD */
document.querySelector('#downloadPdfBtn').addEventListener('click', e => {
	e.preventDefault();
	console.log(e.target);
	const dataToSend = document.querySelector('#pdfName').value;

	startLoadingSelect(e.target);
	fetch(downloadPdfUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name: dataToSend })
	})
		.then(res => res.blob())
		.then(blob => {
			const newBlob = new Blob([blob], { type: 'application/pdf' });
			console.log(newBlob);
			downloadFile(newBlob, dataToSend);
			endLoadingSelect(e.target);
		})
		.catch(error => {
			endLoadingSelect(e.target);
			console.error('Error Fetch:', error);
		});
});

function downloadFile(blob, fileName) {
	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(newBlob);
		return;
	}
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fileName + '.pdf';
	document.body.append(link);
	link.click();
	link.remove();

	// in case the Blob uses a lot of memory
	setTimeout(() => URL.revokeObjectURL(link.href), 7000);
}
