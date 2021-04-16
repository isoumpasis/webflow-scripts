/* System Identification */
const urlMake = 'https://lovatohellas.herokuapp.com/vehicleDB/makeTest';
const urlYear = 'https://lovatohellas.herokuapp.com/vehicleDB/yearTest';

let selectedYears;
let selectedModels;
let selectedModelName;
let selectedModelObj;
let foundVehicleObj;

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const cylinderOrEngineSelect = document.querySelector('#cylinderOrEngineSelect');

const suggestedContainers = document.querySelectorAll('.suggested-container');
let suggestedSystems;

const systemQueryDict = {
	'DI 3000B': 'di3000b',
	'DI 60': 'di60',
	'DI 108': 'di108'
};

const makeImgDict = {
	'ALFA ROMEO': 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f1d502c7ef4d03ff154b_Alfa_Romeo.png',
	AUDI: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f607b580721ba1274496_Audi.png',
	BMW: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f607325eb960af680a4e_BMW.png',
	CHEVROLET: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60729203574193c205c_Chevrolet.png',
	CHRYSLER: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f6077735848685f48c4d_Chrysler.png',
	CITROEN: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f607703f5581b7a6b6e9_Citroen.png',
	DACIA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f607ac4c2566782969fa_Dacia.png',
	DAEWOO: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f6096e3ae999700f15ad_Daewoo.png',
	DAIHATSU: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f6095e0f21739e801c4d_Daihatsu.png',
	DODGE: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60929203581043c205d_Dodge.png',
	FIAT: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f609aecccf25fc3868f0_Fiat.png',
	FORD: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f609ed355314a4ea8ba7_Ford.png',
	HONDA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f6094bacedfa12748b66_Honda.png',
	HUMMER: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f609325eb912c5680a51_Hummer.png',
	HYUNDAI: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60969316192201b5e9a_Hyundai.png',
	JAGUAR: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f609703f555667a6b6eb_Jaguar.png',
	JEEP: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f6099881859ece0dc158_Jeep.png',
	KIA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f609ed35535997ea8ba8_Kia.jpg',
	LADA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60b7735848bc7f48c50_Lada.png',
	LANCIA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60b703f55244fa6b6ec_Lancia.png',
	'LAND ROVER': 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60baecccf47553868f2_Land_Rover.png',
	LEXUS: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60b02c7ef3588ff4bed_Lexus.png',
	MAZDA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60bac4c25e840296a07_Mazda.png',
	'MERCEDES-BENZ': 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60b2cf4c1fc9aeb4a97_Mercedes-Benz.png',
	MINI: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60dec0785fc99826f63_Mini.png',
	MITSUBISHI: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60df4fa193ad096cf91_Mitsubishi.png',
	NISSAN: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60c3f6057d3245ac3fd_Nissan.png',
	OPEL: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60d8ec314543c0c7030_Opel.png',
	PEUGEOT: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60da5cf01576cad4d60_Peugeot.png',
	PORSCHE: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60dec07850afc826f64_Porsche.png',
	RENAULT: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60e7c02f416a420a7ea_Renault.png',
	ROVER: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60deb33aa3e792d0d74_Rover.png',
	SAAB: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60dde273a2a845dc8c0_Saab.png',
	SEAT: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60e66bedcb79fa5a7ff_Seat.png',
	SKODA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60e9d13c22e7326344f_Skoda.png',
	SMART: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60dacb311235e2254ff_Smart.png',
	SUBARU: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60f51e2742da00ac18a_Subaru.png',
	SUZUKI: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60f1fb9c523b6315031_Suzuki.png',
	TOYOTA: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60f163ba8861a8a41ee_Toyota.png',
	VOLVO: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60f6931617b461b5e9e_Volvo.png',
	VW: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6077f60f66bedc404ea5a800_VW.png'
};

let suggestedSystemPrices = [];
let suggestedSystemNames = [];
const VAT = 1.24;

