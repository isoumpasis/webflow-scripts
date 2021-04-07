/* System Identification */
const urlMake = 'https://lovatohellas.herokuapp.com/vehicleDB/makeTest';
const urlYear = 'https://lovatohellas.herokuapp.com/vehicleDB/yearTest';

let selectedYears;
let selectedModels;
let selectedModelName;
let selectedModelObj;

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

let suggestedSystemPrices = [];
let suggestedSystemNames = [];
const FPA = 1.24;

const creditCardPrice1 = document.querySelector('#creditCardPrice1');
const creditCardPrice2 = document.querySelector('#creditCardPrice2');
const creditCardInstallments = document.querySelector('#creditCardInstallments');

document.addEventListener('DOMContentLoaded', () => {
  initSelects();

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

makeSelect.addEventListener('change', function () {
  console.log('make changed', this.value);

  modelSelect.disabled = true;
  cylinderOrEngineSelect.disabled = true;
  modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
  cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
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
  // sessionStorage.removeItem('selectedYear');
  // sessionStorage.removeItem('selectedCylinder');
  //sessionStorage.removeItem('suggestedSystems');
  //sessionStorage.removeItem('selectedSystem');

  if (!value) {
    modelSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
    cylinderOrEngineSelect.innerHTML = '<option value="">Περιγραφή</option>';
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
    let engineCodes = [];
    selectedModelObj.vehicles.forEach(vehicle => {
      if (yearSelect.value >= vehicle.years[0] && yearSelect.value <= vehicle.years[1]) {
        vehicle.engineCodes.forEach(codeObj => {
          let isConvertibleStr = codeObj.isConvertible ? ' ✔️' : ' &#10060;';
          engineCodes.push(codeObj.code + isConvertibleStr);
        });
      }
    });
    engineCodes = [...new Set(engineCodes)].sort(
      (a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0])
    );
    engineCodes.forEach(engineCode => {
      let engineCodeValue = engineCode.split(' ');
      engineCodeValue.pop();
      engineCodeValue = engineCodeValue.join(' ');
      optionsArray.push(`<option value="${engineCodeValue}">${engineCode}</option>`);
    });
  } else {
    optionsArray = ['<option value="">Επιλέξτε Κυλίνδρους</option>'];
    let cylinders = [];
    console.log(selectedModelObj, selectedModelObj.vehicles);
    selectedModelObj.vehicles.forEach(vehicle => {
      if (yearSelect.value >= vehicle.years[0] && yearSelect.value <= vehicle.years[1]) {
        cylinders.push(vehicle.cylinders);
      }
    });
    cylinders = [...new Set(cylinders)].sort();
    cylinders.forEach(cylinder => {
      optionsArray.push(`<option value="${cylinder}">${cylinder}cyl</option>`);
    });
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
    console.log('show results is direct!');
    showDirectResults();
  } else {
    let cyls = cylinderOrEngineSelect.value;
    showCylinderResults(years, cyls);
  }

  configureEasyPay();

  // sessionStorage.suggestedSystems = JSON.stringify(suggestedSystems);
}

function showDirectResults() {
  const selectedEngineCode = cylinderOrEngineSelect.value;
  let foundEngineCodeObj;
  label: for (let veh of selectedModelObj.vehicles) {
    for (let engineCode of veh.engineCodes) {
      if (engineCode.code === selectedEngineCode) {
        foundEngineCodeObj = engineCode;
        break label;
      }
    }
  }
  console.log(foundEngineCodeObj);
  if (foundEngineCodeObj.isConvertible) {
    const directSystemDiv = document.querySelector(
      `#suggested-${systemQueryDict[foundEngineCodeObj.system]}`
    );
    directSystemDiv.style.display = 'grid';
  } else {
    suggestedContainers.forEach(container => {
      container.style.display = 'none';
    });
  }
}

function showCylinderResults(years, cyls) {
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

function configureEasyPay() {
  for (let container of suggestedContainers) {
    if (container.style.display !== 'none') {
      container.querySelectorAll('.suggested-price').forEach(priceEl => {
        let price = parseInt(priceEl.textContent.split(' ')[0].replace('€', ''));
        price *= FPA;
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
  setCreditCardCosts();
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
function setCreditCardCosts() {
  creditCardInstallmentsOnChange(creditCardInstallments.value);
}

creditCardInstallments.addEventListener('change', e =>
  creditCardInstallmentsOnChange(e.target.value)
);

function creditCardInstallmentsOnChange(value) {
  console.log({ suggestedSystemPrices });
  console.log(creditCardPrice1.checked);
  let cost = creditCardPrice1.previousElementSibling.checked
    ? suggestedSystemPrices[0]
    : suggestedSystemPrices[1];

  let installments = +value;
  console.log({ installments });
  console.log({ cost });

  document.querySelector('#creditCardFinalCost').textContent = `${cost}€`;
  document.querySelector('#creditCardPerMonth').textContent = `${(cost / installments).toFixed(
    2
  )}€`;

  let lpgPerMonthCost = parseFloat(lpgResult.textContent.replace('€', ''));
  if (perYearCheckbox.checked) lpgPerMonthCost /= 12;

  document.querySelector('#creditCardBenefit').textContent = `${(
    lpgPerMonthCost -
    cost / installments
  ).toFixed(2)}€`;
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
