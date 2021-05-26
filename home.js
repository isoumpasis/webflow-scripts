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
	hp: 90,
	'double-hp': 130
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
const prokatavoliCreditSlider = document.querySelector('.prokatavoli-credit-slider');

const doseisNoCreditSlider = document.querySelector('.doseis-no-credit-slider');
const doseisCreditSelect = document.querySelector('.doseis-credit-select');

const noVehicleNoCreditSlider = document.querySelector('.no-vehicle-no-credit-slider');
const noVehicleCreditSlider = document.querySelector('.no-vehicle-credit-slider');

const prokatavoliNoCreditCover = document.querySelector('.prokatavoli-no-credit-cover');
const prokatavoliCreditCover = document.querySelector('.prokatavoli-credit-cover');

const doseisNoCreditCover = document.querySelector('.doseis-no-credit-cover');

const noVehicleNoCreditCover = document.querySelector('.no-vehicle-no-credit-cover');
const noVehicleCreditCover = document.querySelector('.no-vehicle-credit-cover');

const outputNoCreditProkatavoli = document.querySelector('.output-no-credit-prokatavoli');
const outputCreditProkatavoli = document.querySelector('.output-credit-prokatavoli');

const outputNoCreditDoseis = document.querySelector('.output-no-credit-doseis');

const outputNoCreditNoVehicle = document.querySelector('.output-no-credit-no-vehicle');
const outputCreditNoVehicle = document.querySelector('.output-credit-no-vehicle');

const noCreditProkatavoliMinus = document.querySelector('.no-credit-prokatavoli-minus');
const noCreditProkatavoliPlus = document.querySelector('.no-credit-prokatavoli-plus');
const creditProkatavoliMinus = document.querySelector('.credit-prokatavoli-minus');
const creditProkatavoliPlus = document.querySelector('.credit-prokatavoli-plus');

const noCreditDoseisMinus = document.querySelector('.no-credit-doseis-minus');
const noCreditDoseisPlus = document.querySelector('.no-credit-doseis-plus');

const noCreditNoVehicleMinus = document.querySelector('.no-credit-no-vehicle-minus');
const noCreditNoVehiclePlus = document.querySelector('.no-credit-no-vehicle-plus');
const creditNoVehicleMinus = document.querySelector('.credit-no-vehicle-minus');
const creditNoVehiclePlus = document.querySelector('.credit-no-vehicle-plus');

const noCreditEnapomeinanPoso = document.querySelector('.no-credit-enapomeinan-poso');
const creditEnapomeinanPoso = document.querySelector('.credit-enapomeinan-poso');

const noCreditFinalCost = document.querySelector('.no-credit-final-cost');
const creditFinalCost = document.querySelector('.credit-final-cost');

const noCreditMonthlyCost = document.querySelector('.no-credit-monthly-cost');
const noCreditMonthlyGain = document.querySelector('.no-credit-monthly-gain');
const creditMonthlyCost = document.querySelector('.credit-monthly-cost');
const creditMonthlyGain = document.querySelector('.credit-monthly-gain');

const minProkatavoliNoCreditSliderText = document.querySelector('.min-prokatavoli-no-credit-slider-text');
const maxProkatavoliNoCreditSliderText = document.querySelector('.max-prokatavoli-no-credit-slider-text');
const minProkatavoliCreditSliderText = document.querySelector('.min-prokatavoli-credit-slider-text');
const maxProkatavoliCreditSliderText = document.querySelector('.max-prokatavoli-credit-slider-text');

const minDoseisNoCreditSliderText = document.querySelector('.min-doseis-no-credit-slider-text');
const maxDoseisNoCreditSliderText = document.querySelector('.max-doseis-no-credit-slider-text');

const minNoVehicleNoCreditSliderText = document.querySelector('.min-no-vehicle-no-credit-slider-text');
const maxNoVehicleNoCreditSliderText = document.querySelector('.max-no-vehicle-no-credit-slider-text');
const minNoVehicleCreditSliderText = document.querySelector('.min-no-vehicle-credit-slider-text');
const maxNoVehicleCreditSliderText = document.querySelector('.max-no-vehicle-credit-slider-text');

