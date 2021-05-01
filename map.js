const urlCachedPins = 'https://lovatohellas.herokuapp.com/map/pins/getAll';

// const episimosIconUrl =
// 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/603a68cae2a619145dcfc86e_location-icon.svg';
const episimosIconUrl =
  'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60663eb3c347c9975c35d5d9_location-icon-white.svg';

const markerClustererIcon =
  'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6059ab2542758022d1e784de_m1.png';

const mapCenter = { lat: 38.64, lng: 24.16 };
const startZoom = 6;
const searchZoom = 14;
const maxZoomClusterer = 10;
let markers = [],
  markerClusterer;

const gridSizesDependedOnZoom = { 6: 40, 7: 35, 8: 30, 9: 25, 10: 30 };
const zoomLevelsDependedOnZoom = { 6: 9, 7: 10, 8: 10, 9: 12, 10: 12 };

let map,
  infoWindow,
  userMarker,
  selectedMarker,
  geocoder,
  geocoderFoundAddress = false,
  thAddress,
  infoWindowDiv,
  slideIndex = 1,
  cachedPins;

document.addEventListener('DOMContentLoaded', async () => {
  generateInitHtml();
  initDOMEvents();
  startLoader();
  console.log('2'); //3.6
  cachedPins = await getCachedPins();
  console.log('3');
  endLoader();
  console.log(cachedPins);
  await initMap();
  await urlParamsConfig();
});

