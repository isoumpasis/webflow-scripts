/* System Identification */
const baseUrl = 'https://lovatohellas.herokuapp.com/gogasDB/get';
const mapBaseUrl = 'https://lovato-hellas.webflow.io/diktyo-synergaton';
const urlLitres = '/litres';
const urlDimensions = '/dimensions';
const closestUrl = 'https://lovatohellas.herokuapp.com/map/pins/closest';
const numPlaceUrl = 'https://lovatohellas.herokuapp.com/map/pins/numPlace';
const downloadGogasSummaryUrl = 'https://lovatohellas.herokuapp.com/summaries/gogas';
// const downloadGogasSummaryUrl = 'http://localhost:1917/summaries/gogas';//

const typeSelect = document.querySelector('#typeSelect');
const litresSelect = document.querySelector('#litresSelect');
const dimensionSelect = document.querySelector('#dimensionSelect');
const locationSelect = document.querySelector('#locationSelect');

const suggestedContainers = [...document.querySelectorAll('.suggested-tank-container')];

let fetchedLitres,
  fetchedDimensions,
  fetchedPinsLength,
  fetchedClosests,
  foundTankObj,
  activeContainer;
let isLocationSelected = false;
let geolocationError = false;

const typeContainerIdDict = {
  ΕΣΩΤΕΡΙΚΗ: 'eswterikhContainer',
  ΕΞΩΤΕΡΙΚΗ: 'ekswterikhContainer',
  ΚΥΛΙΝΔΡΙΚΗ: 'kylindrikhContainer'
};

const tankImgUrlDict = {
  ΕΣΩΤΕΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f5a4ecd2e4fdcbaf601c52_internal-tank-img.jpg',
  ΕΞΩΤΕΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f69aa32026daab0635fb21_external-tank-img.jpg',
  ΚΥΛΙΝΔΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f69aa7f98ed9cb9321ed98_cylindrical-tank-img.jpg'
};

const preferredStorage = localStorage;
let gogasSelections = {};
let userInfo = { username: '', email: '', phone: '', address: '' };

/* STORAGE */
function setGogasSelections() {
  if (typeof Storage !== 'undefined')
    preferredStorage.setItem('gogasSelections', JSON.stringify(gogasSelections));
}
function getGogasSelections() {
  if (typeof Storage !== 'undefined')
    return JSON.parse(preferredStorage.getItem('gogasSelections'));
  return null;
}

function loadGogasSelections() {
  gogasSelections = getGogasSelections();
  foundTankObj = gogasSelections.results.foundTankObj;
  fetchedLitres = gogasSelections.form.fetchedValues.fetchedLitres;
  fetchedDimensions = gogasSelections.form.fetchedValues.fetchedDimensions;
  fetchedPinsLength = gogasSelections.form.fetchedValues.fetchedPinsLength;

  // First activate type selection value
  let activeIndex;
  [...typeSelect.options].forEach((option, index) => {
    if (option.value === gogasSelections.form.activeValues.type) {
      // console.log('found type active index ', index);
      activeIndex = index;
    }
  });
  typeSelect.selectedIndex = activeIndex;

  populateLitresSelect(gogasSelections.form.fetchedValues.fetchedLitres, { storageMode: true });
  populateDimensionSelect(gogasSelections.form.fetchedValues.fetchedDimensions, {
    storageMode: true
  });
  locationSelect.disabled = false;

  activateSelections();

  showResults();
  populateLocationContainerResults(fetchedPinsLength);
}

function activateSelections() {
  let activeIndex;
  [...litresSelect.options].forEach((option, index) => {
    if (option.value === gogasSelections.form.activeValues.litres) {
      activeIndex = index;
    }
  });
  litresSelect.selectedIndex = activeIndex;

  [...dimensionSelect.options].forEach((option, index) => {
    if (option.value === gogasSelections.form.activeValues.dimension) {
      activeIndex = index;
    }
  });
  dimensionSelect.selectedIndex = activeIndex;

  [...locationSelect.options].forEach((option, index) => {
    if (option.value === gogasSelections.form.activeValues.location) {
      activeIndex = index;
    }
  });
  locationSelect.selectedIndex = activeIndex;
}

document.addEventListener('DOMContentLoaded', () => {
  litresSelect.disabled = true;
  dimensionSelect.disabled = true;
  locationSelect.disabled = true;
  if (getGogasSelections()) loadGogasSelections();

  initUserInfo();
});