let noCreditInterest = 12.6;
let creditInterest = 7.2; //8.91;
let selectedEasyPaySystemPrice;

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
	initNoCredit();
	initCredit();
	initEasyPayTabs();
	initEasyPaySystemSelection();
	resetEasyPay();
}

function initNoCredit() {
	prokatavoliNoCreditSlider.addEventListener('input', e => prokatavoliNoCreditSliderOnChange(e.target.value));
	doseisNoCreditSlider.addEventListener('input', e => doseisNoCreditSliderOnChange(e.target.value));
	noVehicleNoCreditSlider.addEventListener('input', e => noVehicleNoCreditSliderOnChange(e.target.value));

	outputNoCreditProkatavoli.addEventListener('change', function () {
		if (+this.value > +prokatavoliNoCreditSlider.max) this.value = prokatavoliNoCreditSlider.max;
		if (+this.value < +prokatavoliNoCreditSlider.min) this.value = prokatavoliNoCreditSlider.min;
		if (+this.value) this.value = Math.round(+this.value);
		prokatavoliNoCreditSliderOnChange(this.value);
	});

	outputNoCreditDoseis.addEventListener('change', function () {
		if (+this.value > +doseisNoCreditSlider.max) this.value = doseisNoCreditSlider.max;
		if (+this.value < +doseisNoCreditSlider.min) this.value = doseisNoCreditSlider.min;
		if (+this.value) this.value = Math.round(+this.value);
		doseisNoCreditSliderOnChange(this.value);
	});

	outputNoCreditNoVehicle.addEventListener('change', function () {
		if (+this.value > +noVehicleNoCreditSlider.max) this.value = noVehicleNoCreditSlider.max;
		if (+this.value < +noVehicleNoCreditSlider.min) this.value = noVehicleNoCreditSlider.min;
		if (+this.value) this.value = Math.round(+this.value);
		noVehicleNoCreditSliderOnChange(this.value);
	});

	noCreditProkatavoliMinus.addEventListener('click', () =>
		prokatavoliNoCreditSliderOnChange(parseInt(prokatavoliNoCreditSlider.value) - parseInt(prokatavoliNoCreditSlider.step))
	);
	noCreditProkatavoliPlus.addEventListener('click', () =>
		prokatavoliNoCreditSliderOnChange(parseInt(prokatavoliNoCreditSlider.value) + parseInt(prokatavoliNoCreditSlider.step))
	);

	noCreditDoseisMinus.addEventListener('click', () =>
		doseisNoCreditSliderOnChange(parseInt(doseisNoCreditSlider.value) - parseInt(doseisNoCreditSlider.step))
	);
	noCreditDoseisPlus.addEventListener('click', () =>
		doseisNoCreditSliderOnChange(parseInt(doseisNoCreditSlider.value) + parseInt(doseisNoCreditSlider.step))
	);

	noCreditNoVehicleMinus.addEventListener('click', () =>
		noVehicleNoCreditSliderOnChange(parseInt(noVehicleNoCreditSlider.value) - parseInt(noVehicleNoCreditSlider.step))
	);
	noCreditNoVehiclePlus.addEventListener('click', () =>
		noVehicleNoCreditSliderOnChange(parseInt(noVehicleNoCreditSlider.value) + parseInt(noVehicleNoCreditSlider.step))
	);
}
function initCredit() {
	noVehicleCreditSlider.addEventListener('input', e => noVehicleCreditSliderOnChange(e.target.value));
	prokatavoliCreditSlider.addEventListener('input', e => prokatavoliCreditSliderOnChange(e.target.value));
	doseisCreditSelect.addEventListener('change', e => doseisCreditSelectOnChange(e.target.value));

	outputCreditProkatavoli.addEventListener('change', function () {
		if (+this.value > +prokatavoliCreditSlider.max) this.value = prokatavoliCreditSlider.max;
		if (+this.value < +prokatavoliCreditSlider.min) this.value = prokatavoliCreditSlider.min;
		if (+this.value) this.value = Math.round(+this.value);
		prokatavoliCreditSliderOnChange(this.value);
	});

	outputCreditNoVehicle.addEventListener('change', function () {
		if (+this.value > +noVehicleCreditSlider.max) this.value = noVehicleCreditSlider.max;
		if (+this.value < +noVehicleCreditSlider.min) this.value = noVehicleCreditSlider.min;
		if (+this.value) this.value = Math.round(+this.value);
		noVehicleCreditSliderOnChange(this.value);
	});

	creditProkatavoliMinus.addEventListener('click', () =>
		prokatavoliCreditSliderOnChange(parseInt(prokatavoliCreditSlider.value) - parseInt(prokatavoliCreditSlider.step))
	);
	creditProkatavoliPlus.addEventListener('click', () =>
		prokatavoliCreditSliderOnChange(parseInt(prokatavoliCreditSlider.value) + parseInt(prokatavoliCreditSlider.step))
	);

	creditNoVehicleMinus.addEventListener('click', () =>
		noVehicleCreditSliderOnChange(parseInt(noVehicleCreditSlider.value) - parseInt(noVehicleCreditSlider.step))
	);
	creditNoVehiclePlus.addEventListener('click', () =>
		noVehicleCreditSliderOnChange(parseInt(noVehicleCreditSlider.value) + parseInt(noVehicleCreditSlider.step))
	);

	doseisCreditSelect.selectedIndex = 11;
}