async function getCachedPins() {
  try {
    const res = await fetch(urlCachedPins, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await res.json();
  } catch (e) {
    console.error('Error Fetching Cached Pins:', error);
    return null;
  }
}

async function initMap() {
  const mapOptions = {
    zoom: startZoom,
    center: mapCenter,
    mapTypeId: 'roadmap', //'terrain',
    minZoom: startZoom,
    disableDefaultUI: false,
    scaleControl: true, // ?
    clickableIcons: false, //map places not clickable
    //draggableCursor: 'default',
    //zoomControl: true,
    // streetViewControl: true,
    // rotateControl: true,
    keyboardShortcuts: false,
    mapTypeControl: false, //Χάρτης | Δορυφόρος
    // mapTypeControlOptions: {
    // 	style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    // 	position: google.maps.ControlPosition.TOP_LEFT,
    // 	mapTypeIds: ['roadmap', 'terrain', 'satellite', 'hybrid'] //last 2 not working
    // },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    gestureHandling: 'greedy', //disable ctrl for zoom

    restriction: {
      latLngBounds: {
        north: 60.7,
        south: 20.43,
        east: 40.5,
        west: 8.56
      }
    },
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#cae4ff' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#F7F9F9' }]
      },

      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#D0E9FF' }]
      },
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [{ saturation: -100 }]
      }
    ]
    // styles: [
    // 	{
    // 		featureType: 'all',
    // 		elementType: 'geometry.fill',
    // 		stylers: [
    // 			{
    // 				visibility: 'on'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'administrative',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				color: '#f2f2f2'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'administrative',
    // 		elementType: 'labels.text.fill',
    // 		stylers: [
    // 			{
    // 				color: '#686868'
    // 			},
    // 			{
    // 				visibility: 'on'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'landscape',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				color: '#f2f2f2'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'poi',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				visibility: 'off'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'poi.park',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				visibility: 'on'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'poi.park',
    // 		elementType: 'labels.icon',
    // 		stylers: [
    // 			{
    // 				visibility: 'off'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				saturation: -100
    // 			},
    // 			{
    // 				lightness: 45
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				visibility: 'simplified'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'geometry.fill',
    // 		stylers: [
    // 			{
    // 				lightness: '-22'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'geometry.stroke',
    // 		stylers: [
    // 			{
    // 				saturation: '-51'
    // 			},
    // 			{
    // 				lightness: '11'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'labels.text',
    // 		stylers: [
    // 			{
    // 				saturation: '3'
    // 			},
    // 			{
    // 				lightness: '-56'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'labels.text.fill',
    // 		stylers: [
    // 			{
    // 				lightness: '-52'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'labels.text.stroke',
    // 		stylers: [
    // 			{
    // 				weight: '6.13'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.highway',
    // 		elementType: 'labels.icon',
    // 		stylers: [
    // 			{
    // 				weight: '1.24'
    // 			},
    // 			{
    // 				saturation: '-100'
    // 			},
    // 			{
    // 				lightness: '-10'
    // 			},
    // 			{
    // 				gamma: '0.94'
    // 			},
    // 			{
    // 				visibility: 'off'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.arterial',
    // 		elementType: 'geometry',
    // 		stylers: [
    // 			{
    // 				lightness: '-16'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.arterial',
    // 		elementType: 'labels.text.fill',
    // 		stylers: [
    // 			{
    // 				saturation: '-41'
    // 			},
    // 			{
    // 				lightness: '-41'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.arterial',
    // 		elementType: 'labels.text.stroke',
    // 		stylers: [
    // 			{
    // 				weight: '5.46'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.arterial',
    // 		elementType: 'labels.icon',
    // 		stylers: [
    // 			{
    // 				visibility: 'off'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.local',
    // 		elementType: 'geometry.fill',
    // 		stylers: [
    // 			{
    // 				lightness: '-16'
    // 			},
    // 			{
    // 				weight: '0.72'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'road.local',
    // 		elementType: 'labels.text.fill',
    // 		stylers: [
    // 			{
    // 				lightness: '-37'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'transit',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				visibility: 'off'
    // 			}
    // 		]
    // 	},
    // 	{
    // 		featureType: 'water',
    // 		elementType: 'all',
    // 		stylers: [
    // 			{
    // 				color: '#b7e4f4'
    // 			},
    // 			{
    // 				visibility: 'on'
    // 			}
    // 		]
    // 	}
    // ]
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  geocoder = new google.maps.Geocoder();

  //Init Variables
  infoWindow = new google.maps.InfoWindow({
    disableAutoPan: false,
    maxWidth: 500,
    zIndex: 1001
  });

  userMarker = new google.maps.Marker();
  selectedMarker = new google.maps.Marker();

  markers = cachedPins.map(cachedPin => {
    return new google.maps.Marker({
      position: cachedPin.geometry,
      icon: {
        url: episimosIconUrl,
        scaledSize: new google.maps.Size(50, 50),
        origin: new google.maps.Point(0, 0)
      },
      clickable: true,
      title: cachedPin.properties.name,
      cursor: 'pointer',
      animation: google.maps.Animation.DROP,
      visible: true,
      props: cachedPin.properties
    });
  });
  markerClusterer = new MarkerClusterer(map, markers, {
    styles: [
      {
        url: markerClustererIcon,
        width: 53,
        height: 52,
        anchorText: [20, 0],
        textColor: '#fff',
        textSize: 11,
        fontWeight: 'bold'
      }
    ],
    // imagePath:
    // 	'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    averageCenter: true,
    zoomOnClick: false,
    //minimumClusterSize: 3,
    maxZoom: maxZoomClusterer,
    gridSize: gridSizesDependedOnZoom[startZoom], //default=60,
    ignoreHidden: true
  });

  markers.forEach(marker => {
    marker.addListener('mouseover', () => {
      // if (selectedMarker === marker) return;
      // if (selectedMarker) {
      //   selectedMarker.setAnimation(null);
      // }
      // selectedMarker = marker;
      // selectedMarker.setAnimation(google.maps.Animation.BOUNCE);

      marker.setIcon({
        ...marker.getIcon(),
        scaledSize: new google.maps.Size(52, 52),
        origin: new google.maps.Point(2, 0)
      });
    });
    // marker.addListener('mouseover', () => {
    // 	if (selectedMarker === marker) return;
    // 	if (selectedMarker) {
    // 		selectedMarker.setAnimation(null);
    // 	}
    // 	selectedMarker = marker;
    // 	selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
    // 	openInfoWindow(marker);
    // });

    marker.addListener('click', () => {
      map.setZoom(searchZoom);
      map.setCenter(marker.position);

      if (selectedMarker === marker) return;
      if (selectedMarker) {
        selectedMarker.setAnimation(null);
      }
      selectedMarker = marker;
      selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
      openInfoWindow(marker);
    });

    //Optional
    marker.addListener('mouseout', e => {
      marker.setIcon({
        ...marker.getIcon(),
        scaledSize: new google.maps.Size(50, 50),
        origin: new google.maps.Point(0, 0)
      });
    });
    // marker.addListener('mouseout', e => {
    // 	infoWindow.close();
    // 	if (selectedMarker) {
    // 		selectedMarker.setAnimation(null);
    // 	}
    // 	selectedMarker = null;
    // });
  });

  map.addListener('click', e => {
    infoWindow.close();
    if (selectedMarker) {
      selectedMarker.setAnimation(null);
    }
    selectedMarker = null;
    // const [lat, lng] = [e.latLng.lat().toFixed(2), e.latLng.lng().toFixed(2)];
    // console.log(`You clicked at: (${lat}, ${lng})`);
  });

  map.addListener('zoom_changed', () => {
    let currentZoom = map.getZoom();
    //console.log('current zoom', currentZoom);
    if (currentZoom > maxZoomClusterer) return;
    markerClusterer.setGridSize(gridSizesDependedOnZoom[currentZoom]);
  });

  google.maps.event.addListener(markerClusterer, 'clusterclick', cluster => {
    infoWindow.close();
    if (selectedMarker) {
      selectedMarker.setAnimation(null);
    }
    selectedMarker = null;
    map.setZoom(zoomLevelsDependedOnZoom[map.getZoom()]);
    //map.setZoom(map.getZoom() + 2);
    map.setCenter(cluster.getCenter());
  });

  google.maps.event.addListener(markerClusterer, 'mouseover', cluster => {
    infoWindow.close();
    if (selectedMarker) {
      selectedMarker.setAnimation(null);
    }
    selectedMarker = null;
    let label = cluster.clusterIcon_.div_.querySelector('span');
    label.classList.add('cluster-hover');
    cluster.clusterIcon_.div_.classList.add('grow');
  });
  google.maps.event.addListener(markerClusterer, 'mouseout', cluster => {
    let label = cluster.clusterIcon_.div_.querySelector('span');
    label.classList.remove('cluster-hover');
    cluster.clusterIcon_.div_.classList.add('grow');
  });

  infoWindow.addListener('closeclick', () => {
    if (selectedMarker) {
      selectedMarker.setAnimation(null);
    }
    selectedMarker = null;
  });

  userMarker.addListener('click', () => {
    console.log('userMarker clicked');
    map.setZoom(searchZoom);
    map.setCenter(userMarker.position);
  });
}

