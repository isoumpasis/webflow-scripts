/* System Identification */
const baseUrl = 'https://lovatohellas.herokuapp.com/gogasDB/get';
const urlLitres = '/litres';
const urlDimensions = '/dimensions';

const typeSelect = document.querySelector('#typeSelect');
const litresSelect = document.querySelector('#litresSelect');
const dimensionSelect = document.querySelector('#dimensionSelect');
const locationSelect = document.querySelector('#locationSelect');
locationSelect.style.display = 'none';

const suggestedContainers = document.querySelectorAll('.suggested-tank-container');

let fetchedLitres, fetchedDimensions, foundTankObj;

function startLoadingSelect(select) {
	select.classList.add('loading-select');
}
function endLoadingSelect(select) {
	select.classList.remove('loading-select');
}

typeSelect.addEventListener('change', function () {
	console.log('type changed', this.value);

	litresSelect.disabled = true;
	dimensionSelect.disabled = true;
	litresSelect.innerHTML = '<option value="">Λίτρα Δεξαμενής</option>';
	dimensionSelect.innerHTML = '<option value="">Διαστάσεις Δεξαμενής</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});

	if (!this.value) return;

	litresSelect.disabled = false;
	litresSelect.innerHTML = '';
	startLoadingSelect(litresSelect);

	let status;
	fetch(baseUrl + urlLitres, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ type: this.value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			if (status !== 200) {
				endLoadingSelect(litresSelect);
				litresSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			fetchedLitres = data;
			console.log(fetchedLitres);

			populateLitresSelect(fetchedLitres);
			endLoadingSelect(litresSelect);
		})
		.catch(error => {
			endLoadingSelect(litresSelect);
			litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
});

function populateLitresSelect(fetchedLitres) {
	let litresOptionsArray = ['<option value="">Επιλέξτε Λίτρα</option>'];

	fetchedLitres.forEach(litre => {
		litresOptionsArray.push(`<option value="${litre}">${litre}LT</option>`);
	});

	litresSelect.innerHTML = litresOptionsArray.join('');
	litresSelect.disabled = false;
	litresSelect.focus();
	//One option -> auto populate
	if (litresOptionsArray.length === 2) {
		litresSelect.selectedIndex = 1;
		litresOnChange(litresSelect.value);
		return;
	}
}

litresSelect.addEventListener('change', e => litresOnChange(e.target.value));
function litresOnChange(value) {
	console.log('liters changed', value);
	dimensionSelect.disabled = true;
	dimensionSelect.innerHTML = '<option>Διαστάσεις Δεξαμενής</option>';
	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});

	if (!value) return;

	dimensionSelect.disabled = false;
	dimensionSelect.innerHTML = '';
	startLoadingSelect(dimensionSelect);

	let status;
	fetch(baseUrl + urlDimensions, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ type: typeSelect.value, litres: value })
	})
		.then(response => {
			status = response.status;
			return response.json();
		})
		.then(data => {
			console.log('Success Vehicles Fetch:', data);
			if (status !== 200) {
				endLoadingSelect(dimensionSelect);
				litresSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			fetchedDimensions = data;
			console.log(fetchedDimensions);
			populateDimensionSelect(fetchedDimensions);
			endLoadingSelect(dimensionSelect);
		})
		.catch(error => {
			endLoadingSelect(dimensionSelect);
			litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
			console.error('Error Fetch:', error);
		});
}

function populateDimensionSelect(fetchedDimensions) {
	let dimensionOptionsArray = ['<option value="">Επιλέξτε Διάσταση</option>'];
	fetchedDimensions.forEach(dimension => {
		const dimensionLabel = `${dimension.diameter}/${dimension.length} - ${litresSelect.value}LT`;
		dimensionOptionsArray.push(`<option value="${dimension.id}">${dimensionLabel}</option>`);
	});

	dimensionSelect.innerHTML = dimensionOptionsArray.join('');
	dimensionSelect.disabled = false;
	dimensionSelect.focus();

	if (dimensionOptionsArray.length === 2) {
		dimensionSelect.selectedIndex = 1;
		dimensionOnChange(dimensionSelect.value);
		return;
	}
}

dimensionSelect.addEventListener('change', e => dimensionOnChange(e.target.value));

function dimensionOnChange(value) {
	console.log('dimension changed', value);

	suggestedContainers.forEach(container => {
		container.style.display = 'none';
	});
	if (!value) return;

	showResults();
}

function showResults() {
	foundTankObj = fetchedDimensions.find(dim => dimensionSelect.value === dim.id);
	document.querySelector('.tank-price').textContent = foundTankObj.price + '€';
	console.log({ foundTankObj });
}