function initEasyPayTabs() {
	document.querySelectorAll('.easy-pay-tab').forEach(el =>
		el.addEventListener('click', e => {
			if (document.querySelector('.easy-pay-with-vehicle-container').style.display === 'none') {
				if (e.target.classList.contains('no-credit-tab')) {
					selectedEasyPaySystemPrice = +noVehicleNoCreditSlider.value;
				} else {
					selectedEasyPaySystemPrice = +noVehicleCreditSlider.value;
				}
				console.log(e.target, selectedEasyPaySystemPrice);
			}
		})
	);
}

function initEasyPaySystemSelection() {
	document.querySelectorAll('.easy-pay-suggested-system-div').forEach(el =>
		el.addEventListener('click', e => {
			const selectedSystemDiv = e.target.closest('.easy-pay-suggested-system-div');
			changePriceFontWeight(selectedSystemDiv);

			const priceText = selectedSystemDiv.querySelector('.system-price-credit').textContent;

			const oldSelectedEasyPaySystemPrice = selectedEasyPaySystemPrice;
			selectedEasyPaySystemPrice = parseFloat(priceText.replace('€', ''));
			if (oldSelectedEasyPaySystemPrice === selectedEasyPaySystemPrice) return;
			console.log('new selected price = ', selectedEasyPaySystemPrice);

			prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.value);
			prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.value);
		})
	);
}

function changePriceFontWeight(selectedSystemDiv) {
	if (selectedSystemDiv.classList.contains('system-1st-selection')) {
		console.log('contains -> bold 1st', [...document.querySelectorAll('.system-1st-selection .system-price-credit')]);
		[...document.querySelectorAll('.system-1st-selection .system-price-credit')].map(el => (el.style.fontWeight = 'bold'));
		[...document.querySelectorAll('.system-2nd-selection .system-price-credit')].map(el => (el.style.fontWeight = 'normal'));
	} else {
		console.log('contains -> bold 1st', [...document.querySelectorAll('.system-1st-selection .system-price-credit')]);
		[...document.querySelectorAll('.system-1st-selection .system-price-credit')].map(el => (el.style.fontWeight = 'normal'));
		[...document.querySelectorAll('.system-2nd-selection .system-price-credit')].map(el => (el.style.fontWeight = 'bold'));
	}
}

function prokatavoliNoCreditSliderOnChange(value) {
	const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;
	prokatavoliNoCreditSlider.max = floorPrice - 500;
	maxProkatavoliNoCreditSliderText.textContent = floorPrice - 500 + '€';

	prokatavoliNoCreditSlider.value = value;
	outputNoCreditProkatavoli.value = prokatavoliNoCreditSlider.value;
	prokatavoliNoCreditCover.style.width = calcCoverWidth(prokatavoliNoCreditSlider) + '%';
	prokatavoliNoCreditChangeMinMaxLabelsWeight();
	noCreditEnapomeinanPoso.textContent = (selectedEasyPaySystemPrice - parseInt(prokatavoliNoCreditSlider.value)).toFixed(1);
	configureNoCreditMaxDoseisSlider();
}