function startLoader() {
  document.querySelector('.lds-roller').classList.remove('hide-roller');
}
function endLoader() {
  document.querySelector('.lds-roller').classList.add('hide-roller');
}

function openInfoWindow(marker) {
  infoWindowDiv = document.createElement('div');
  infoWindowDiv.className = 'infoWindow infoWindow-open';

  const markerProps = marker.props;

  const photosContainer = preparePhotos(markerProps.imgs);
  if (markerProps.imgs.length > 1) {
    prepareSlideshow(photosContainer);
  }
  if (markerProps.imgs.length) {
    prepareModal(photosContainer, markerProps);
  }
  prepareInformation(markerProps);

  infoWindow.setContent(infoWindowDiv);
  infoWindow.setPosition(selectedMarker.position);
  infoWindow.setOptions({
    pixelOffset: new google.maps.Size(0, -60)
  });
  infoWindow.open(map);
}

function prepareInformation(markerProps) {
  let nameHtml = `
      <div class='info-name-value-container'>
				<div class='info-name-value'>
				${markerProps.name}
				</div>
			</div>
      <div class='lovato-icon-header'>
        <svg class="svg-lovato-icon-header" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250"><path d="M93.76,93.83a44.33,44.33,0,1,1,62.77,62.62C139.18,173.66,38.9,245.31,21.69,228,4.34,210.75,76.41,111,93.76,93.83" fill="#ffffff"/><path d="M125.07,7c65,0,118.05,53.17,118.05,118.19s-53,117.91-118,117.91H68.94l3.67-1.69,5.64-3,5.79-3,5.77-3.24,5.79-3.38,5.78-3.53,5.78-3.53,5.64-3.67,5.64-3.66,5.5-3.67,5.5-3.67,5.23-3.66,5.07-3.53,4.8-3.53,4.65-3.38,4.23-3.38,4.09-3.11,3.81-3,3.39-2.82,3.1-2.68,2.82-2.54,2.54-2.39,2.39-2.55,2.26-2.53,2.12-2.82,2-2.68,1.69-3,1.7-3,1.41-3,1.41-3.1,1.12-3.1,1-3.11.85-3.1.7-3.24.57-3.25.42-3.25.14-3.24.14-3.1-.14-3.25-.14-3.24-.42-3.24-.57-3.24-.7-3.11-.85-3.25-1-3.09-1.12-3.11-1.41-3.1-1.41-3-1.7-3-1.69-2.82-2-2.82-2.12-2.69-2.26-2.68-2.39-2.53-2.54-2.4-2.54-2.26-2.82-2.12-2.68-1.83-3-1.83-3-1.69-3-1.41-3.1-1.41L147.5,61l-3.1-1-3.11-.85-3.24-.7-3.25-.56-3.24-.42-3.24-.15-3.25-.14-3.24.14-3.24.15-3.25.42-3.25.56-3.1.7-3.24.85-3.1,1L99.54,62.1l-3.1,1.41-3,1.41-3,1.69L87.7,68.44l-2.82,1.83L82.2,72.39l-2.68,2.26L77,77.05l-2.4,2.53-2.53,2.83-2.55,3.1-2.82,3.38-3.1,3.81-3.1,4L57.23,101l-3.52,4.52-3.53,4.93-3.52,4.94L43,120.62l-3.67,5.23-3.81,5.5L31.85,137l-3.67,5.78-3.52,5.64-3.53,5.78L17.74,160l-3.24,5.78-3.1,5.64-2.83,5.78-1.69,3.25V125.14C6.88,60.12,59.92,7,125.07,7" fill="#ffffff"/></svg>
      </div>
		</div>`;

  const infoNameContainerEl = document.createElement('div');
  infoNameContainerEl.className = 'info-name-container';
  infoNameContainerEl.innerHTML = nameHtml;
  infoWindowDiv.append(infoNameContainerEl);

  const remainingHtml = `
		<div class='info-body-container'>
      <div class='info-information'>
        <div class='info-address info-line'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.4 16.55"><path d="M1.45,9.84,6.2,16.2,11,9.84a5.93,5.93,0,0,0-.56-7.75h0A6,6,0,0,0,2,2.09H2A5.94,5.94,0,0,0,1.45,9.84Z" fill="#565656"/><circle cx="6.2" cy="6.17" r="1.86" fill="#fff"/></svg>
          <div class='info-address-value'>
					${markerProps.address}
          </div>
        </div>

        <div class='info-phone info-line'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.32 13.46"><path d="M12.76,12l-.92.92a1.66,1.66,0,0,1-.67.27A10.88,10.88,0,0,1,3.36,10,10.93,10.93,0,0,1,.16,2.2a1.88,1.88,0,0,1,.27-.64L1.36.64A1.52,1.52,0,0,1,2.8.3L3,.36a1.82,1.82,0,0,1,1,1.12l.47,1.71a1.72,1.72,0,0,1-.38,1.46l-.62.62A6.56,6.56,0,0,0,8.13,9.88l.62-.62a1.65,1.65,0,0,1,1.46-.38l1.71.47A1.85,1.85,0,0,1,13,10.4l.06.2A1.55,1.55,0,0,1,12.76,12Z" fill="#565656"/></svg>
          <a class='info-phone-value'
            href="tel:${markerProps.phone}">${markerProps.phone}
          </a>
        </div>

        <div class='info-email info-line'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
          <a class='info-email-value'
            href="mailto: ${markerProps.email}">${markerProps.email}
          </a>
        </div>

        <div class='info-website info-line'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.32 13.46"><polygon points="12.98 5.26 0.34 0.41 5.19 13.05 7.08 9.04 10.8 12.76 12.69 10.87 8.97 7.15 12.98 5.26" fill="#565656"/></svg>
          <a class='info-website-value'
            target='_blank'
            href='http://www.${markerProps.website}'>
            ${markerProps.website}
          </a>
        </div>
      </div>
      <hr>
			<div class='info-services'>
        <div class='info-services-header'>
          Υπηρεσίες
        </div>
				<div class='info-lovatoSystems info-line'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.77 18.76"><path d="M7,7a3.37,3.37,0,0,1,4.77,4.76c-1.32,1.31-8.94,6.75-10.24,5.43S5.69,8.32,7,7" fill="#00679c"/><path d="M9.39.41a9,9,0,1,1,0,17.94H5.13l.28-.13L5.83,18l.44-.23.44-.24.44-.26L7.59,17,8,16.73l.43-.28.43-.27.42-.28.41-.28.4-.28.39-.27.36-.27.35-.25.33-.26.31-.24.29-.22.25-.22.24-.2.21-.19.2-.18.18-.2.17-.19.16-.21.15-.21.13-.22.13-.23.1-.22.11-.24.09-.23.07-.24.07-.24.05-.24,0-.25,0-.25v-1l0-.25,0-.24-.05-.24-.07-.25-.07-.23-.09-.24-.11-.23L14,7l-.13-.22-.13-.22-.15-.21-.16-.21-.17-.2-.18-.19-.2-.18-.19-.18-.21-.16-.21-.14L12,4.94l-.23-.12-.22-.11-.24-.11-.23-.08-.24-.08-.24-.06-.24-.06-.25,0-.25,0h-1l-.25,0-.24,0-.24.06-.25.06-.23.08-.24.08-.23.11L7,4.82l-.22.12-.22.14-.21.14-.21.16-.2.18-.19.18-.18.19-.2.21-.19.24L5,6.64l-.24.29-.24.3-.24.33L4,7.9l-.27.38-.27.37-.27.4-.28.4-.29.41-.28.43L2,10.73l-.27.43-.27.44L1.24,12,1,12.48l-.24.43-.21.44-.13.24V9.39a9,9,0,0,1,9-9" fill="#00679c"/></svg>
					<div class='info-lovatoSystems-value'>
            Γνήσια Συστήματα Lovato
          </div>
				</div>

				<div class='info-gogasTanks info-line'>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.77 18.76"><path d="M18,8.77H11.46l-.06-.2v0s0,0-.06-.09a2,2,0,0,0-.22-.37L11,7.91a2.59,2.59,0,0,0-.35-.31l-.11-.07a2.11,2.11,0,0,0-.43-.2l-.15,0a2.17,2.17,0,0,0-1,0,2.29,2.29,0,0,0-.37.12h0a2.18,2.18,0,1,0,2.64,3.23.41.41,0,0,1,.05-.09,2,2,0,0,0,.18-.32l.08-.18h1.67l-.1.38a3.81,3.81,0,1,1-.38-2.93h5.1A8.64,8.64,0,1,0,18,9.38C18,9.17,18,9,18,8.77Z" fill="#00679c"/></svg>
					<div class='info-gogasTanks-value'>
						Νέες Δεξαμενές GO-GAS
					</div>
				</div>

				<div class='info-webServices info-line'>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.77 18.76"><path d="M16.39,2h-14A1.45,1.45,0,0,0,.94,3.43v8.65a1.45,1.45,0,0,0,1.44,1.44H8v1.3H6.87a1,1,0,1,0,0,1.95h5a1,1,0,0,0,0-1.95H10.77v-1.3h5.62a1.44,1.44,0,0,0,1.44-1.44V3.43A1.44,1.44,0,0,0,16.39,2Zm-.23,9.36a.5.5,0,0,1-.5.5H3.11a.51.51,0,0,1-.5-.5V4.16a.51.51,0,0,1,.5-.5H15.66a.5.5,0,0,1,.5.5Z" fill="#00679c"/><rect x="3.84" y="4.74" width="11.01" height="6.06" rx="0.3" fill="#00679c"/></svg>
					<div class='info-webServices-value'>
						Ηλεκτρονικό Βιβλίο Service
					</div>
				</div>

				<div class='info-lovatoApp info-line'>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.77 18.76"><rect x="5.37" y="3.58" width="8.03" height="11.19" fill="#00679c"/><path d="M13.71.94H5.06A1.44,1.44,0,0,0,3.62,2.38v14a1.45,1.45,0,0,0,1.44,1.45h8.65a1.44,1.44,0,0,0,1.44-1.45v-14A1.43,1.43,0,0,0,13.71.94Zm-6,.67H11a.25.25,0,1,1,0,.5H7.73a.25.25,0,0,1,0-.5ZM9.39,17.37a.72.72,0,1,1,.71-.72A.72.72,0,0,1,9.39,17.37Zm4.76-2.15a.29.29,0,0,1-.3.3H4.92a.3.3,0,0,1-.3-.3V3.13a.3.3,0,0,1,.3-.3h8.93a.29.29,0,0,1,.3.3Z" fill="#00679c"/></svg>
					<div class='info-lovatoApp-value'>
						Εφαρμογή Lovato App
					</div>
				</div>

				<div class='info-gogasGuarantee info-line'>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.77 18.76"><path d="M9.39,3.46a5.92,5.92,0,1,0,5.92,5.92A5.93,5.93,0,0,0,9.39,3.46Zm-1.33,8.4H6.83V8.15l-.94.35-.35-1,1.74-.66h.78Zm4.65-.58A2.16,2.16,0,0,1,11,12a2.18,2.18,0,0,1-1.7-.69,2.75,2.75,0,0,1-.62-1.9,2.75,2.75,0,0,1,.62-1.9,2.15,2.15,0,0,1,1.7-.7,2.16,2.16,0,0,1,1.7.69,2.77,2.77,0,0,1,.61,1.91A2.73,2.73,0,0,1,12.71,11.28Z" fill="#00679c"/><path d="M11,7.92a.93.93,0,0,0-.78.38,1.8,1.8,0,0,0-.29,1.08,1.75,1.75,0,0,0,.29,1.07,1,1,0,0,0,1.56,0,1.82,1.82,0,0,0,.28-1.07,1.87,1.87,0,0,0-.28-1.08A.93.93,0,0,0,11,7.92Z" fill="#00679c"/><path d="M17.78,8.26a1.85,1.85,0,0,0-.94-2.9,1.85,1.85,0,0,1-1.33-1.82,1.84,1.84,0,0,0-2.46-1.79,1.85,1.85,0,0,1-2.14-.7,1.86,1.86,0,0,0-3,0h0a1.85,1.85,0,0,1-2.14.7A1.85,1.85,0,0,0,3.26,3.54,1.86,1.86,0,0,1,1.94,5.36,1.85,1.85,0,0,0,1,8.26a1.87,1.87,0,0,1,0,2.25,1.84,1.84,0,0,0,.94,2.89,1.86,1.86,0,0,1,1.32,1.82A1.84,1.84,0,0,0,5.72,17a1.86,1.86,0,0,1,2.14.7h0a1.85,1.85,0,0,0,3.05,0,1.86,1.86,0,0,1,2.14-.7,1.84,1.84,0,0,0,2.46-1.79,1.85,1.85,0,0,1,1.33-1.82,1.84,1.84,0,0,0,.94-2.89A1.85,1.85,0,0,1,17.78,8.26ZM9.39,16.05a6.67,6.67,0,1,1,6.67-6.67A6.68,6.68,0,0,1,9.39,16.05Z" fill="#00679c"/></svg>
					<div class='info-gogasGuarantee-value'>
						Γραπτή 10ετής εγγύηση δεξαμενής
					</div>
				</div>
			</div>
      <hr class='info-customServices-hr'>
			<div class='info-customServices'>
	      <div class='info-customServices-header'>
	        Ειδικές Υπηρεσίες Συνεργείου
	      </div>
				<div class='info-customService1 info-line'>

					<div class='info-customService-value'>
	          ${markerProps.customServices[0]}
	        </div>
				</div>

				<div class='info-customService2 info-line'>

					<div class='info-customService-value'>
						${markerProps.customServices[1]}
					</div>
				</div>

				<div class='info-customService3 info-line'>

					<div class='info-customService-value'>
						${markerProps.customServices[2]}
					</div>
				</div>
			</div>
		</div>

	  <div class="google-directions-container">
	    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.86 13.85"><rect x="2.94" y="2.94" width="7.97" height="7.97" transform="translate(6.93 -2.87) rotate(45)" fill="#878787"/><polygon points="10.47 6.89 8.21 4.63 8.21 6.18 4.54 6.18 4.54 7.43 4.54 7.59 4.54 9.14 5.96 9.14 5.96 7.59 8.21 7.59 8.21 9.15 10.47 6.89" fill="#fff"/></svg>
	    <div class='google-directions-value'>
	      Οδηγίες <span>(άνοιγμα στο Google Maps)</span>
	    </div>
	  </div>
	`;
  let remainingEl = document.createElement('div');
  remainingEl.innerHTML = remainingHtml;

  infoWindowDiv.append(remainingEl);

  //Google Directions
  let markerGeometry = [selectedMarker.getPosition().lat(), selectedMarker.getPosition().lng()];

  infoWindowDiv
    .querySelector('.google-directions-container')
    .addEventListener('click', async () => {
      const currentLatLng = await getCurrentPosition();
      console.log(currentLatLng);
      let url = `https://www.google.com/maps?saddr=${currentLatLng[0]},${currentLatLng[1]}&daddr=${markerGeometry}`;
      window.open(url, '_blank');
    });

  //styles when there is no img
  if (!markerProps.imgs.length) {
    let infoNameContainer = infoWindowDiv.querySelector('.info-name-container');
    infoNameContainer.style.position = 'static';
    infoNameContainer.style.borderTopLeftRadius = '5px';
    infoNameContainer.style.borderTopRightRadius = '5px';
    infoWindowDiv.querySelector('.info-body-container').style.marginTop = '1rem';
    let lovatoIconHeader = infoWindowDiv.querySelector('.lovato-icon-header');
    lovatoIconHeader.style.bottom = '-25%';
    lovatoIconHeader.style.width = '5rem';
    lovatoIconHeader.style.height = '5rem';
    infoWindowDiv.querySelector('.svg-lovato-icon-header').style.marginLeft = '1px';
    infoWindowDiv.querySelector('.photos-container').style.width = '500px';
  }

  //Information
  const infoEmailEl = infoWindowDiv.querySelector('.info-email');
  const infoAddressEl = infoWindowDiv.querySelector('.info-address');
  const infoPhoneEl = infoWindowDiv.querySelector('.info-phone');
  const infoWebsiteEl = infoWindowDiv.querySelector('.info-website');
  if (!markerProps.email) {
    infoEmailEl.style.display = 'none';
  } else {
    infoEmailEl.style.display = 'flex';
    infoEmailEl.lastElementChild.textContent = markerProps.email;
  }
  if (!markerProps.address) {
    infoAddressEl.style.display = 'none';
  } else {
    infoAddressEl.style.display = 'flex';
    infoAddressEl.lastElementChild.textContent = markerProps.address;
  }
  if (!markerProps.phone) {
    infoPhoneEl.style.display = 'none';
  } else {
    infoPhoneEl.style.display = 'flex';
    let phoneValue = markerProps.phone;
    if (phoneValue.length >= 7) {
      let temp = [...phoneValue];
      temp.splice(6, 0, ' ');
      phoneValue = temp.join('');
    }
    if (phoneValue.length >= 3) {
      let temp = [...phoneValue];
      temp.splice(2, 0, ' ');
      phoneValue = temp.join('');
    }
    infoPhoneEl.lastElementChild.textContent = phoneValue;
  }
  if (!markerProps.website) {
    infoWebsiteEl.style.display = 'none';
  } else {
    infoWebsiteEl.style.display = 'flex';
    infoWebsiteEl.lastElementChild.textContent = markerProps.website;
  }

  //Services
  const infoLovatoSystemsEl = infoWindowDiv.querySelector('.info-lovatoSystems');
  const infoGogasTanksEl = infoWindowDiv.querySelector('.info-gogasTanks');
  const infoWebServicesEl = infoWindowDiv.querySelector('.info-webServices');
  const infolovatoAppEl = infoWindowDiv.querySelector('.info-lovatoApp');
  const infoGogasGuaranteeEl = infoWindowDiv.querySelector('.info-gogasGuarantee');
  const infoCustomService1 = infoWindowDiv.querySelector('.info-customService1');
  const infoCustomService2 = infoWindowDiv.querySelector('.info-customService2');
  const infoCustomService3 = infoWindowDiv.querySelector('.info-customService3');
  infoLovatoSystemsEl.style.display = markerProps.lovatoServices.lovatoSystems ? 'flex' : 'none';
  infoGogasTanksEl.style.display = markerProps.lovatoServices.gogasTanks ? 'flex' : 'none';
  infoWebServicesEl.style.display = markerProps.lovatoServices.webServices ? 'flex' : 'none';
  infolovatoAppEl.style.display = markerProps.lovatoServices.lovatoApp ? 'flex' : 'none';
  infoGogasGuaranteeEl.style.display = markerProps.lovatoServices.gogasGuarantee ? 'flex' : 'none';
  infoCustomService1.style.display = markerProps.customServices[0] ? 'flex' : 'none';
  infoCustomService2.style.display = markerProps.customServices[1] ? 'flex' : 'none';
  infoCustomService3.style.display = markerProps.customServices[2] ? 'flex' : 'none';

  //Custom Services
  customServicesDisplay(markerProps);
}

