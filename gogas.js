/* System Identification */
const baseUrl = 'https://lovatohellas.herokuapp.com/gogasDB/get';
const mapBaseUrl = 'https://lovato-hellas.webflow.io/diktyo-synergaton';
const urlLitres = '/litres';
const urlDimensions = '/dimensions';
const closestUrl = 'https://lovatohellas.herokuapp.com/map/pins/closest';
const numPlaceUrl = 'https://lovatohellas.herokuapp.com/map/pins/numPlace';

const typeSelect = document.querySelector('#typeSelect');
const litresSelect = document.querySelector('#litresSelect');
const dimensionSelect = document.querySelector('#dimensionSelect');
const locationSelect = document.querySelector('#locationSelect');

const suggestedContainers = document.querySelectorAll('.suggested-tank-container');

let fetchedLitres, fetchedDimensions, fetchedPins, fetchedClosests, foundTankObj, activeContainer;
let isLocationSelected = false; // DEBUG from arxiki kai localStorage
let geolocationError = false;

const typeContainerIdDict = {
  ΕΣΩΤΕΡΙΚΗ: 'eswterikhContainer',
  ΕΞΩΤΕΡΙΚΗ: 'ekswterikhContainer',
  ΚΥΛΙΝΔΡΙΚΗ: 'kylindrikhContainer'
};

document.addEventListener('DOMContentLoaded', () => {
  litresSelect.disabled = true;
  dimensionSelect.disabled = true;
  locationSelect.disabled = true;

  [...document.querySelectorAll('.open-map-btn')].map(el =>
    el.addEventListener('click', () => {
      const url = `${mapBaseUrl}?gps=ΝΟΜΟΣ%20${
        locationSelect.options[locationSelect.selectedIndex].innerHTML
      }`;
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
        [...document.querySelectorAll('.geolocation-error')].map(
          el => (el.style.display = 'block')
        );
      }
    })
  );
});

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

function startLoadingSelect(select) {
  select.classList.add('loading-select');
}
function endLoadingSelect(select) {
  select.classList.remove('loading-select');
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

function populateLitresSelect(fetchedLitres) {
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

function populateDimensionSelect(fetchedDimensions) {
  let dimensionOptionsArray = ['<option value="">Επιλέξτε Διαστάσεις</option>'];
  fetchedDimensions.forEach(dimension => {
    const typeLabel = typeSelect.value === 'unknown' ? ` ${dimension.type} ` : '';
    const dimensionLabel = `${dimension.diameter}/${dimension.length}${typeLabel} - ${dimension.litres} LT`;
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
    populateLocationContainerResults(fetchedPins);
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
      fetchedPins = data;
      populateLocationContainerResults(fetchedPins);
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
  console.log({ foundTankObj });

  activeContainer = document.getElementById(typeContainerIdDict[foundTankObj.type]);
  renderResultsContainer(activeContainer);
}

function renderResultsContainer(container) {
  container.querySelector('.litres-result').textContent = foundTankObj.litres + ' LT';
  container.querySelector('.diameter-result').textContent = foundTankObj.diameter / 10;
  container.querySelector('.length-result').textContent = foundTankObj.length / 10;
  container.querySelector('.price-result').textContent = foundTankObj.price + '€';

  document.querySelector('.init-container').style.display = 'none';
  container.style.display = 'grid';
}
/**
 * @param  {} fetchedPins
 *
 * TODO clean code
 * ! this is important!
 * * Hello world?
 * ? Is this life?
 *
 */
function populateLocationContainerResults(fetchedPins) {
  console.log('populate pins result', fetchedPins);

  if (fetchedPins.length) {
    [...document.querySelectorAll('.pins-found')].map(el => (el.style.display = 'block'));
    [...document.querySelectorAll('.pins-not-found')].map(el => (el.style.display = 'none'));
    [...document.querySelectorAll('.found-places-text-location')].map(
      el => (el.textContent = fetchedPins.length)
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
  console.log('open loading ....');
  [...document.querySelectorAll('.searching-closests')].map(el => (el.style.display = 'flex'));
  console.log('opened loading ....');

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
      console.log('close loading ....');
      [...document.querySelectorAll('.searching-closests')].map(el => (el.style.display = 'none'));
      console.log('closed loading ....');
    })
    .catch(error => {
      //endLoadingSelect(dimensionSelect);
      //litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Pins Error Fetch:', error);
    });
  console.log('after promise....');
}
/**
 * @param  {} fetchedClosests
 * TODO: openMaps[i].href = `${mapBaseUrl}?gps=${encodeURI(closest.pin.properties.address)}`; xreiazetai na dw pws to kanw kai gia GEOMETRY
 */

function prepareClosestList(fetchedClosests) {
  generateListItems(fetchedClosests);
  populateClosestsList(fetchedClosests);
}

function generateListItems(fetchedClosests) {
  const listItem = document.querySelector('.list-item').cloneNode(true);
  console.log(listItem);

  suggestedContainers.forEach(container => {
    const containerList = container.querySelector('.location-list-block');
    [...containerList.querySelectorAll('.list-item')].forEach(el => {
      console.log(container, el);
      el.remove();
    });
    for (let i = 0; i < fetchedClosests.length - 1; i++) {
      const cloneListItem = listItem.cloneNode(true);
      containerList.appendChild(cloneListItem);
      console.log(containerList, cloneListItem);
    }
  });
}

function populateClosestsList(fetchedClosests) {
  let names, addresses, phones, emails, distances, openMaps;
  suggestedContainers.forEach(container => {
    names = [...container.querySelectorAll('.closest-name')];
    addresses = [...container.querySelectorAll('.closest-address')];
    phones = [...container.querySelectorAll('.closest-phone')];
    emails = [...container.querySelectorAll('.closest-email')];
    distances = [...container.querySelectorAll('.closest-distance')];
    openMaps = [...container.querySelectorAll('.closest-open-map')];

    console.log(names, container.querySelectorAll('.closest-name'));
    fetchedClosests.forEach((closest, i) => {
      names[i].textContent = closest.pin.properties.name;
      addresses[i].textContent = closest.pin.properties.address;
      phones[i].textContent = closest.pin.properties.phone;
      emails[i].textContent = closest.pin.properties.email ? closest.pin.properties.email : '';
      distances[i].textContent = Math.round(closest.distance * 100) / 100;
      openMaps[i].href = `${mapBaseUrl}?gps=${encodeURI(closest.pin.properties.address)}`;
    });
  });
}

function addLocationStr(location) {
  [...document.querySelectorAll('.location-address-string')].map(el => (el.textContent = location));
}

function openLocationListContainer() {
  const locationListContainer = [...document.querySelectorAll('.location-list-container')];
  locationListContainer.map(el => (el.style.display = 'flex'));
  locationListContainer.map(el => (el.style.height = 'auto'));
}
