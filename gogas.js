/* System Identification */
const baseUrl = location.origin;
const mapUrl = '/stores';
const urlLitres = '/litres';
const urlDimensions = '/dimensions';
const mapBaseUrl = baseUrl + mapUrl;
const serverBaseUrl = 'https://lovatohellas.herokuapp.com/gogasDB/get';
const closestUrl = 'https://lovatohellas.herokuapp.com/map/pins/closest';
const numPlaceUrl = 'https://lovatohellas.herokuapp.com/map/pins/numPlace';
let downloadSummaryUrl = 'https://lovatohellas.herokuapp.com/summaries/download/gogas';
// const downloadSummaryUrl = 'http://localhost:1917/summaries/download/gogas';
let emailSummaryUrl = 'https://lovatohellas.herokuapp.com/summaries/email/gogas';
// const emailSummaryUrl = 'http://localhost:1917/summaries/email/gogas';
// const urlContactForm = 'http://localhost:1917/contact/';
const urlContactForm = 'https://lovatohellas.herokuapp.com/contact/';
const baseDateUrl = 'https://lovatohellas.herokuapp.com/lottery/base-date';
// const baseDateUrl = 'http://localhost:1917/lottery/base-date';

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
  activeContainer = null;
let isLocationSelected = false;
let geolocationError = false;
let formType = 'DOWNLOAD';

const typeContainerIdDict = {
  ΕΣΩΤΕΡΙΚΗ: 'eswterikhContainer',
  ΕΞΩΤΕΡΙΚΗ: 'ekswterikhContainer',
  ΚΥΛΙΝΔΡΙΚΗ: 'kylindrikhContainer'
};

const tankImgUrlDict = {
  ΕΣΩΤΕΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f9ee45e6ea190e6455e9f7_internal-tank-wmv.jpg',
  ΕΞΩΤΕΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f9ee7fbd49ae0779fc2cad_externall-tank-wmv.jpg',
  ΚΥΛΙΝΔΡΙΚΗ:
    'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f9ee7fc8df88ee62a068d3_cyl-tank-wmv.jpg'
};

const preferredStorage = localStorage;
let gogasSelections = {};
let userInfo = { username: '', email: '', phone: '', address: '' };

// let sourceReferrerDomain;

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

  gogasSelections = { results: { mvSelected: false, mvPrice: MV_PRICE } };
  // if (getGogasSelections()) loadGogasSelections();

  initUserInfo();
  showFacebookBrowserProblem(isFacebookBrowser());

  initLotteryCountdown();
  // initTankWrapperClicks();

  // getSourceReferrerDomain();
  initForeignReferrerOptions();

  initPulses();
});

function initPulses() {
  const tankPulse = document.createElement('div');
  tankPulse.classList.add('pulse', 'tank-pulse');
  document.querySelector('#tankForm').prepend(tankPulse);

  const summaryPulse = document.createElement('div');
  summaryPulse.classList.add('pulse', 'summary-pulse');
  document.querySelector('.summary-btns-container').prepend(summaryPulse);
  togglePulse('.summary-pulse', false);

  summaryPulse.addEventListener('click', e =>
    document.querySelector('.open-download-form').click()
  );
}

function togglePulse(pulseSelector, show) {
  document.querySelector(pulseSelector).style.display = show ? 'block' : 'none';
}

function isForeign() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('foreignReferrer') && urlParams.get('foreignReferrer') === 'true';
}