function customServicesDisplay(markerProps) {
  if (
    markerProps.customServices[0] ||
    markerProps.customServices[1] ||
    markerProps.customServices[2]
  ) {
    infoWindowDiv.querySelector('.info-customServices').style.display = 'block';
    infoWindowDiv.querySelector('.info-customServices-hr').style.display = 'block';
  } else {
    infoWindowDiv.querySelector('.info-customServices').style.display = 'none';
    infoWindowDiv.querySelector('.info-customServices-hr').style.display = 'none';
  }
}

function preparePhotos(markerImgs) {
  const photosContainer = document.createElement('div');
  photosContainer.className = 'photos-container';

  let photosHtml = ``;
  let imgElement;
  markerImgs.forEach(markerImg => {
    imgElement = insertImgToDOM(markerImg);
    photosHtml += `
			<div class='info-image'>
				${imgElement.firstElementChild.outerHTML}
			</div>
			`;
  });
  photosContainer.innerHTML = photosHtml;
  infoWindowDiv.append(photosContainer);
  return photosContainer;
}

function insertImgToDOM(img) {
  const imgHtml = `<img src="${img.url}"/>`;

  const newImgElement = document.createElement('div');
  newImgElement.className = 'uploaded-img';
  newImgElement.innerHTML = imgHtml;

  return newImgElement;

  // function bufferToBase64(buf) {
  // 	var binstr = Array.prototype.map
  // 		.call(buf, function (ch) {
  // 			return String.fromCharCode(ch);
  // 		})
  // 		.join('');
  // 	return btoa(binstr);
  // }
}
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function prepareSlideshow(photosDiv) {
  slideIndex = 1;
  let slideshowHtml = `
  <div class='slideshow-container'>
  <div class='slideshow-left'>&#10094;</div>
  <div class='slideshow-dots'>`;

  const allImgs = photosDiv.querySelectorAll('.info-image');
  for (let i = 0; i < allImgs.length; i++) {
    slideshowHtml += `<span class="slideshow-dot"></span>`;
  }

  slideshowHtml += `
			</div>
			<div class='slideshow-right'>&#10095;</div>
		</div>`;
  photosDiv.innerHTML += slideshowHtml;

  showDivs(slideIndex, photosDiv);

  photosDiv
    .querySelector('.slideshow-left')
    .addEventListener('click', () => plusDivs(-1, photosDiv));
  photosDiv
    .querySelector('.slideshow-right')
    .addEventListener('click', () => plusDivs(1, photosDiv));

  const dots = photosDiv.getElementsByClassName('slideshow-dot');
  for (let i = 0; i < dots.length; i++) {
    dots[i].addEventListener('click', () => currentDiv(i + 1, photosDiv));
    dots[i].addEventListener('mouseover', () => currentDiv(i + 1, photosDiv));
  }
}
function plusDivs(n, photosDiv) {
  showDivs((slideIndex += n), photosDiv);
}