function initUserInfo() {
  userInfo = getUserInfo() || {};
  [...document.querySelectorAll('.user-info-username')].map(el => {
    el.value = userInfo.username || '';
    el.autocomplete = 'name';
  });
  [...document.querySelectorAll('.user-info-email')].map(el => {
    el.value = userInfo.email || '';
    el.autocomplete = 'email';
  });
  [...document.querySelectorAll('.user-info-phone')].map(el => {
    el.value = userInfo.phone || '';
    el.autocomplete = 'phone';
  });
  [...document.querySelectorAll('.user-info-address')].map(el => {
    el.value = userInfo.address || '';
    el.autocomplete = 'street-address';
  });
}
[...document.querySelectorAll('.user-info-username')].map(element =>
  element.addEventListener('input', e => {
    [...document.querySelectorAll('.user-info-username')].map(el => {
      el.value = e.target.value;
    });
    userInfo.username = e.target.value;
    saveUserInfo();
  })
);
[...document.querySelectorAll('.user-info-email')].map(element =>
  element.addEventListener('input', e => {
    [...document.querySelectorAll('.user-info-email')].map(el => {
      el.value = e.target.value;
    });
    userInfo.email = e.target.value;
    saveUserInfo();
  })
);
[...document.querySelectorAll('.user-info-phone')].map(element =>
  element.addEventListener('input', e => {
    [...document.querySelectorAll('.user-info-phone')].map(el => {
      el.value = e.target.value;
    });
    userInfo.phone = e.target.value;
    saveUserInfo();
  })
);
[...document.querySelectorAll('.user-info-address')].map(element =>
  element.addEventListener('input', e => {
    [...document.querySelectorAll('.user-info-address')].map(el => {
      el.value = e.target.value;
    });
    userInfo.address = e.target.value;
    saveUserInfo();
  })
);

function saveUserInfo() {
  if (typeof Storage !== 'undefined')
    preferredStorage.setItem('userInfo', JSON.stringify(userInfo));
}

function getUserInfo() {
  if (typeof Storage !== 'undefined') return JSON.parse(preferredStorage.getItem('userInfo'));
  return null;
}

[...document.querySelectorAll('.open-map-btn')].map(el =>
  el.addEventListener('click', () => {
    const url = `${mapBaseUrl}?gps=ΝΟΜΟΣ%20${
      locationSelect.options[locationSelect.selectedIndex].innerHTML
    }&filters=2`;
    window.open(url, '_blank');
  })
);

[...document.querySelectorAll('.enable-gps-btn')].map(el =>
  el.addEventListener('click', async () => {
    try {
      const currentLatLng = await getCurrentPosition();
      console.log('my current position', currentLatLng);
      populateClosestsPins({ lat: currentLatLng[0], lng: currentLatLng[1] });
    } catch (e) {
      console.log('error on geolocation', e);
      geolocationError = true;
      [...document.querySelectorAll('.geolocation-error')].map(el => (el.style.display = 'block'));
    }
  })
);

document.addEventListener('click', () => {
  if (geolocationError) {
    [...document.querySelectorAll('.geolocation-error')].map(el => (el.style.display = 'none'));
    geolocationError = false;
  }
});

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    let geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve([pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy]);
      },
      err => {
        console.warn(`Error on geolocation: ${err.code}: ${err.message}`);
        reject(err.message);
      },
      geolocationOptions
    );
  });
}

function startLoadingSelect(select, triggeredFrom = null) {
  if (!triggeredFrom) select.classList.add('loading-select');
  else {
    if (triggeredFrom === 'form') {
      console.log(document.querySelector('#downloadSummaryBtn'));
      document.querySelector('#downloadSummaryBtn').value = 'Ετοιμάζουμε την προσφορά σου...';
    }
  }
}
function endLoadingSelect(select, triggeredFrom = null) {
  if (!triggeredFrom) select.classList.remove('loading-select');
  else {
    if (triggeredFrom === 'form') {
      console.log(document.querySelector('#downloadSummaryBtn'));
      document.querySelector('#downloadSummaryBtn').value = 'Πάρε την προσφορά!';
    }
  }
}

function setLocationSelectHeader(label) {
  if (isLocationSelected) return;
  const temp = [...locationSelect.options].map(option => option.outerHTML);
  temp[0] = `<option value="">${label}</option>`;
  locationSelect.innerHTML = temp.join('');
}

