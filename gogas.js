// /* System Identification */
// const urlYears = 'https://lovatohellas.herokuapp.com/vehicleDB/get/years';
// const urlModels = 'https://lovatohellas.herokuapp.com/vehicleDB/get/models';
// const urlDescriptions = 'https://lovatohellas.herokuapp.com/vehicleDB/get/descriptions';
// const urlFuelPrices = 'https://lovatohellas.herokuapp.com/fuelPrices';
// const downloadPdfUrl = 'https://lovatohellas.herokuapp.com/pdf';

// const makeSelect = document.querySelector('#makeSelect');
// const modelSelect = document.querySelector('#modelSelect');
// const yearSelect = document.querySelector('#yearSelect');
// const descriptionSelect = document.querySelector('#descriptionSelect');

// makeSelect.addEventListener('change', function () {
// 	console.log('make changed', this.value);

// 	modelSelect.disabled = true;
// 	descriptionSelect.disabled = true;
// 	modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
// 	descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
// 	suggestedContainers.forEach(container => {
// 		container.style.display = 'none';
// 	});
// 	resetCalc();
// 	resetEasyPay();
// 	calcResult();
// 	updateBasketSection({ resetNoVehicle: true });

// 	userSelections.vehicle = {};
// 	delete userSelections.calculator.driveOftenIndex;
// 	userSelections.easyPay = {};
// 	saveUserSelections();

// 	if (!this.value) {
// 		yearSelect.disabled = true;
// 		yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
// 		// sessionStorage.clear(); //reset //DO YOU WANT TO ERASE EVERYTHING? maybe there is an autonomous var you want to keep
// 		return;
// 	}
// 	yearSelect.disabled = false;
// 	yearSelect.innerHTML = '';
// 	startLoadingSelect(yearSelect);

// 	let status;
// 	fetch(urlYears, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({ make: this.value })
// 	})
// 		.then(response => {
// 			status = response.status;
// 			return response.json();
// 		})
// 		.then(data => {
// 			if (status !== 200) {
// 				endLoadingSelect(yearSelect);
// 				yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
// 				return;
// 			}
// 			fetchedYears = data;
// 			// sessionStorage.clear(); //reset every time make changes
// 			// sessionStorage.fetchedYears = JSON.stringify(fetchedYears);

// 			populateYearSelect(fetchedYears);
// 			endLoadingSelect(yearSelect);
// 		})
// 		.catch(error => {
// 			endLoadingSelect(yearSelect);
// 			yearSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
// 			console.error('Error Fetch:', error);
// 		});
// });

// function startLoadingSelect(select) {
// 	select.classList.add('loading-select');
// }
// function endLoadingSelect(select) {
// 	select.classList.remove('loading-select');
// }

// function populateModelSelect(fetchedModels) {
// 	let modelOptionsArray = ['<option value="">Επιλέξτε Μοντέλο</option>'];
// 	fetchedModels.forEach(model => {
// 		modelOptionsArray.push(`<option value="${model}">${model}</option>`);
// 	});

// 	modelSelect.innerHTML = modelOptionsArray.join('');
// 	modelSelect.disabled = false;
// 	modelSelect.focus();

// 	if (modelOptionsArray.length === 2) {
// 		modelSelect.selectedIndex = 1;
// 		modelOnChange(modelSelect.value);
// 		return;
// 	}
// }

// yearSelect.addEventListener('change', e => yearOnChange(e.target.value));
// function yearOnChange(value) {
// 	descriptionSelect.disabled = true;
// 	descriptionSelect.innerHTML = '<option>Περιγραφή</option>';
// 	suggestedContainers.forEach(container => {
// 		container.style.display = 'none';
// 	});
// 	resetCalc();
// 	resetEasyPay();
// 	calcResult();
// 	updateBasketSection({ resetNoVehicle: true });

// 	userSelections.vehicle = {};
// 	delete userSelections.calculator.driveOftenIndex;
// 	userSelections.easyPay = {};
// 	saveUserSelections();