function currentDiv(n, photosDiv) {
  showDivs((slideIndex = n), photosDiv);
}

function showDivs(n, photosDiv) {
  let i;
  const images = photosDiv.querySelectorAll('.info-image');
  const dots = photosDiv.getElementsByClassName('slideshow-dot');
  if (n > images.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = images.length;
  }
  for (i = 0; i < images.length; i++) {
    images[i].style.display = 'none';
    images[i].classList.remove('current-image');
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(' slideshow-dot-white', '');
  }
  images[slideIndex - 1].style.display = 'block';
  images[slideIndex - 1].classList.add('current-image');
  dots[slideIndex - 1].className += ' slideshow-dot-white';
}

document.addEventListener('keydown', e => {
  const key = e.key;
  if (key === 'ArrowRight') {
    const photosContainer = infoWindowDiv.querySelector('.photos-container');
    if (!photosContainer) return;
    if (photosContainer.querySelector('.slideshow-container')) plusDivs(1, photosContainer);
  }
  if (key === 'ArrowLeft') {
    const photosContainer = infoWindowDiv.querySelector('.photos-container');
    if (!photosContainer) return;
    if (photosContainer.querySelector('.slideshow-container')) plusDivs(-1, photosContainer);
  }
  if (key === 'Enter') {
    // e.preventDefault();
    // if (!document.querySelectorAll('.uploaded-img img').length) return;
    // document.querySelector('.info-modal').style.display = 'block';
    // document.querySelector(
    // 	'.info-modal-image'
    // ).src = infoWindowDiv.querySelector(
    // 	'.current-image'
    // ).firstElementChild.src;
    // document.querySelector('.info-modal-caption').textContent =
    // 	workerElements.name.value;
  }
  if (key === 'Escape') {
    if (document.querySelector('.info-modal').style.display === 'block')
      document.querySelector('.info-modal').style.display = 'none';
  }
});

