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

let fetchedLitres, fetchedDimensions, foundTankObj, activeContainer;

const typeContainerIdDict = {
	ΕΣΩΤΕΡΙΚΗ: 'eswterikhContainer',
	ΕΞΩΤΕΡΙΚΗ: 'ekswterikhContainer',
	ΚΥΛΙΝΔΡΙΚΗ: 'kylindrikhContainer'
};

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
	litresSelect.innerHTML = '<option value="">Λίτρα</option>';
	dimensionSelect.innerHTML = '<option value="">Διαστάσεις</option>';
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
			console.log('Litres Fetch:', data);
			fetchedLitres = data;

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
	litresOptionsArray.push('<option value="allDimensions">Όλες οι διαστάσεις</option>');
	fetchedLitres.forEach(litre => {
		litresOptionsArray.push(`<option value="${litre}">${litre} LT</option>`);
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
	dimensionSelect.innerHTML = '<option>Διαστάσεις</option>';
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
			if (status !== 200) {
				endLoadingSelect(dimensionSelect);
				litresSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
				return;
			}
			console.log('Dimensions Fetch:', data);
			fetchedDimensions = data;
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
	let dimensionOptionsArray = ['<option value="">Επιλέξτε Διαστάσεις</option>'];
	fetchedDimensions.forEach(dimension => {
		const typeLabel = typeSelect.value === 'unknown' ? ` ${dimension.type} ` : '';
		const dimensionLabel = `${dimension.diameter}/${dimension.length}${typeLabel} - ${litresSelect.value} LT`;
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
	if (value !== 0 && !value) return;

	showResults();
}

function showResults() {
	foundTankObj = fetchedDimensions.find(dim => +dimensionSelect.value == dim.id);
	console.log({ foundTankObj });

	// const typeOfFoundObj = typeSelect.value === 'unknown' ? foundTankObj.type : typeSelect.value;
	activeContainer = document.getElementById(typeContainerIdDict[foundTankObj.type]);
	renderResultContainer(activeContainer);
}

function renderResultContainer(container) {
	container.querySelector('.litres-result').textContent = foundTankObj.litres + ' LT';
	container.querySelector('.diameter-result').textContent = foundTankObj.diameter / 10;
	container.querySelector('.length-result').textContent = foundTankObj.length / 10;
	container.querySelector('.price-result').textContent = foundTankObj.price + '€';

	container.style.display = 'grid';
}