function initForeignReferrerOptions() {
  if (isForeign()) {
    const dontShowEls = [
      '.navbar.navbar-3',
      '#gogasNavContact',
      '#recentWinners',
      '#contact',
      '#footer'
    ];
    dontShowEls.forEach(query => (document.querySelector(query).style.display = 'none'));

    const types = ['#eswterikhContainer', '#ekswterikhContainer', '#kylindrikhContainer'];
    types.forEach(type => {
      document.querySelector(`${type} .location-suggestions`).style.display = 'none';
      document.querySelector(`${type} .tank-wrapper`).style.margin = '0 auto';
      const query = `${type} .tank-result-wrapper`;

      document.querySelector(query).style.gridRowStart = 'span 1';
      document.querySelector(query).style.gridRowEnd = 'span 1';
      document.querySelector(query).style.griColumnStart = 'span 2';
      document.querySelector(query).style.gridColumnEnd = 'span 2';
    });
    document.querySelector('.foreign-summary-text').textContent = 'έλα στο συνεργείο μας!';

    const a = '<a href="/go-gas" target="_blank">';
    document.querySelector('.gogas-logo-nav').outerHTML =
      a + document.querySelector('.gogas-logo-nav').outerHTML + '</a>';

    const gogasHeroImgA = document.querySelector('.hero-slide-wrapper');
    gogasHeroImgA.href = gogasHeroImgA.href + '?foreignReferrer=true';

    document.querySelector('.mobile-location-container').style.display = 'none';

    adjustContactInfoContainer();
  }
}

function adjustContactInfoContainer() {
  document.querySelector('.email-overlay').remove();
  const outerHTML = document.querySelector('.email-contact-pop-up').outerHTML;
  document.querySelector('.email-contact-pop-up').remove();

  const div = document.createElement('div');
  div.innerHTML = outerHTML;
  const emailContactPopup = div.firstChild;

  emailContactPopup.style.position = 'absolute';
  emailContactPopup.style.bottom = '-50px';
  emailContactPopup.style.display = 'none';
  if (isMobile()) emailContactPopup.style.height = '100%';

  document.querySelector('.gogas-summary-container').prepend(emailContactPopup);

  document
    .querySelector('#submitSummaryBtn')
    .addEventListener('click', e => handleSummarySubmit(e, 'form'));
  document.querySelector('.contact-pop-up-close').addEventListener('click', closeSummaryForm);

  initUserInfo();
}

function showFacebookBrowserProblem(show) {
  if (isFacebookBrowser()) {
    document.querySelector('.facebook-browser-div').style.display = show ? 'block' : 'none';
  }
}

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
}

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
      [...document.querySelectorAll('.geolocation-error')].map(el => {
        el.textContent = isFacebookBrowser()
          ? 'Ανοίξτε τη σελίδα σε άλλον περιηγητή (Chrome, Firefox κλπ) γιατί το GPS δεν υποστηρίζεται από το περιηγητή του Facebook. Επιλέξτε τις τρεις κουκίδες πάνω δεξιά στις ρυθμίσεις και στη συνέχεια άνοιγμα στο Chrome (ή άλλον περιηγητή).'
          : 'Η τοποθεσία σας είναι απενεργοποιημένη, προσπαθήστε ξανά';
        el.style.display = 'block';
      });
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
      document.querySelector('#submitSummaryBtn').value = 'Ετοιμάζουμε την προσφορά σου...';
    }
  }
}
function endLoadingSelect(select, triggeredFrom = null) {
  if (!triggeredFrom) select.classList.remove('loading-select');
  else {
    if (triggeredFrom === 'form') {
      document.querySelector('#submitSummaryBtn').value =
        formType === 'DOWNLOAD' ? 'Κατέβασε και εκτύπωσε!' : 'Πάρε με Email!';
    }
  }
}

function setLocationSelectHeader(label) {
  if (isLocationSelected) return;
  const temp = [...locationSelect.options].map(option => option.outerHTML);
  temp[0] = `<option value="">${label}</option>`;
  locationSelect.innerHTML = temp.join('');
}

typeSelect.addEventListener('change', typeSelectOnChange);

function typeSelectOnChange() {
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
  togglePulse('.tank-pulse', false);
  document.querySelector('.mobile-location-container').style.display = 'none';
  activeContainer = null;

  if (!typeSelect.value) {
    togglePulse('.tank-pulse', true);
    togglePulse('.summary-pulse', false);
    return;
  }

  litresSelect.disabled = false;
  litresSelect.innerHTML = '';
  startLoadingSelect(litresSelect);

  let status;
  fetch(serverBaseUrl + urlLitres, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: typeSelect.value })
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

      populateLitresSelect(fetchedLitres);
      endLoadingSelect(litresSelect);
    })
    .catch(error => {
      endLoadingSelect(litresSelect);
      litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Error Fetch:', error);
    });
}