typeSelect.addEventListener('change', function () {
  console.log('type changed', this.value);

  litresSelect.disabled = true;
  dimensionSelect.disabled = true;
  locationSelect.disabled = true;
  litresSelect.innerHTML = '<option value="">Λίτρα</option>';
  dimensionSelect.innerHTML = '<option value="">Διαστάσεις</option>';
  setLocationSelectHeader('Τοποθεσία');

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';

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

function populateLitresSelect(fetchedLitres, options = {}) {
  let litresOptionsArray = ['<option value="">Επιλέξτε Λίτρα</option>'];

  const allDimensionsTypeLabel =
    typeSelect.value !== 'unknown'
      ? ` για ${typeSelect.options[typeSelect.selectedIndex].textContent.toLowerCase()}`
      : '';
  litresOptionsArray.push(
    `<option value="allDimensions">Όλες οι διαστάσεις${allDimensionsTypeLabel}</option>`
  );

  fetchedLitres.forEach(litre => {
    litresOptionsArray.push(`<option value="${litre}">${litre} LT</option>`);
  });

  litresSelect.innerHTML = litresOptionsArray.join('');
  litresSelect.disabled = false;
  if (options.storageMode) return;

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
  locationSelect.disabled = true;
  dimensionSelect.innerHTML = '<option>Διαστάσεις</option>';
  setLocationSelectHeader('Τοποθεσία');

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';

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

function populateDimensionSelect(fetchedDimensions, options = {}) {
  let dimensionOptionsArray = ['<option value="">Επιλέξτε Διαστάσεις</option>'];
  fetchedDimensions.forEach(dimension => {
    const typeLabel = typeSelect.value === 'unknown' ? ` ${dimension.type} ` : '';
    const dimensionLabel = `${dimension.diameter}/${dimension.length}${typeLabel} - ${dimension.litres} LT`;
    dimensionOptionsArray.push(`<option value="${dimension.id}">${dimensionLabel}</option>`);
  });

  dimensionSelect.innerHTML = dimensionOptionsArray.join('');
  dimensionSelect.disabled = false;

  if (options.storageMode) return;

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
  locationSelect.disabled = true;
  setLocationSelectHeader('Τοποθεσία');

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';

  if (value !== 0 && !value) return;

  setLocationSelectHeader('Επιλέξτε Τοποθεσία');
  locationSelect.disabled = false;
  locationSelect.focus();

  if (locationSelect.value) {
    [...document.querySelectorAll('.searching-place-text-location')].map(
      el => (el.textContent = locationSelect.options[locationSelect.selectedIndex].innerHTML)
    );
    showResults();
    populateLocationContainerResults(fetchedPinsLength);
  }
}

locationSelect.addEventListener('change', e => locationOnChange(e.target.value));

function locationOnChange(value) {
  console.log('location changed', value);

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';

  if (!value) {
    isLocationSelected = false;
    return;
  }
  isLocationSelected = true;
  [...document.querySelectorAll('.searching-place-text-location')].map(
    el => (el.textContent = locationSelect.options[locationSelect.selectedIndex].innerHTML)
  );
  resetLocationContainer();

  fetch(numPlaceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ place: locationSelect.value, lovatoServices: ['gogasTanks'] })
  })
    .then(response => {
      status = response.status;
      return response.json();
    })
    .then(data => {
      if (status != 200) {
        //DEBUG
        // start loading in pins result
        // endLoadingSelect(dimensionSelect);
        // litresSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
        console.error(status);
        return;
      }
      console.log('Pins Fetch:', data);
      fetchedPinsLength = data;
      gogasSelections.form.fetchedValues.fetchedPinsLength = fetchedPinsLength;
      saveUserResults();
      populateLocationContainerResults(fetchedPinsLength);
      // endLoadingSelect(dimensionSelect);
    })
    .catch(error => {
      //endLoadingSelect(dimensionSelect);
      //litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Pins Error Fetch:', error);
    });

  showResults();
}

function showResults() {
  foundTankObj = fetchedDimensions.find(dim => +dimensionSelect.value == dim.id);
  activeContainer = document.getElementById(typeContainerIdDict[foundTankObj.type]);
  renderResultsContainer(activeContainer);
  saveUserResults();
}

function renderResultsContainer(container) {
  container.querySelector('.litres-result').textContent = foundTankObj.litres + ' LT';
  container.querySelector('.diameter-result').textContent = foundTankObj.diameter / 10;
  container.querySelector('.length-result').textContent = foundTankObj.length / 10;
  container.querySelector('.price-result').textContent = foundTankObj.price + '€';

  document.querySelector('.init-container').style.display = 'none';
  container.style.display = 'grid';
}