function generateInitHtml() {
  //Generate Modal Html
  const modalEl = document.createElement('div');
  modalEl.innerHTML = `<div class="info-modal">
			<span class="info-modal-close">&times;</span>
			<img class="info-modal-image" />
			<div class="info-modal-caption"></div>
		</div>`;

  document.body.append(modalEl);
  // document.querySelector('#map').append(modalEl); //test!!

  //Generate Loader Html
  const loaderEl = document.createElement('div');
  loaderEl.className = 'lds-roller hide-roller';
  // loaderEl.innerHTML = `<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>`;
  loaderEl.innerHTML = `<img src='https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6066396962c725d882040aba_Ripple-2s-800px.svg' alt='loading...'/>`;

  document.querySelector('#map').parentElement.prepend(loaderEl);
}

function prepareModal(photosContainer, markerProps) {
  const allImages = photosContainer.querySelectorAll('.info-image');
  const modal = document.querySelector('.info-modal');
  const modalImage = document.querySelector('.info-modal-image');
  const modalCaption = document.querySelector('.info-modal-caption');

  allImages.forEach(image => {
    image.addEventListener('click', () => {
      modal.style.display = 'block';
      modalImage.src = image.firstElementChild.src;
      modalCaption.textContent = markerProps.name;
    });
  });
  //close modal
  modal.onclick = e => {
    if (e.target !== modalImage && e.target !== modalCaption) modal.style.display = 'none';
  };
}