const creditCardPrice1 = document.querySelector('#creditCardPrice1');
const creditCardPrice2 = document.querySelector('#creditCardPrice2');
const creditCardInstallments = document.querySelector('#creditCardInstallments');

document.addEventListener('DOMContentLoaded', () => {
	initSelects();
	initEasyPay();

	// if (typeof Storage !== 'undefined' && sessionStorage.selectedModels) {
	//   selectedModels = JSON.parse(sessionStorage.selectedModels);
	//   console.log('Parsed json local storage', selectedModels);
	//   selectMakeOption();
	//   populateModelSelect();
	//   if (sessionStorage.selectedModel) {
	//     selectModelOption(); //from storage
	//     populateYearSelect();
	//     if (sessionStorage.selectedYear) {
	//       selectYearOption(); //from storage
	//       populateCylinderOrEngineSelect();
	//       if (sessionStorage.selectedCylinder) {
	//         selectCylinderOption(); //from storage
	//         //showResults();
	//       }
	//     }
	//   }
	// }
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

function initEasyPay() {
	creditCardPrice1.previousElementSibling.checked = true;
	creditCardInstallmentsOnChange(creditCardInstallments.value);
}

makeSelect.addEventListener('change', function () {
	console.log('make changed', this.value);

	modelSelect.disabled = true;
	cylinderOrEngineSelect.disabled = true;
	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
	cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	resetCalc();

	if (!this.value) {
		yearSelect.disabled = true;
		yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
		resetCalc();
		// sessionStorage.clear(); //reset //DO YOU WANT TO ERASE EVERYTHING? maybe there is an autonomous var you want to keep
		return;
	}
	yearSelect.disabled = false;
	yearSelect.innerHTML = '';
	startLoadingSelect(yearSelect);

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
			if (status !== 200) {
				endLoadingSelect(yearSelect);
				yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			//selectedModels = data;
			selectedYears = data;
			// sessionStorage.clear(); //reset every time make changes
			// sessionStorage.selectedYears = JSON.stringify(selectedYears);

			populateYearSelect();
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

function populateModelSelect() {
	let modelOptionsArray = ['<option value="">Επιλέξτε Μοντέλο</option>'];
	selectedModels.forEach(model => {
		modelOptionsArray.push(`<option value="${model.name}">${model.name}</option>`);
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
	cylinderOrEngineSelect.disabled = true;
	cylinderOrEngineSelect.innerHTML = '<option>Περιγραφή</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	resetCalc();
	// sessionStorage.removeItem('selectedYear');
	// sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!value) {
		modelSelect.disabled = true;
		modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
		cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
		resetCalc();
		// sessionStorage.removeItem('selectedVehicles');
		return;
	}
	// selectedModel = selectedModels.models.filter(model => model.name === this.value)[0];
	// console.log('selectedModel', selectedModel);
	// sessionStorage.selectedModel = JSON.stringify(selectedModel);
	modelSelect.disabled = false;
	modelSelect.innerHTML = '';
	startLoadingSelect(modelSelect);
	let status;
	fetch(urlYear, {
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
			selectedModels = data;

			// sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

			// cylinderOrEngineSelect.innerHTML = `<option value="">${
			//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
			// }</option>`;
			populateModelSelect();
			endLoadingSelect(modelSelect);
		})
		.catch(error => {
			endLoadingSelect(modelSelect);
			yearSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
}

function populateYearSelect() {
	let yearOptionsArray = ['<option value="">Επιλέξτε Χρονολογία</option>'];

	selectedYears.forEach(year => {
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
	// sessionStorage.removeItem('selectedCylinder');
	//sessionStorage.removeItem('suggestedSystems');
	//sessionStorage.removeItem('selectedSystem');

	if (!value) {
		cylinderOrEngineSelect.disabled = true;
		// cylinderOrEngineSelect.innerHTML = `<option value="">${
		//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
		// }</option>`;
		// sessionStorage.removeItem('selectedYear');
		return;
	}
	selectedModelName = value;
	// sessionStorage.selectedYear = value;
	populateCylinderOrEngineSelect();
}

function populateCylinderOrEngineSelect() {
	// if (typeof Storage !== 'undefined' && !sessionStorage.selectedYear) return; //dont know if bug? why return??
	selectedModelObj = selectedModels.filter(model => model.name === selectedModelName)[0];
	console.log('selectedModelObj', selectedModelObj);
	let optionsArray;

	if (selectedModelObj.isDirect) {
		optionsArray = ['<option value="">Επιλέξτε Κινητήρα</option>'];
		let engineCodesOptions = [];
		selectedModelObj.vehicles.forEach(vehicle => {
			if (yearSelect.value >= vehicle.years[0] && yearSelect.value <= vehicle.years[1]) {
				vehicle.engineCodes.forEach(code => {
					let convertibleSymbol = vehicle.isConvertible ? ' ✔️' : ' &#10060;';
					engineCodesOptions.push(code + convertibleSymbol);
				});
			}
		});
		engineCodesOptions = [...new Set(engineCodesOptions)].sort((a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0]));
		engineCodesOptions.forEach(engineCode => {
			let engineCodeValue = engineCode.split(' ');
			engineCodeValue.pop();
			engineCodeValue = engineCodeValue.join(' ');
			optionsArray.push(`<option value="${engineCodeValue}">${engineCode}</option>`);
		});
	} else {
		const filteredVehicles = selectedModelObj.vehicles.filter(veh => yearSelect.value >= veh.years[0] && yearSelect.value <= veh.years[1]);

		console.log({ filteredVehicles });
		if (
			filteredVehicles.length === 1 ||
			filteredVehicles.every(
				veh =>
					veh.consumption[0] === filteredVehicles[0].consumption[0] &&
					veh.consumption[1] === filteredVehicles[0].consumption[1] &&
					veh.consumption[2] === filteredVehicles[0].consumption[2] &&
					veh.cylinders < 6 &&
					veh.hp < 150
			)
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

	cylinderOrEngineSelect.innerHTML = optionsArray.join('');
	cylinderOrEngineSelect.disabled = false;
	cylinderOrEngineSelect.focus();
	//One option -> auto populate
	if (optionsArray.length === 2) {
		cylinderOrEngineSelect.selectedIndex = 1;
		cylinderOrEngineOnChange(cylinderOrEngineSelect.value);
		return;
	}
}

cylinderOrEngineSelect.addEventListener('change', e => cylinderOrEngineOnChange(e.target.value));

function cylinderOrEngineOnChange(value) {
	console.log('cylinder changed', value);

	if (!value) {
		suggestedContainers.forEach(container => {
			container.style.display = 'none';
		});
		resetCalc();
		// sessionStorage.removeItem('selectedCylinderOrEngine');
		//sessionStorage.removeItem('suggestedSystems');
		//sessionStorage.removeItem('selectedSystem');
		return;
	}
	// sessionStorage.selectedCylinderOrEngine = value;
	showResults();
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
	let years = yearSelect.value;
	suggestedSystemPrices = [];
	suggestedSystemNames = [];

	if (selectedModelObj.isDirect) {
		showDirectResults();
	} else {
		showCylinderResults(years);
	}

	//If there is a result
	if ([...suggestedContainers].some(container => container.style.display !== 'none')) {
		configureEasyPay();
		// [...suggestedContainers].filter(c => c.style.display !== 'none')[0].scrollIntoView({ behavior: 'smooth', block: 'b' });
		document.querySelector('.kilometers-liters').scrollIntoView({ behavior: 'smooth', block: 'end' });
		// document.querySelector('.car-result-block').scrollIntoView({ behavior: 'smooth', block: 'end' });
		// document.querySelector('#vehicleForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
		configureCalculator();
	} else {
		resetCalc();
	}

	// sessionStorage.suggestedSystems = JSON.stringify(suggestedSystems);
}

function showDirectResults() {
	const selectedEngineCode = cylinderOrEngineSelect.value;
	label: for (let veh of selectedModelObj.vehicles) {
		for (let engineCode of veh.engineCodes) {
			if (engineCode === selectedEngineCode) {
				foundVehicleObj = veh;
				break label;
			}
		}
	}
	console.log({ foundVehicleObj });

	if (foundVehicleObj.isConvertible) {
		const directSystemDiv = document.querySelector(`#suggested-${systemQueryDict[foundVehicleObj.system]}`);
		directSystemDiv.style.display = 'grid';
	} else {
		suggestedContainers.forEach(container => {
			container.style.display = 'none';
		});
	}
}

function showCylinderResults(years) {
	foundVehicleObj = selectedModelObj.vehicles[0];
	const selectedHp = cylinderOrEngineSelect.value;
	for (let veh of selectedModelObj.vehicles) {
		if (veh.hp == selectedHp) {
			foundVehicleObj = veh;
			break;
		}
	}
	console.log({ foundVehicleObj });

	let cyls = foundVehicleObj.cylinders;

	if (cyls == 5 || cyls == 6) {
		suggestedSystems = ['C-OBD II 6cyl'];
		const cobdDiv = document.querySelector('#suggested-cobd');
		cobdDiv.style.display = 'grid';
		cobdDiv.querySelector('.suggested-name').textContent = 'C-OBD II 6cyl';
		cobdDiv.querySelector('.suggested-price').textContent = '1000€ + ΦΠΑ';
	} else if (cyls == 8) {
		suggestedSystems = ['C-OBD II 8cyl'];
		const cobdDiv = document.querySelector('#suggested-cobd');
		cobdDiv.style.display = 'grid';
		cobdDiv.querySelector('.suggested-name').textContent = 'C-OBD II 8cyl';
		cobdDiv.querySelector('.suggested-price').textContent = '1100€ + ΦΠΑ';
	} else if (years < 1999) {
		suggestedSystems = ['E-GO'];
		document.querySelector('#suggested-ego').style.display = 'grid';
	} else if (years >= 1999 && years < 2007) {
		suggestedSystems = ['E-GO', 'Smart ExR E/P'];
		document.querySelector('#suggested-ego-ep').style.display = 'grid';
	} else if (years >= 2007 && years < 2012) {
		suggestedSystems = ['Smart ExR K/P', 'C-OBD II'];
		document.querySelector('#suggested-kp-cobd').style.display = 'grid';
	} else {
		suggestedSystems = ['C-OBD II'];
		document.querySelector('#suggested-cobd').style.display = 'grid';
	}
}

function configureCalculator() {
	document.querySelector('#calcTitle').textContent = 'Υπολόγισε πόσα εξοικονομείς με το αυτοκίνητό σου!';

	document.querySelector('#makeImg').src = makeImgDict[makeSelect.value];
	document.querySelector('#modelName').textContent = `${modelSelect.value} (${yearSelect.value})`;

	document.querySelector('#inConsumption').innerHTML = `<strong>Εντός πόλης</strong><br>(${foundVehicleObj.consumption[0]}L/100km)`;
	document.querySelector('#outConsumption').innerHTML = `<strong>Εκτός πόλης</strong><br>(${foundVehicleObj.consumption[1]}L/100km)`;
	document.querySelector('#combinedConsumption').innerHTML = `<strong>Μικτά</strong><br>(${foundVehicleObj.consumption[2]}L/100km)`;
	document.querySelectorAll('.radio-button.w-radio')[0].dataset.cons = foundVehicleObj.consumption[0];
	document.querySelectorAll('.radio-button.w-radio')[1].dataset.cons = foundVehicleObj.consumption[1];
	document.querySelectorAll('.radio-button.w-radio')[2].dataset.cons = foundVehicleObj.consumption[2];

	document.querySelectorAll('.radio-button.w-radio')[2].click();
	document.querySelector('#consumptionDiv').style.display = 'block';

	sliders[1].value = foundVehicleObj.consumption[2];
	outputs[1].value = sliders[1].value;
	covers[1].style.width = calcCoverWidth(sliders[1]) + '%';
}

function resetCalc() {
	document.querySelector('#consumptionDiv').style.display = 'none';
	document.querySelector('#calcTitle').innerHTML = 'Υπολόγισε πόσα εξοικονομείς με <br> συστήματα Lovato!';

	sliders[1].value = 8;
	outputs[1].value = 8;
	covers[1].style.width = calcCoverWidth(sliders[1]) + '%';
}

document.querySelectorAll('.radio-button.w-radio').forEach(el => {
	el.addEventListener(
		'click',
		e => {
			e.stopPropagation();
			// const radioInput = e.target.querySelector('input');
			console.log('hello', e.target);
			const consumptionLabelWithData = e.target.closest('.radio-button.w-radio');
			sliders[1].value = consumptionLabelWithData.dataset.cons;
			outputs[1].value = consumptionLabelWithData.dataset.cons;
			covers[1].style.width = calcCoverWidth(sliders[1]) + '%';
		},
		true
	);
});

function configureEasyPay() {
	for (let container of suggestedContainers) {
		if (container.style.display !== 'none') {
			container.querySelectorAll('.suggested-price').forEach(priceEl => {
				let price = parseInt(priceEl.textContent.split(' ')[0].replace('€', ''));
				price *= VAT;
				suggestedSystemPrices.push(price);
			});
			container.querySelectorAll('.suggested-name').forEach(nameEl => {
				suggestedSystemNames.push(nameEl.textContent);
			});
			break;
		}
	}
	console.log(suggestedSystemPrices);
	console.log(suggestedSystemNames);

	setWithCreditCard();
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

	if (perYearCheckbox.checked) {
		document.querySelector('#creditCardBenefitLabel').textContent = 'Ετήσιο όφελος LPG';
	} else {
		document.querySelector('#creditCardBenefitLabel').textContent = 'Μηνιαίο όφελος LPG';
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
	if (perYearCheckbox.checked) {
		document.querySelector('#creditCardBenefitLabel').textContent = 'Ετήσιο όφελος LPG';
	} else {
		document.querySelector('#creditCardBenefitLabel').textContent = 'Μηνιαίο όφελος LPG';
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
		calcEasyPay();
	});
	outputs[i].addEventListener('input', function () {
		slider.value = this.value;
		covers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
		calcEasyPay();
	});
});

perYearCheckbox.addEventListener('change', function () {
	calcResult();
	creditCardInstallmentsOnChange(creditCardInstallments.value);
});

calcResult(); //init
calcEasyPay(); //init

function calcResult() {
	let petrolCostPerMonth, lpgCostPerMonth, cngCostPerMonth;

	const ltPer100Km = parseInt(document.querySelector('.lt-100km').value);
	const kmPerYear = parseInt(document.querySelector('.km-year').value);
	const petrolPrice = parseFloat(document.querySelector('.petrol-price').value);
	const lpgPrice = parseFloat(document.querySelector('.lpg-price').value);
	const cngPrice = parseFloat(document.querySelector('.cng-price').value);

	petrolCostPerMonth = (ltPer100Km * kmPerYear * petrolPrice) / (100 * 12); // €/month

	lpgCostPerMonth = (ltPer100Km * lpgConsumption * kmPerYear * lpgPrice) / (100 * 12);
	cngCostPerMonth = (ltPer100Km * (cngConsumption + 1) * kmPerYear * cngPrice) / (100 * 12);

	const lpgPercentageValue = (100 * (petrolCostPerMonth - lpgCostPerMonth)) / petrolCostPerMonth;
	const cngPercentageValue = (100 * (petrolCostPerMonth - cngCostPerMonth)) / petrolCostPerMonth;

	if (perYearCheckbox.checked) {
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
}

function calcCoverWidth(slider) {
	let offset = (slider.max - slider.value) / (slider.max - slider.min) > 0.2 ? 0 : 1.5;
	return ((slider.max - slider.value) / (slider.max - slider.min)) * 100 + offset;
}

/* Calculator END */