function prokatavoliCreditSliderOnChange(value) {
	const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;
	prokatavoliCreditSlider.max = floorPrice;
	maxProkatavoliCreditSliderText.textContent = floorPrice + '€';

	prokatavoliCreditSlider.value = value;
	outputCreditProkatavoli.value = prokatavoliCreditSlider.value;
	prokatavoliCreditCover.style.width = calcCoverWidth(prokatavoliCreditSlider) + '%';
	prokatavoliCreditChangeMinMaxLabelsWeight();
	creditEnapomeinanPoso.textContent = (selectedEasyPaySystemPrice - parseInt(prokatavoliCreditSlider.value)).toFixed(1);
	doseisCreditSelectOnChange(+doseisCreditSelect.value);
}

function doseisNoCreditSliderOnChange(value) {
	doseisNoCreditSlider.value = value;
	outputNoCreditDoseis.value = doseisNoCreditSlider.value;
	doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
	doseisChangeMinMaxLabelsWeight();
	configureNoCreditResults();
}

function doseisCreditSelectOnChange(value) {
	configureCreditResults();
}

function noVehicleNoCreditSliderOnChange(value) {
	noVehicleNoCreditSlider.value = value;
	outputNoCreditNoVehicle.value = noVehicleNoCreditSlider.value;
	noVehicleNoCreditCover.style.width = calcCoverWidth(noVehicleNoCreditSlider) + '%';
	noVehicleNoCreditChangeMinMaxLabelsWeight();

	selectedEasyPaySystemPrice = +noVehicleNoCreditSlider.value;
	prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.value);
	// prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.value);
}

function noVehicleCreditSliderOnChange(value) {
	noVehicleCreditSlider.value = value;
	outputCreditNoVehicle.value = noVehicleCreditSlider.value;
	noVehicleCreditCover.style.width = calcCoverWidth(noVehicleCreditSlider) + '%';
	noVehicleCreditChangeMinMaxLabelsWeight();

	selectedEasyPaySystemPrice = +noVehicleCreditSlider.value;
	prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.value);
	// prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.value);
}

function prokatavoliNoCreditChangeMinMaxLabelsWeight() {
	maxProkatavoliNoCreditSliderText.style.fontWeight = prokatavoliNoCreditSlider.value === prokatavoliNoCreditSlider.max ? 'bold' : 'normal';
	minProkatavoliNoCreditSliderText.style.fontWeight = prokatavoliNoCreditSlider.value === prokatavoliNoCreditSlider.min ? 'bold' : 'normal';
}
function prokatavoliCreditChangeMinMaxLabelsWeight() {
	maxProkatavoliCreditSliderText.style.fontWeight = prokatavoliCreditSlider.value === prokatavoliCreditSlider.max ? 'bold' : 'normal';
	minProkatavoliCreditSliderText.style.fontWeight = prokatavoliCreditSlider.value === prokatavoliCreditSlider.min ? 'bold' : 'normal';
}
function doseisChangeMinMaxLabelsWeight() {
	maxDoseisNoCreditSliderText.style.fontWeight = doseisNoCreditSlider.value === doseisNoCreditSlider.max ? 'bold' : 'normal';
	minDoseisNoCreditSliderText.style.fontWeight = doseisNoCreditSlider.value === doseisNoCreditSlider.min ? 'bold' : 'normal';
}
function noVehicleNoCreditChangeMinMaxLabelsWeight() {
	maxNoVehicleNoCreditSliderText.style.fontWeight = noVehicleNoCreditSlider.value === noVehicleNoCreditSlider.max ? 'bold' : 'normal';
	minNoVehicleNoCreditSliderText.style.fontWeight = noVehicleNoCreditSlider.value === noVehicleNoCreditSlider.min ? 'bold' : 'normal';
}
function noVehicleCreditChangeMinMaxLabelsWeight() {
	maxNoVehicleCreditSliderText.style.fontWeight = noVehicleCreditSlider.value === noVehicleCreditSlider.max ? 'bold' : 'normal';
	minNoVehicleCreditSliderText.style.fontWeight = noVehicleCreditSlider.value === noVehicleCreditSlider.min ? 'bold' : 'normal';
}

