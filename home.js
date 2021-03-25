/* System Identification */
const urlMake = 'https://lovatohellas.herokuapp.com/vehicleDB/make';
const urlModel = 'https://lovatohellas.herokuapp.com/vehicleDB/model';

let vehicleData;
let selectedModel;

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const cylinderSelect = document.querySelector('#cylinderSelect');
const suggestedDivs = document.querySelectorAll('.suggested-system-div');
const suggestedContainer = document.querySelector('.suggested-container');
let suggestedSystems;

document.addEventListener('DOMContentLoaded', () => {
  initSelects();

  if (typeof Storage !== 'undefined' && sessionStorage.vehicleData) {
    vehicleData = JSON.parse(sessionStorage.vehicleData);
    console.log('Parsed json local storage', vehicleData);
    selectMakeOption();
    populateModelSelect();
    if (sessionStorage.selectedModel) {
      selectModelOption(); //from storage
      populateYearSelect();
      if (sessionStorage.selectedYear) {
        selectYearOption(); //from storage
        populateCylinderSelect();
        if (sessionStorage.selectedCylinder) {
          selectCylinderOption(); //from storage
          showResults();
        }
      }
    }
  }
  suggestedDivs.forEach(suggestedDiv => {
    suggestedDiv.querySelector('.suggested-btn').addEventListener('click', e => {
      const selectedSystem = suggestedDiv.querySelector('.suggested-name').textContent;
      sessionStorage.selectedSystem = selectedSystem;
    });
  });
});

function initSelects() {
  modelSelect.disabled = true;
  modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
  yearSelect.disabled = true;
  yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
  cylinderSelect.disabled = true;
  cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
  makeSelect.focus();
}

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
    sessionStorage.clear(); //reset //DO YOU WANT TO ERASE EVERYTHING? maybe there is an autonomous var you want to keep
    return;
  }
  modelSelect.disabled = false;
  modelSelect.innerHTML = '';
  startLoadingModelSelect();

  fetch(urlMake, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ make: this.value })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success Fetch Response Data:', data);
      if (data.msg === 'no vehicles') return;
      vehicleData = data;

      sessionStorage.clear(); //reset every time make changes
      sessionStorage.vehicleData = JSON.stringify(vehicleData);

      populateModelSelect();
      endLoadingModelSelect();
    })
    .catch(error => {
      endLoadingModelSelect();
      modelSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Error Fetch:', error);
    });
});

function startLoadingModelSelect() {
  modelSelect.classList.add('loading-model-select');
}
function endLoadingModelSelect() {
  modelSelect.classList.remove('loading-model-select');
}

function populateModelSelect() {
  let modelOptionsStr = '<option value="">Επιλέξτε Μοντέλο</option>';
  // vehicleData.models.forEach(model => {
  //   modelOptionsStr += `<option value="${model.name}">${model.name}</option>`;
  // });
  vehicleData.forEach(model => {
    modelOptionsStr += `<option value="${model.name}">${model.name}</option>`;
  });
  modelSelect.innerHTML = modelOptionsStr;
  modelSelect.disabled = false;
  modelSelect.focus();
}

modelSelect.addEventListener('change', function () {
  console.log('model changed', this.value);
  cylinderSelect.disabled = true;
  cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
  suggestedContainer.style.display = 'none';
  sessionStorage.removeItem('selectedYear');
  sessionStorage.removeItem('selectedCylinder');
  sessionStorage.removeItem('suggestedSystems');
  sessionStorage.removeItem('selectedSystem');

  if (!this.value) {
    yearSelect.disabled = true;
    yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
    sessionStorage.removeItem('selectedModel');
    return;
  }
  selectedModel = vehicleData.models.filter(model => model.name === this.value)[0];
  console.log('selectedModel', selectedModel);
  sessionStorage.selectedModel = JSON.stringify(selectedModel);

  populateYearSelect();
});

function populateYearSelect() {
  let yearOptionsStr = '<option value="">Επιλέξτε Χρονολογία</option>';

  const [fromYear, toYear] = selectedModel.years;
  for (let year = fromYear; year <= toYear; year++) {
    yearOptionsStr += `<option value="${year}">${year}</option>`;
  }
  yearSelect.innerHTML = yearOptionsStr;
  yearSelect.disabled = false;
  yearSelect.focus();
}

yearSelect.addEventListener('change', function () {
  console.log('year changed', this.value);
  suggestedContainer.style.display = 'none';
  sessionStorage.removeItem('selectedCylinder');
  sessionStorage.removeItem('suggestedSystems');
  sessionStorage.removeItem('selectedSystem');

  if (!this.value) {
    cylinderSelect.disabled = true;
    cylinderSelect.innerHTML = '<option value="">Κύλινδροι</option>';
    sessionStorage.removeItem('selectedYear');
    return;
  }
  sessionStorage.selectedYear = this.value;
  populateCylinderSelect();
});

function populateCylinderSelect() {
  if (typeof Storage !== 'undefined' && !sessionStorage.selectedYear) return;

  let cylinderOptionsStr = '<option value="">Επιλέξτε Κυλίνδρους</option>';
  selectedModel.cylinders.forEach(cylinder => {
    cylinderOptionsStr += `<option value="${cylinder}">${cylinder}</option>`;
  });
  cylinderSelect.innerHTML = cylinderOptionsStr;
  cylinderSelect.disabled = false;
  cylinderSelect.focus();
}

cylinderSelect.addEventListener('change', function () {
  console.log('cylinder changed', this.value);

  if (!this.value) {
    suggestedContainer.style.display = 'none';
    sessionStorage.removeItem('selectedCylinder');
    sessionStorage.removeItem('suggestedSystems');
    sessionStorage.removeItem('selectedSystem');
    return;
  }
  sessionStorage.selectedCylinder = this.value;
  showResults();
});

function selectMakeOption() {
  let opts = makeSelect.options;
  for (let i = 0; i <= opts.length; i++) {
    if (vehicleData.make === opts[i].value) {
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
  let opts = cylinderSelect.options;
  for (let i = 0; i <= opts.length; i++) {
    if (selectedCylinder === opts[i].value) {
      cylinderSelect.selectedIndex = i;
      break;
    }
  }
}

function showResults() {
  let cyls = cylinderSelect.value;
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
    suggestedDiv.querySelector('.suggested-name').textContent = suggestedSystems[i];
    suggestedDiv.querySelector('.suggested-price').textContent = getSystemPrice(
      suggestedSystems[i]
    );
    suggestedDiv.querySelector('.suggested-btn').textContent = 'Γνωρίστε το ' + suggestedSystems[i];
  });

  if (suggestedSystems.length === 2) {
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