//Map UI
function initDOMEvents() {
  document.querySelector('#mapForm').addEventListener('submit', e => e.preventDefault());
  document.querySelector('#searchBtn').type = 'button';

  //Autocomplete
  const autocompleteOptions = {
    componentRestrictions: { country: 'gr' },
    fields: ['geometry']
  };

  const autocompleteInput = document.querySelector('#searchInput');
  const autoComplete = new google.maps.places.Autocomplete(autocompleteInput, autocompleteOptions);

  //Listeners
  autoComplete.addListener('place_changed', async () => {
    let searchPosition;
    const place = autoComplete.getPlace();
    console.log(place);

    if (Object.keys(place).length === 1) {
      console.log('handling with geocoder for unknown or enter');
      try {
        const res = await geocoderSolution(autocompleteInput.value);
        console.log('res', res);
        autocompleteInput.value = res.address;
        searchPosition = res.location;
      } catch (e) {
        console.log(e);
        return;
      }
    } else searchPosition = place.geometry.location;

    userMarker.setOptions({
      map,
      title: autocompleteInput.value,
      position: searchPosition,
      animation: google.maps.Animation.DROP,
      zIndex: google.maps.Marker.MAX_ZINDEX
    });
    map.setZoom(searchZoom);
    map.setCenter(userMarker.position);
  });

  //Search Icon click
  google.maps.event.addDomListener(document.querySelector('#searchBtn'), 'click', async e => {
    try {
      console.log('test', e.target);
      const address = document.querySelector('#searchInput').value;
      const res = await geocoderSolution(address);
      console.log(res);
      address.value = res.address;

      userMarker.setOptions({
        map,
        title: autocompleteInput.value,
        position: res.location,
        animation: google.maps.Animation.DROP,
        zIndex: google.maps.Marker.MAX_ZINDEX
      });
      map.setZoom(searchZoom);
      map.setCenter(userMarker.position);
    } catch (e) {
      console.log('error on geocoding', e);
    }

    //automatic scroll to #map
  });

  //Geolocation Btn Click
  document.querySelectorAll('.my-location-btn').forEach(el => {
    google.maps.event.addDomListener(el, 'click', async () => {
      try {
        const currentLatLng = await getCurrentPosition();
        const myLatLng = {
          lat: currentLatLng[0],
          lng: currentLatLng[1]
        };

        userMarker.setOptions({
          position: myLatLng,
          map: map,
          title: 'Είστε εδώ',
          animation: google.maps.Animation.DROP,
          zIndex: google.maps.Marker.MAX_ZINDEX
        });

        console.log(`Accuracy ${currentLatLng[2]} meters.`);
        map.setZoom(searchZoom);
        map.setCenter(userMarker.position);
      } catch (e) {
        alert(
          'Για να χρησιμοποιήσετε την υπηρεσία της εύρεσης των κοντινότερων συνεργείων, χρειάζεται να επιτρέψετε την εύρεση τοποθεσίας για το παρών site από τις ρυθμίσεις του περιηγητή σας και να ξαναπροσπαθήσετε! Για το Google Chrome πηγαίνετε στο: chrome://settings/content/location'
        );
      }
    });
  });

  initFilters();
}