minProkatavoliNoCreditSliderText.addEventListener('click', e => prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.min));
maxProkatavoliNoCreditSliderText.addEventListener('click', e => prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.max));
minProkatavoliCreditSliderText.addEventListener('click', e => prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.min));
maxProkatavoliCreditSliderText.addEventListener('click', e => prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.max));

minDoseisNoCreditSliderText.addEventListener('click', e => doseisNoCreditSliderOnChange(doseisNoCreditSlider.min));
maxDoseisNoCreditSliderText.addEventListener('click', e => doseisNoCreditSliderOnChange(doseisNoCreditSlider.max));

minNoVehicleNoCreditSliderText.addEventListener('click', e => noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.min));
maxNoVehicleNoCreditSliderText.addEventListener('click', e => noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.max));
minNoVehicleCreditSliderText.addEventListener('click', e => noVehicleCreditSliderOnChange(noVehicleCreditSlider.min));
maxNoVehicleCreditSliderText.addEventListener('click', e => noVehicleCreditSliderOnChange(noVehicleCreditSlider.max));

function resetEasyPay() {
	[...document.querySelectorAll('.easy-pay-vehicle-container')].map(el => (el.style.display = 'none'));
	[...document.querySelectorAll('.easy-pay-with-vehicle-container')].map(el => (el.style.display = 'none'));
	[...document.querySelectorAll('.easy-pay-no-vehicle-container')].map(el => (el.style.display = 'flex'));
	[...document.querySelectorAll('.easy-pay-no-vehicle-descr')].map(el => (el.style.display = 'flex'));

	selectedEasyPaySystemPrice = +noVehicleNoCreditSlider.value;
	noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.value);
	noVehicleCreditSliderOnChange(noVehicleCreditSlider.value);
}