function saveUserResults() {
  const tempType = foundTankObj.type;
  gogasSelections = {
    ...gogasSelections,
    form: {
      activeValues: {
        type: typeSelect.value,
        litres: litresSelect.value,
        dimension: dimensionSelect.value,
        location: locationSelect.value
      },
      fetchedValues: {
        fetchedLitres,
        fetchedDimensions,
        fetchedPinsLength
      }
    },
    results: {
      foundTankObj: {
        ...foundTankObj,
        tankImgUrl: tankImgUrlDict[tempType]
      }
    }
  };
  setGogasSelections();
}

/**
 * @param  {} fetchedPinsLength
 *
 * TODO clean code
 * ! this is important!
 * * Hello world?
 * ? Is this life?
 *
 */
function populateLocationContainerResults(fetchedPinsLength) {
  if (fetchedPinsLength) {
    [...document.querySelectorAll('.pins-found')].map(el => (el.style.display = 'block'));
    [...document.querySelectorAll('.pins-not-found')].map(el => (el.style.display = 'none'));
    [...document.querySelectorAll('.found-places-text-location')].map(
      el => (el.textContent = fetchedPinsLength)
    );
  } else {
    [...document.querySelectorAll('.pins-found')].map(el => (el.style.display = 'none'));
    [...document.querySelectorAll('.pins-not-found')].map(el => (el.style.display = 'block'));
  }

  [...document.querySelectorAll('.selected-location-string')].forEach(el => {
    const locationStr = locationSelect.options[locationSelect.selectedIndex].innerHTML;
    el.textContent = locationStr.charAt(0).toUpperCase() + locationStr.slice(1).toLowerCase();
  });
  //
  [...document.querySelectorAll('.searching-location')].map(el => (el.style.display = 'none'));
  [...document.querySelectorAll('.location-results-container')].map(
    el => (el.style.display = 'block')
  );
}

function resetLocationContainer() {
  [...document.querySelectorAll('.searching-location')].map(el => (el.style.display = 'flex'));
  [...document.querySelectorAll('.location-results-container')].map(
    el => (el.style.display = 'none')
  );
}

function populateClosestsPins(userLatLng) {
  [...document.querySelectorAll('.searching-closests')].map(el => (el.style.display = 'flex'));

  fetch(closestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      geometry: userLatLng,
      lovatoServices: ['gogasTanks'],
      kmLimit: 150,
      pinsLimit: 20
    })
  })
    .then(response => {
      status = response.status;
      return response.json();
    })
    .then(data => {
      if (status != 200) {
        console.error(status);
        return;
      }
      console.log('Closest Fetch:', data);
      fetchedClosests = data.closestPins;
      openLocationListContainer();
      addLocationStr(data.location);
      prepareClosestList(fetchedClosests);
      [...document.querySelectorAll('.searching-closests')].map(el => (el.style.display = 'none'));
    })
    .catch(error => {
      //endLoadingSelect(dimensionSelect);
      //litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Pins Error Fetch:', error);
    });
}

function prepareClosestList(fetchedClosests) {
  generateListItems(fetchedClosests);
  populateClosestsList(fetchedClosests);
}

function generateListItems(fetchedClosests) {
  const listItem = document.querySelector('.list-item').cloneNode(true);
  suggestedContainers.forEach(container => {
    const containerList = container.querySelector('.location-list-block');
    [...containerList.querySelectorAll('.list-item')].forEach(el => {
      el.remove();
    });
    for (let i = 0; i < fetchedClosests.length; i++) {
      const cloneListItem = listItem.cloneNode(true);
      containerList.appendChild(cloneListItem);
    }
  });
}

function populateClosestsList(fetchedClosests) {
  let names, addresses, phones, emails, distances, openMaps;

  // let gpsParam;
  // let nameParam;
  let geometryParam;
  const filtersParam = '2';

  suggestedContainers.forEach(container => {
    names = [...container.querySelectorAll('.closest-name')];
    addresses = [...container.querySelectorAll('.closest-address')];
    phones = [...container.querySelectorAll('.closest-phone')];
    emails = [...container.querySelectorAll('.closest-email')];
    distances = [...container.querySelectorAll('.closest-distance')];
    openMaps = [...container.querySelectorAll('.closest-open-map')];

    fetchedClosests.forEach((closest, i) => {
      names[i].textContent = closest.pin.properties.name;
      addresses[i].textContent = closest.pin.properties.address;
      phones[i].textContent = closest.pin.properties.phone;
      emails[i].textContent = closest.pin.properties.email ? closest.pin.properties.email : '';
      distances[i].textContent = Math.round(closest.distance * 100) / 100;

      // gpsParam = encodeURI(closest.pin.properties.address);
      // openMaps[i].href = `${mapBaseUrl}?gps=${gpsParam}&filters=${filtersParam}`;
      // nameParam = encodeURI(closest.pin.properties.name);
      // openMaps[i].href = `${mapBaseUrl}?name=${nameParam}&filters=${filtersParam}`;
      let { lat, lng } = closest.pin.geometry;
      geometryParam = lat + ',' + lng;
      openMaps[i].href = `${mapBaseUrl}?geometry=${geometryParam}&filters=${filtersParam}`;
      openMaps[i].target = '_blank';
    });
  });
}