function populateLitresSelect(fetchedLitres, options = {}) {
  let litresOptionsArray = ['<option value="">Επιλέξτε Λίτρα</option>'];

  // const allDimensionsTypeLabel =
  //   typeSelect.value !== 'unknown'
  //     ? ` για ${typeSelect.options[typeSelect.selectedIndex].textContent.toLowerCase()}`
  //     : '';
  // litresOptionsArray.push(
  //   `<option value="allDimensions">Όλες οι διαστάσεις${allDimensionsTypeLabel}</option>`
  // );
  litresOptionsArray.push(`<option value="allDimensions">🔹 Δες όλες τις διαστάσεις</option>`);

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
  dimensionSelect.disabled = true;
  locationSelect.disabled = true;
  dimensionSelect.innerHTML = '<option>Διαστάσεις</option>';
  setLocationSelectHeader('Τοποθεσία');

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';
  togglePulse('.summary-pulse', false);
  document.querySelector('.mobile-location-container').style.display = 'none';
  activeContainer = null;

  if (!value) return;

  dimensionSelect.disabled = false;
  dimensionSelect.innerHTML = '';
  startLoadingSelect(dimensionSelect);

  let status;
  fetch(serverBaseUrl + urlDimensions, {
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
  locationSelect.disabled = true;
  setLocationSelectHeader('Τοποθεσία');

  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';
  togglePulse('.summary-pulse', false);
  document.querySelector('.mobile-location-container').style.display = 'none';
  activeContainer = null;

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
  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  document.querySelector('.init-container').style.display = 'flex';
  togglePulse('.summary-pulse', false);
  document.querySelector('.mobile-location-container').style.display = 'none';
  activeContainer = null;

  if (!value) {
    isLocationSelected = false;
    return;
  }
  isLocationSelected = true;
  [...document.querySelectorAll('.searching-place-text-location')].map(
    el => (el.textContent = locationSelect.options[locationSelect.selectedIndex].innerHTML)
  );
  resetLocationContainer();

  let status;
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
  saveUserResults();
  renderResultsContainer(activeContainer);
  trigger_gogas_results();
}

function renderResultsContainer(container) {
  container.querySelector('.litres-result').textContent = foundTankObj.litres + ' Λίτρα';
  container.querySelector('.diameter-result').textContent = foundTankObj.diameter / 10;
  container.querySelector('.length-result').textContent = foundTankObj.length / 10;

  const mvSelected = gogasSelections.results.mvSelected;
  const priceAfterMv = mvSelected ? foundTankObj.price + MV_PRICE : foundTankObj.price;
  container.querySelector('.price-result').textContent = priceAfterMv.toFixed(2) + '€';

  document.querySelector('.init-container').style.display = 'none';
  container.style.display = 'grid';

  document.querySelector('.mobile-location-container').style.display =
    isNotDesktop() && !isForeign() ? 'block' : 'none';

  togglePulse('.summary-pulse', true);
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
      ...gogasSelections.results,
      foundTankObj: {
        ...foundTankObj,
        tankImgUrl: tankImgUrlDict[tempType]
      },
      finalPrice: gogasSelections.results.mvSelected
        ? Math.round((foundTankObj.price + MV_PRICE) * 100) / 100
        : Math.round(foundTankObj.price * 100) / 100
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
  let status;
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
  [...suggestedContainers, document.querySelector('.mobile-location-container')].forEach(
    container => {
      const containerList = container.querySelector('.location-list-block');
      [...containerList.querySelectorAll('.list-item')].forEach(el => {
        el.remove();
      });
      for (let i = 0; i < fetchedClosests.length; i++) {
        const cloneListItem = listItem.cloneNode(true);
        containerList.appendChild(cloneListItem);
      }
    }
  );
}

function populateClosestsList(fetchedClosests) {
  let names, addresses, phones, emails, distances, openMaps;

  // let gpsParam;
  // let nameParam;
  let geometryParam;
  const filtersParam = '2';

  [...suggestedContainers, document.querySelector('.mobile-location-container')].forEach(
    container => {
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
    }
  );
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
document.querySelector('#openDownloadForm').addEventListener('click', e => {
  formType = 'DOWNLOAD';
  showFacebookBrowserProblem(true);
  document.querySelector('#submitSummaryBtn').value = 'Κατέβασε και εκτύπωσε!';
  trigger_opened_summary_form({
    summary_type: 'download',
    is_facebook_browser: isFacebookBrowser()
  });
});

document.querySelector('#openEmailForm').addEventListener('click', e => {
  formType = 'EMAIL';
  showFacebookBrowserProblem(false);
  document.querySelector('#submitSummaryBtn').value = 'Πάρε με Email!';
  trigger_opened_summary_form({
    summary_type: 'email',
    is_facebook_browser: isFacebookBrowser()
  });
});

document
  .querySelector('#submitSummaryBtn')
  .addEventListener('click', e => handleSummarySubmit(e, 'form'));

function handleSummarySubmit(e, triggeredFrom) {
  e.preventDefault();
  formType === 'DOWNLOAD'
    ? downloadSummarySubmit(e, triggeredFrom)
    : emailSummarySubmit(e, triggeredFrom);
}

function hasUserInfo() {
  const ret = getUserInfo();

  if (!ret || !ret.username || !ret.email || !ret.phone) return false;
  else return true;
}

function hasResult() {
  return suggestedContainers.some(container => container.style.display === 'grid');
}

function downloadSummarySubmit(e, triggeredFrom) {
  const validationResult = validateUserForm();
  if (!validationResult.valid) return handleInvalidDownload(validationResult.msg);

  [...document.querySelectorAll('.summary-form-error')].map(el => (el.style.display = 'none'));

  dataToSend = gogasSelections.results;
  dataToSend.location = gogasSelections.form.activeValues.location;
  dataToSend.mapBaseUrl = mapBaseUrl;
  dataToSend.sourceReferrerDomain = sourceReferrerDomain;
  dataToSend.userInfo = userInfo;

  startLoadingSelect(e.target, triggeredFrom);
  fetch(downloadSummaryUrl, {
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
      downloadFile(newBlob, 'Η προσφορά μου -' + dataToSend.userInfo.username);
      endLoadingSelect(e.target, triggeredFrom);
      closeSummaryForm();
      trigger_gogas_summary('download');
    })
    .catch(error => {
      endLoadingSelect(e.target, triggeredFrom);
      console.error('Error Fetch:', error);
    });
}

function isFacebookBrowser() {
  let ua = navigator.userAgent || navigator.vendor || window.opera;
  return ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
}

function emailSummarySubmit(e, triggeredFrom) {
  const validationResult = validateUserForm();
  if (!validationResult.valid) return handleInvalidDownload(validationResult.msg);

  [...document.querySelectorAll('.summary-form-error')].map(el => (el.style.display = 'none'));

  dataToSend = gogasSelections.results;
  dataToSend.location = gogasSelections.form.activeValues.location;
  dataToSend.mapBaseUrl = mapBaseUrl;
  dataToSend.sourceReferrerDomain = sourceReferrerDomain;
  dataToSend.userInfo = userInfo;

  startLoadingSelect(e.target, triggeredFrom);
  fetch(emailSummaryUrl, {
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
        } else {
          handleInvalidDownload('Το email που καταχωρήσατε δεν είναι έγκυρο, ξαναπροσπαθήστε');
        }
        return;
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      endLoadingSelect(e.target, triggeredFrom);
      document.querySelector('.summary-success-form').style.display = 'block';
      document.querySelector('.success-msg-email').textContent = userInfo.email;
      setTimeout(() => {
        closeSummaryForm();
        document.querySelector('.summary-success-form').style.display = 'none';
      }, 3000);
      trigger_gogas_summary('email');
    })
    .catch(error => {
      endLoadingSelect(e.target, triggeredFrom);
      console.error('Error Fetch:', error);
    });
}

function closeSummaryForm() {
  document.querySelector('.email-contact-pop-up').style.display = 'none';
  const overlay = document.querySelector('.email-overlay');
  overlay && (overlay.style.display = 'none');
}

function validateUserForm() {
  if (!hasResult())
    return {
      valid: false,
      msg: 'Για να κατεβάσετε την προσφορά θα πρέπει πρώτα να επιλέξετε δεξαμενή παραπάνω!'
    };
  if (!document.querySelector('.user-info-username').value)
    return { valid: false, msg: 'Απαιτείται ονοματεπώνυμο' };
  if (!isEmail(document.querySelector('.user-info-email').value))
    return { valid: false, msg: 'Απαιτείται έγκυρο email' };
  if (
    isNaN(document.querySelector('.user-info-phone').value) ||
    document.querySelector('.user-info-phone').value.length != 10
  )
    return { valid: false, msg: 'Απαιτείται έγκυρος αριθμός τηλεφώνου (10ψηφία)' };

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

/* CONTACT FORM */
document.querySelector('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const validationResult = validateContactForm();
  if (!validationResult.valid) return handleInvalidContactForm(validationResult.msg);

  sendContactEmail();
});

function validateContactForm() {
  if (!userInfo.username) return { valid: false, msg: 'Απαιτείται ονοματεπώνυμο' };
  if (isNaN(userInfo.phone) || userInfo.phone.length != 10)
    return { valid: false, msg: 'Απαιτείται έγκυρος αριθμός τηλεφώνου (10ψηφία)' };
  if (!isEmail(userInfo.email)) return { valid: false, msg: 'Απαιτείται έγκυρο email' };
  if (!userInfo.address) return { valid: false, msg: 'Απαιτείται διεύθυνση' };
  if (!document.querySelector('#contactMsg').value)
    return { valid: false, msg: 'Παρακαλούμε γράψτε πρώτα το μήνυμα σας' };
  if (!hasUserInfo()) return { valid: false, msg: 'Συμπληρώστε πρώτα τα προσωπικά σας στοιχεία' };
  return { valid: true };
}

function handleInvalidContactForm(msg) {
  const formErrorEl = document.querySelector('.contact-form-error');
  formErrorEl.style.display = 'block';
  formErrorEl.textContent = msg;
  setTimeout(() => (formErrorEl.style.display = 'none'), 4000);
}

function sendContactEmail() {
  const data = {
    user: userInfo,
    msg: document.querySelector('#contactMsg').value,
    form: {
      url: location.origin + location.pathname,
      name: document.querySelector('#contactForm').dataset.name,
      date: `${new Date().toLocaleDateString('el')}, ${new Date().toLocaleTimeString('el')}`
    },
    gogasSelections: hasResult() && gogasSelections
  };

  document.querySelector('#contactSubmit').value = 'Γίνεται η αποστολή...';
  fetch(urlContactForm, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  })
    .then(res => res.json())
    .then(data => {
      document.querySelector('.contact-form-success').style.display = 'block';
      document.querySelector('#contactSubmit').value = 'Αποστολή';
      document.querySelector('#contactMsg').value = '';
      setTimeout(() => {
        document.querySelector('.contact-form-success').style.display = 'none';
      }, 6000);
    })
    .catch(e => {
      console.error('Error on contact form email:', e);
      handleInvalidContactForm('Υπήρξε πρόβλημα κατά την αποστολή, προσπαθήστε αργότερα');
      document.querySelector('#contactSubmit').value = 'Αποστολή';
    });
}

// const seedDate = new Date(2021, 7, 28, 1, 8);
// const seedDate = new Date('9/10/21');
let baseDate;

const _second = 1000;
const _minute = _second * 60;
const _hour = _minute * 60;
const _day = _hour * 24;
const lotteryDaysInterval = 20;
const daysCountdown = document.querySelector('#days');
const hoursCountdown = document.querySelector('#hours');
const minutesCountdown = document.querySelector('#minutes');
const secondsCountdown = document.querySelector('#seconds');

function initLotteryCountdown() {
  let status;
  fetch(baseDateUrl)
    .then(response => {
      status = response.status;
      return response.json();
    })
    .then(data => {
      if (status != 200) {
        console.error('Error Status Base Date Fetch:', status);
        baseDate = new Date('1/1/2001');

        return;
      }
      console.log('Base Date:', data);
      baseDate = new Date(data);
      showBaseDate();
      startCountdown();
    })
    .catch(error => {
      baseDate = new Date('2/1/2001');
      showBaseDate();
      console.error('Error Base Date Fetch:', error);
    });
}

function calculateTime(remainingMilliseconds) {
  const seconds = Math.floor((remainingMilliseconds % _minute) / _second);
  const minutes = Math.floor((remainingMilliseconds % _hour) / _minute);
  const hours = Math.floor((remainingMilliseconds % _day) / _hour);
  const days = Math.floor(remainingMilliseconds / _day);
  populateCountdown(days, hours, minutes, seconds);
}

function populateCountdown(days, hours, minutes, seconds) {
  daysCountdown.textContent = days.toString().length === 1 ? '0' + days : days;
  hoursCountdown.textContent = hours.toString().length === 1 ? '0' + hours : hours;
  minutesCountdown.textContent = minutes.toString().length === 1 ? '0' + minutes : minutes;
  secondsCountdown.textContent = seconds.toString().length === 1 ? '0' + seconds : seconds;
}

function getNextLotteryDate(date) {
  const minutes = 60 * 24 * lotteryDaysInterval;
  return new Date(date.getTime() + minutes * 60000);
}

function showBaseDate() {
  const day =
    baseDate.getDate().toString().length === 1 ? '0' + baseDate.getDate() : baseDate.getDate();
  const month =
    (baseDate.getMonth() + 1).toString().length === 1
      ? '0' + (baseDate.getMonth() + 1)
      : baseDate.getMonth() + 1;
  const year = baseDate.getFullYear().toString().substring(2, baseDate.getFullYear().length);
  document.querySelector('.base-date').textContent = `${day}/${month}/${year}`;
}

function startCountdown() {
  let nextLotteryDate = baseDate;
  let remainingMilliseconds = nextLotteryDate - new Date();
  calculateTime(remainingMilliseconds);
  setInterval(() => {
    nextLotteryDate = baseDate;
    remainingMilliseconds = nextLotteryDate - new Date();
    if (remainingMilliseconds < 0) {
      baseDate = getNextLotteryDate(baseDate);
      showBaseDate();
      nextLotteryDate = baseDate;

      remainingMilliseconds = nextLotteryDate - new Date();
    }
    calculateTime(remainingMilliseconds);
  }, 1000);
}

/* GTAG */
let gtagDebug = false;
function triggerGtagEvent(eventName, params = {}) {
  if (!gtagDebug && window.location.href.includes('webflow.io'))
    return { status: 'Error', message: 'dev' };
  if (typeof gtag === 'undefined') return { status: 'Error', message: 'gtag undefined' };
  if (typeof eventName === 'undefined' || eventName === '')
    return { status: 'Error', message: 'eventName undefined' };

  params.source_referrer_domain = sourceReferrerDomain;
  gtag('event', eventName, params);
  return {
    status: 'OK',
    message: `"${eventName}" event triggered with params: "${
      Object.keys(params).length && JSON.stringify(params)
    }"`
  };
}

function trigger_gogas_results() {
  triggerGtagEvent('gogas_results', {
    gogas_type: gogasSelections.results.foundTankObj.type,
    gogas_price: gogasSelections.results.foundTankObj.price,
    gogas_litres: gogasSelections.results.foundTankObj.litres,
    gogas_diameter: gogasSelections.results.foundTankObj.diameter,
    gogas_length: gogasSelections.results.foundTankObj.length,
    user_location: gogasSelections.form.activeValues.location
  });
}

function trigger_gogas_summary(type) {
  triggerGtagEvent('gogas_summary', {
    summary_type: type,
    multivalve_selected: gogasSelections.results.mvSelected,
    gogas_type: gogasSelections.results.foundTankObj.type,
    gogas_price: gogasSelections.results.foundTankObj.price,
    gogas_litres: gogasSelections.results.foundTankObj.litres,
    gogas_diameter: gogasSelections.results.foundTankObj.diameter,
    gogas_length: gogasSelections.results.foundTankObj.length,
    user_location: gogasSelections.form.activeValues.location,
    timer: multivalveSecondsOpenedAllTime
  });
}

function initTankWrapperClicks() {
  document.querySelector('#intTank').addEventListener('click', e => {
    if (typeSelect.selectedIndex === 1) return;
    typeSelect.selectedIndex = 1;
    typeSelectOnChange();
  });
  document.querySelector('#extTank').addEventListener('click', e => {
    if (typeSelect.selectedIndex === 2) return;
    typeSelect.selectedIndex = 2;
    typeSelectOnChange();
  });
  document.querySelector('#cylTank').addEventListener('click', e => {
    if (typeSelect.selectedIndex === 3) return;
    typeSelect.selectedIndex = 3;
    typeSelectOnChange();
  });
}

function trigger_multivalve_open() {
  multivalveOpenEnd = new Date();
  multivalveSecondsOpened =
    Math.round(((multivalveOpenEnd - multivalveOpenStart) / 1000) * 10) / 10;
  multivalveSecondsOpenedAllTime += multivalveSecondsOpened;
  triggerGtagEvent('multivalve_open', {
    gogas_type: gogasSelections.results.foundTankObj.type,
    gogas_price: gogasSelections.results.foundTankObj.price,
    gogas_litres: gogasSelections.results.foundTankObj.litres,
    gogas_diameter: gogasSelections.results.foundTankObj.diameter,
    gogas_length: gogasSelections.results.foundTankObj.length,
    user_location: gogasSelections.form.activeValues.location,
    multivalve_selected: gogasSelections.results.mvSelected,
    timer: multivalveSecondsOpened
  });
}

let multivalveOpenStart,
  multivalveOpenEnd,
  multivalveSecondsOpened = 0,
  multivalveSecondsOpenedAllTime = 0;
[...document.querySelectorAll('.multivalve-open')].map(el => {
  el.addEventListener('click', e => (multivalveOpenStart = new Date()));
});

[...document.querySelectorAll('.mv-close-btn')].forEach(el =>
  el.addEventListener('click', trigger_multivalve_open)
);

document
  .querySelector('.link-block-6')
  .addEventListener('click', e => trigger_learn_more_klirwsh());
function trigger_learn_more_klirwsh() {
  triggerGtagEvent('learn_more_klirwsh', { from_page: 'go-gas' });
}

/* Multivalve Check */
const MV_PRICE = 65;
const mvCheckIcons = [...document.querySelectorAll('.mv-check-icon')];

[...document.querySelectorAll('.mv-check-wrapper')].map(wrapper => {
  wrapper.addEventListener('click', e => {
    mvCheckIcons.map(
      icon => (icon.style.display = icon.style.display != 'block' ? 'block' : 'none')
    );

    const mvSelected = activeContainer.querySelector('.mv-check-icon').style.display === 'block';

    let priceBeforeMv = +activeContainer
      .querySelector('.price-result')
      .textContent.replace('€', '');

    const priceAfterMv = mvSelected ? priceBeforeMv + MV_PRICE : priceBeforeMv - MV_PRICE;

    gogasSelections.results.mvSelected = mvSelected;
    gogasSelections.results.finalPrice = mvSelected
      ? Math.round((gogasSelections.results.foundTankObj.price + MV_PRICE) * 100) / 100
      : Math.round(gogasSelections.results.foundTankObj.price * 100) / 100;

    activeContainer.querySelector('.price-result').textContent = priceAfterMv.toFixed(2) + '€';

    trigger_multivalve_checkbox({
      multivalve_selected: mvSelected,
      timer: multivalveSecondsOpened
    });
  });
});

function trigger_multivalve_checkbox(options) {
  triggerGtagEvent('multivalve_checkbox', options);
}

function trigger_opened_summary_form(options) {
  triggerGtagEvent('opened_summary_form', { ...options, has_gogas_result: !!activeContainer });
}

function isNotDesktop() {
  return window.matchMedia('screen and (max-width: 991px)').matches;
}