async function geocoderSolution(address) {
  return new Promise((resolve, reject) => {
    if (!address) {
      alert('Παρακαλώ προσθέστε μια περιοχή!');
      reject('Παρακαλώ προσθέστε μια περιοχή!');
      return;
    }
    geocoder.geocode(
      {
        address: address,
        componentRestrictions: {
          country: 'gr'
        }
      },
      (results, status) => {
        if (status === 'OK') {
          console.log('geocoding for', address);
          console.log('geocoder address result', results[0].formatted_address);
          resolve({
            location: results[0].geometry.location,
            address: results[0].formatted_address
          });
        } else {
          alert('Συγγνώμη, δεν βρέθηκε τέτοια περιοχή. Ξαναπροσπαθήστε!');
          reject('Δε βρέθηκε τέτοια περιοχή! Προσπαθήστε ξανά.');
          return;
        }
      }
    );
  });
}

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

function initFilters() {
  //Fitlers
  document
    .querySelectorAll('#filterForm input')
    .forEach(el => el.addEventListener('change', filterMarkers));

  document.querySelector('#resetFiltersBtn').addEventListener('click', e => {
    document.querySelectorAll('.f-label .w--redirected-checked').forEach(label => {
      label.classList.remove('w--redirected-checked');
      label.nextElementSibling.checked = false;
    });
    filterMarkers();
  });
}

function filterMarkers() {
  const labels = document.querySelectorAll('#filterForm .f-label');
  const checkedLabels = [...labels].filter(l => l.querySelector('input').checked);

  if (!checkedLabels.length) markers.map(m => m.setVisible(true));
  else markers.map(m => m.setVisible(setMarkerVisibility(m, labels)));

  markerClusterer.repaint();

  counter = 0;
  markers.forEach(marker => {
    if (marker.getVisible()) {
      counter++;
    }
  });
  console.log({ counter });
  infoWindow.close();
  if (selectedMarker) selectedMarker.setAnimation(null);
  selectedMarker = null;
}

function setMarkerVisibility(marker, labels) {
  for (let label of labels) {
    if (label.querySelector('input').checked && !marker.props.lovatoServices[label.id])
      return false;
  }
  return true;
}

async function urlParamsConfig() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let gps, filters;
  if (urlParams.has('gps')) {
    gps = urlParams.get('gps');
    const searchInput = document.querySelector('#searchInput');
    try {
      const res = await geocoderSolution(gps);
      console.log(res);

      searchInput.value = res.address;
      userMarker.setOptions({
        map,
        title: searchInput.value,
        position: res.location,
        animation: google.maps.Animation.DROP,
        zIndex: google.maps.Marker.MAX_ZINDEX
      });
      map.setZoom(searchZoom);
      map.setCenter(userMarker.position);
    } catch (e) {
      console.log('error on params geocoding', e);
    }
  }
  if (urlParams.has('filters')) {
    filters = urlParams.get('filters').split(',');
    filters = filters.map(f => parseInt(f));
    filters = [...new Set(filters)];

    if (filters.some(f => !Number(f) || f < 1 || f > 5))
      return console.log('Not valid filters query');

    const labels = document.querySelectorAll('.f-label div');
    filters.forEach(filter => {
      labels[filter - 1].classList.add('w--redirected-checked');
      labels[filter - 1].nextElementSibling.checked = true;
    });
    filterMarkers();
  }
}