function addLocationStr(location) {
  [...document.querySelectorAll('.location-address-string')].map(el => (el.textContent = location));
}

function openLocationListContainer() {
  const locationListContainer = [...document.querySelectorAll('.location-list-container-gogas')];
  locationListContainer.map(el => (el.style.display = 'flex'));
  locationListContainer.map(el => (el.style.height = 'auto'));
}

/* SUMMARY DOWNLOAD */

document
  .querySelector('#downloadSummaryBtn')
  .addEventListener('click', e => downloadSummarySubmit(e, 'form'));

function hasUserInfo() {
  const ret = getUserInfo();

  if (!ret || !ret.username || !ret.email || !ret.phone) return false;
  else return true;
}

function hasResult() {
  return suggestedContainers.some(container => container.style.display !== 'none');
}

function downloadSummarySubmit(e, triggeredFrom) {
  e.preventDefault(); //

  const validationResult = validateUserForm();
  console.log(validationResult);
  if (!validationResult.valid) return handleInvalidDownload(validationResult.msg);

  [...document.querySelectorAll('.summary-form-error')].map(el => (el.style.display = 'none'));

  dataToSend = gogasSelections.results.foundTankObj;
  dataToSend.userInfo = userInfo;

  startLoadingSelect(e.target, triggeredFrom);
  fetch(downloadGogasSummaryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: dataToSend })
  })
    .then(res => {
      if (res.status !== 200) {
        endLoadingSelect(e.target, triggeredFrom);
        if (res.status === 429) {
          handleInvalidDownload(
            'Έχετε ξεπεράσει το όριο των κλήσεων για την προσφορά, προσπαθήστε αργότερα'
          );
        }
        return null;
      }
      return res.blob();
    })
    .then(blob => {
      if (!blob) return;
      const newBlob = new Blob([blob], { type: 'image/png' });
      console.log(newBlob);
      downloadFile(newBlob, 'Η προσφορά μου -' + dataToSend.userInfo.username);
      endLoadingSelect(e.target, triggeredFrom);
      closeSummaryForm(); //
    })
    .catch(error => {
      endLoadingSelect(e.target, triggeredFrom);
      console.error('Error Fetch:', error);
    });
}

function closeSummaryForm() {
  document.querySelector('.email-contact-pop-up').style.display = 'none';
  document.querySelector('.email-overlay').style.display = 'none';
}

function validateUserForm() {
  if (!document.querySelector('.user-info-username').value)
    return { valid: false, msg: 'Απαιτείται ονοματεπώνυμο' };
  if (!isEmail(document.querySelector('.user-info-email').value))
    return { valid: false, msg: 'Απαιτείται έγκυρο email' };
  if (
    isNaN(document.querySelector('.user-info-phone').value) ||
    document.querySelector('.user-info-phone').value.length != 10
  )
    return { valid: false, msg: 'Απαιτείται έγκυρος αριθμός τηλεφώνου (10ψηφία)' };
  if (!hasResult())
    return {
      valid: false,
      msg: 'Για να κατεβάσετε την προσφορά θα πρέπει πρώτα να επιλέξετε τη δεξαμενή σας από τις "Τιμές Αντικατάστασης"!'
    };
  if (!hasUserInfo()) return { valid: false, msg: 'Συμπληρώστε πρώτα τα προσωπικά σας στοιχεία' };
  return { valid: true };
}

function isEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function handleInvalidDownload(msg) {
  const formErrorEls = [...document.querySelectorAll('.summary-form-error')];
  formErrorEls.map(el => (el.style.display = 'block'));
  formErrorEls.map(el => (el.textContent = msg));

  setTimeout(() => formErrorEls.forEach(el => (el.style.display = 'none')), 4000);
}

function downloadFile(blob, fileName) {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(newBlob);
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  // link.download = fileName + '.pdf';
  link.download = fileName + '.png';
  document.body.append(link);
  link.click();
  link.remove();

  // in case the Blob uses a lot of memory
  setTimeout(() => URL.revokeObjectURL(link.href), 7000);
}