// 	if (!value) {
// 		modelSelect.disabled = true;
// 		modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
// 		descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
// 		return;
// 	}
// 	// selectedModel = fetchedModels.models.filter(model => model.name === this.value)[0];
// 	// console.log('selectedModel', selectedModel);
// 	// sessionStorage.selectedModel = JSON.stringify(selectedModel);
// 	modelSelect.disabled = false;
// 	modelSelect.innerHTML = '';
// 	startLoadingSelect(modelSelect);
// 	let status;
// 	fetch(urlModels, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({ make: makeSelect.value, year: value })
// 	})
// 		.then(response => {
// 			status = response.status;
// 			return response.json();
// 		})
// 		.then(data => {
// 			console.log('Success Vehicles Fetch:', data);
// 			if (status !== 200) {
// 				endLoadingSelect(modelSelect);
// 				yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
// 				return;
// 			}
// 			fetchedModels = data;

// 			// sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

// 			// descriptionSelect.innerHTML = `<option value="">${
// 			//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
// 			// }</option>`;
// 			populateModelSelect(fetchedModels);
// 			endLoadingSelect(modelSelect);
// 		})
// 		.catch(error => {
// 			endLoadingSelect(modelSelect);
// 			yearSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
// 			console.error('Error Fetch:', error);
// 		});
// }

// function populateYearSelect(fetchedYears) {
// 	let yearOptionsArray = ['<option value="">Επιλέξτε Χρονολογία</option>'];

// 	fetchedYears.forEach(year => {
// 		yearOptionsArray.push(`<option value="${year}">${year}</option>`);
// 	});

// 	yearSelect.innerHTML = yearOptionsArray.join('');
// 	yearSelect.disabled = false;
// 	yearSelect.focus();
// 	//One option -> auto populate
// 	if (yearOptionsArray.length === 2) {
// 		yearSelect.selectedIndex = 1;
// 		yearOnChange(yearSelect.value);
// 		return;
// 	}
// }

// modelSelect.addEventListener('change', e => modelOnChange(e.target.value));

// function modelOnChange(value) {
// 	console.log('model changed', value);
// 	suggestedContainers.forEach(container => {
// 		container.style.display = 'none';
// 	});
// 	resetCalc();
// 	resetEasyPay();
// 	calcResult();
// 	updateBasketSection({ resetNoVehicle: true });

// 	userSelections.vehicle = {};
// 	delete userSelections.calculator.driveOftenIndex;
// 	userSelections.easyPay = {};
// 	saveUserSelections();

// 	if (!value) {
// 		descriptionSelect.disabled = true;
// 		descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
// 		return;
// 	}
// 	// sessionStorage.selectedYear = value;

// 	descriptionSelect.disabled = false;
// 	descriptionSelect.innerHTML = '';
// 	startLoadingSelect(descriptionSelect);
// 	let status;
// 	fetch(urlDescriptions, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({ make: makeSelect.value, year: yearSelect.value, model: value })
// 	})
// 		.then(response => {
// 			status = response.status;
// 			return response.json();
// 		})
// 		.then(data => {
// 			console.log('Success Descriptions Fetch:', data);
// 			if (status !== 200) {
// 				endLoadingSelect(modelSelect);
// 				descriptionSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
// 				return;
// 			}
// 			fetchedModelObj = data;

// 			// sessionStorage.selectedVehicles = JSON.stringify(selectedVehicles);

// 			// descriptionSelect.innerHTML = `<option value="">${
// 			//   selectedVehicles.isDirect ? 'Κινητήρας' : 'Κύλινδροι'
// 			// }</option>`;
// 			populateDescriptionSelect(fetchedModelObj);
// 			endLoadingSelect(descriptionSelect);
// 		})
// 		.catch(error => {
// 			endLoadingSelect(descriptionSelect);
// 			descriptionSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
// 			console.error('Error Fetch:', error);
// 		});
// }
console.log('gogas page!');