/* STORAGE */
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
	resetEasyPay();
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
	resetEasyPay();
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
	resetEasyPay();
	calcResult();

	// userSelections.vehicleF = { make: userSelections.vehicle.make, year: userSelections.vehicle.year, model: value };
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
		resetEasyPay();
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
	if (suggestedContainer && !suggestedContainer.classList.contains('not-convertible-container')) {
		displayEmulatorInfo(suggestedContainer);
		suggestedContainer.querySelectorAll('.suggested-overlay-block').forEach(el => (el.style.height = '0px'));

		document.querySelector('#vehicle').style.paddingBottom = '5%';
		configureCalculatorAfterSuggestion();
		configureEasyPayAfterSuggestion();
		//document.querySelector('#vehicleForm').scrollIntoView({ behavior: 'smooth' });
	} else {
		resetCalc();
		resetEasyPay();
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
		document.querySelector('.not-convertible-container').style.display = 'grid';
		// suggestedContainers.forEach(container => {
		// 	container.style.display = 'none';
		// });
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
		cobdDiv.querySelector('.left-overlay-description').textContent = '4x2 = 8cyl έως 180HP';
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
		const vehicleEmulatorType = getEmulatorType();

		suggestedContainer.querySelectorAll('.suggested-lpg-system').forEach(lpgSystem => {
			lpgSystem.querySelectorAll('.info-content-block').forEach(emCont => {
				if (emCont.classList.contains(`emulator-${vehicleEmulatorType}`)) {
					if (
						vehicleEmulatorType === 'p' ||
						vehicleEmulatorType === 'b6' ||
						vehicleEmulatorType === 'b8' ||
						vehicleEmulatorType === 'hp' ||
						vehicleEmulatorType === 'double-hp'
					) {
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

function getEmulatorType() {
	if (hasUHPII(foundVehicleObj)) {
		return foundVehicleObj.hp > 360 ? 'double-hp' : 'hp';
	}
	return foundVehicleObj.emulators[0].toLowerCase();
}

function configureCalculatorAfterSuggestion() {
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

	document.querySelector('#vehicle').style.paddingBottom = '9%';
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
	const hp = foundVehicleObj.hasOwnProperty('hp') ? foundVehicleObj.hp : Number(foundVehicleObj.engineCodes[0].split(' ')[0]);
	return hp <= 180 ? ' έως 180HP' : foundVehicleObj <= 360 ? ' έως 360HP' : ' άνω των 360HP';
}

function configureEasyPayAfterSuggestion() {
	configureModelEasyPay();
	configureSystemsEasyPay();
	configureNoCreditSliders();
	configureCreditSliders();
	configureNoCreditResults();
	configureCreditResults();
}

function configureModelEasyPay() {
	const makeImgSrc = document.querySelector('#makeImg').src;
	const modelNameText = document.querySelector('#modelName').textContent;
	document.querySelector('#makeImgNoCredit').src = makeImgSrc;
	document.querySelector('#makeImgCredit').src = makeImgSrc;
	document.querySelector('#modelNameNoCredit').textContent = modelNameText;
	document.querySelector('#modelNameCredit').textContent = modelNameText;

	[...document.querySelectorAll('.easy-pay-vehicle-container')].map(el => (el.style.display = 'flex'));
	[...document.querySelectorAll('.easy-pay-with-vehicle-container')].map(el => (el.style.display = 'flex'));
	[...document.querySelectorAll('.easy-pay-no-vehicle-container')].map(el => (el.style.display = 'none'));
	[...document.querySelectorAll('.easy-pay-no-vehicle-descr')].map(el => (el.style.display = 'none'));
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
	selectedEasyPaySystemPrice = +document.querySelector('.system-price-credit').textContent.replace('€', '');
	console.log({ selectedEasyPaySystemPrice });
}

function configureNoCreditSliders() {
	const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;

	prokatavoliNoCreditSlider.max = floorPrice - 500;
	maxProkatavoliNoCreditSliderText.textContent = floorPrice - 500 + '€';

	prokatavoliNoCreditCover.style.width = calcCoverWidth(prokatavoliNoCreditSlider) + '%';
	doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
	outputNoCreditProkatavoli.value = prokatavoliNoCreditSlider.value;
	outputNoCreditDoseis.value = doseisNoCreditSlider.value;

	noCreditEnapomeinanPoso.textContent = (selectedEasyPaySystemPrice - parseInt(prokatavoliNoCreditSlider.value)).toFixed(1);

	configureNoCreditMaxDoseisSlider();
}

function configureCreditSliders() {
	const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;
	prokatavoliCreditSlider.max = floorPrice;
	maxProkatavoliCreditSliderText.textContent = floorPrice + '€';

	prokatavoliCreditCover.style.width = calcCoverWidth(prokatavoliCreditSlider) + '%';
	outputCreditProkatavoli.value = prokatavoliCreditSlider.value;

	creditEnapomeinanPoso.textContent = (selectedEasyPaySystemPrice - parseInt(prokatavoliCreditSlider.value)).toFixed(1);
}

function configureNoCreditMaxDoseisSlider() {
	const noCreditEnapomeinanPosoFloat = parseFloat(noCreditEnapomeinanPoso.textContent);
	let monthlyCost,
		doseisNum = 6;

	do {
		monthlyCost = -PMT(noCreditInterest / 100 / 12, doseisNum, noCreditEnapomeinanPosoFloat);
		doseisNum++;
	} while (monthlyCost > 30);

	let maxDoseis = doseisNum - 2;
	if (maxDoseis > 36) maxDoseis = 36;
	doseisNoCreditSlider.max = maxDoseis;
	maxDoseisNoCreditSliderText.textContent = maxDoseis + ' μήνες';
	if (parseInt(doseisNoCreditSlider.value) >= maxDoseis) doseisNoCreditSliderOnChange(maxDoseis);
	else doseisNoCreditSliderOnChange(doseisNoCreditSlider.value);
}

function configureNoCreditResults() {
	const doseisNoCreditSliderValueInt = +doseisNoCreditSlider.value;
	const prokatavoliNoCreditSliderValueInt = +prokatavoliNoCreditSlider.value;

	const monthlyCost = -PMT(noCreditInterest / 100 / 12, doseisNoCreditSliderValueInt, +noCreditEnapomeinanPoso.textContent);
	noCreditMonthlyCost.textContent = monthlyCost.toFixed(2) + '€';

	//DEBUG LPG RESULT OR CNG RESULT
	let monthlyGain = parseFloat(lpgResult.textContent.replace('€', ''));
	if (!perMonthCheckbox.checked) {
		//DEBUG (&& selectedGas === LPG)
		monthlyGain /= 12;
	}
	noCreditMonthlyGain.textContent = monthlyGain.toFixed(2) + '€';

	noCreditFinalCost.textContent = (monthlyCost * doseisNoCreditSliderValueInt + prokatavoliNoCreditSliderValueInt).toFixed(2) + '€';
}

function configureCreditResults() {
	const doseisCreditSelectValueInt = +doseisCreditSelect.value;
	const prokatavoliCreditSliderValueInt = +prokatavoliCreditSlider.value;

	const monthlyCost = getCreditMonthlyCost(+creditEnapomeinanPoso.textContent, doseisCreditSelectValueInt);
	creditMonthlyCost.textContent = monthlyCost.toFixed(2) + '€';

	console.log({ monthlyCost }, { doseisCreditSelectValueInt }, { prokatavoliCreditSliderValueInt });

	//DEBUG LPG RESULT OR CNG RESULT
	let monthlyGain = parseFloat(lpgResult.textContent.replace('€', ''));
	if (!perMonthCheckbox.checked) {
		//DEBUG (&& selectedGas === LPG)
		monthlyGain /= 12;
	}
	creditMonthlyGain.textContent = monthlyGain.toFixed(2) + '€';

	console.log('final cost ', monthlyCost * doseisCreditSelectValueInt + prokatavoliCreditSliderValueInt);
	creditFinalCost.textContent = (Math.round((monthlyCost * doseisCreditSelectValueInt + prokatavoliCreditSliderValueInt) * 10) / 10).toFixed(2) + '€';
}

function PMT(interestPerMonth, doseis, cost) {
	let pmt, pvif;

	if (interestPerMonth === 0) return -cost / doseis;

	pvif = Math.pow(1 + interestPerMonth, doseis);
	pmt = (-interestPerMonth * (cost * pvif)) / (pvif - 1);

	return pmt;
}

function getCreditMonthlyCost(poso, doseis) {
	if (doseis <= 6) {
		return Math.round((poso / doseis) * 100) / 100;
	}

	let posoEksoflisis = (poso / doseis) * 0.982 * ((1 - 1 / Math.pow(1 + creditInterest / 100 / 12, doseis)) / (creditInterest / 100 / 12));
	posoEksoflisis = Math.round(posoEksoflisis * 100) / 100;
	console.log(posoEksoflisis);
	let posostoKostous = (poso - posoEksoflisis) / poso;
	posostoKostous = Math.round(posostoKostous * 10000) / 10000;
	let syntelesthsVAT = (VAT - 1) / VAT;
	let syntelesthsEpibarinshs = (1 - syntelesthsVAT) / (1 - syntelesthsVAT - posostoKostous);
	syntelesthsEpibarinshs = Math.round(syntelesthsEpibarinshs * 10000) / 10000;
	let telikhTimh = syntelesthsEpibarinshs * poso;
	telikhTimh = Math.round(telikhTimh * 100) / 100;
	let monthlyCost = telikhTimh / doseis;
	monthlyCost = Math.round(monthlyCost * 100) / 100;
	return monthlyCost;
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
	});
	outputs[i].addEventListener('input', function () {
		slider.value = this.value;
		calcCovers[i].style.width = calcCoverWidth(slider) + '%';
		calcResult();
	});
});

perMonthCheckbox.addEventListener('change', function () {
	calcResult();
});

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
	creditMonthlyGain.textContent = noCreditMonthlyGain.textContent;
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
