/* System Identification */
const baseUrl = location.origin;
const mapUrl = '/stores';
const urlYears = 'https://lovatohellas.herokuapp.com/vehicleDB/get/years';
const urlModels = 'https://lovatohellas.herokuapp.com/vehicleDB/get/models';
const urlDescriptions = 'https://lovatohellas.herokuapp.com/vehicleDB/get/descriptions';
const urlFuelPrices = 'https://lovatohellas.herokuapp.com/fuelPrices';
const downloadSummaryUrl = 'https://lovatohellas.herokuapp.com/summaries/system';
// const downloadSummaryUrl = 'http://localhost:1917/summaries/system';
const emailSummaryUrl = 'https://lovatohellas.herokuapp.com/summaries/email/system';
// const emailSummaryUrl = 'http://localhost:1917/summaries/email/system';
const mapBaseUrl = baseUrl + mapUrl;
const numPlaceUrl = 'https://lovatohellas.herokuapp.com/map/pins/numPlace';
const closestUrl = 'https://lovatohellas.herokuapp.com/map/pins/closest';
const urlContactForm = 'https://lovatohellas.herokuapp.com/contact/';
const baseDateUrl = 'https://lovatohellas.herokuapp.com/lottery/base-date';

let fetchedYears;
let fetchedModels;
let fetchedModelObj;
let foundVehicleObj;
let suggestedPricesChanges = [];
let userSelections = { selectedFuel: 'lpg', vehicle: {}, calculator: {}, easyPay: {} };
let userInfo = { username: '', email: '', phone: '' };
const preferredStorage = localStorage;
//one week and one hour
const fuelPricesCacheTime = 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60;
const numPlacesCacheTime = 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60;
let fetchedPinsLength,
  fetchedClosests,
  isLocationSelected = false,
  geolocationError = false;
let formType = 'DOWNLOAD';

const makeSelect = document.querySelector('#makeSelect');
const modelSelect = document.querySelector('#modelSelect');
const yearSelect = document.querySelector('#yearSelect');
const descriptionSelect = document.querySelector('#descriptionSelect');

const suggestedContainers = document.querySelectorAll('.suggested-container');
let suggestedSystems;
let driveOftenIndexValue = 2; //default

const systemQueryDict = {
  'DI 3000B': 'di3000b',
  'DI 60': 'di60',
  'DI 108': 'di108',
  'DI 108 8cyl': 'di108-8cyl'
};
const apaitoumenaEmulatorTypes = ['p', 'b6', 'b8', 'hp', 'double-hp'];
const cngOnlyEmulatorTypes = ['b6', 'b8', 'f', 'p'];
const emulatorTextDict = {
  p: 'Fuel Pressure Emulator',
  t: 'Reducer Lovato RGJ DD',
  f: 'Petrol Level Emulator',
  b6: 'Petrol Injectors Emulator',
  b8: 'Dual Injector Engine 4x2 = 8cyl',
  hp: 'Εξαερωτής RGJ UHPII έως 350HP',
  'double-hp': 'Διπλός Εξαερωτής RGJ UHPII άνω των 350HP'
};
const emulatorIsMandatoryDict = {
  p: true,
  t: false,
  f: false,
  b6: true,
  b8: true,
  hp: true,
  'double-hp': true
};
const emulatorPriceDict = {
  p: 85,
  b6: 95,
  b8: -250, // - from cobd 8cyl = 1000€
  hp: 90,
  'double-hp': 130,
  t: 90,
  f: 85
};
//90eurw sthn timh gia ta panw apo 180 hp

let emulatorSelected = false;

const systemNamesFromIdDict = {
  'notConvertible-lpg': ['not convertible lpg'],
  'notConvertible-cng': ['not convertible cng'],

  'suggested-lpg-ego': ['Lovato E-GO II'],
  'suggested-lpg-exr': ['Lovato Smart ExR'],
  'suggested-lpg-exr-ego': ['Lovato Smart ExR', 'Lovato E-GO II'],
  'suggested-lpg-cobd-exr': ['Lovato C-OBD II', 'Lovato Smart ExR'],
  'suggested-lpg-cobd': ['Lovato C-OBD II'],
  'suggested-lpg-cobd-6cyl': ['Lovato C-OBD II 5-6cyl'],
  'suggested-lpg-cobd-8cyl': ['Lovato C-OBD II 8cyl'],
  'suggested-lpg-di3000b': ['Lovato Direct Injection'],
  'suggested-lpg-di60': ['Lovato Direct Injection ExR'],
  'suggested-lpg-di108': ['Lovato Direct Injection ExR 5-6cyl'],
  'suggested-lpg-di108-8cyl': ['Lovato Direct Injection ExR 8cyl'],
  'suggested-lpg-monou': ['Lovato Μονού Ψεκασμού'],
  'suggested-cng-ego': ['Lovato E-GO II'],
  'suggested-cng-exr': ['Lovato Smart ExR'],
  'suggested-cng-exr-ego': ['Lovato Smart ExR', 'Lovato E-GO II'],
  'suggested-cng-cobd-exr': ['Lovato C-OBD II', 'Lovato Smart ExR'],
  'suggested-cng-cobd': ['Lovato C-OBD II'],
  'suggested-cng-cobd-6cyl': ['Lovato C-OBD II 5-6cyl'],
  'suggested-cng-cobd-8cyl': ['Lovato C-OBD II 8cyl'],
  'suggested-cng-di3000b': ['Lovato Direct Injection'],
  'suggested-cng-di60': ['Lovato Direct Injection ExR'],
  'suggested-cng-di108': ['Lovato Direct Injection ExR 5-6cyl'],
  'suggested-cng-di108-8cyl': ['Lovato Direct Injection ExR 8cyl'],
  'suggested-cng-monou': ['Lovato Μονού Ψεκασμού']
};

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

const systemFullKitLogoUrlDict = {
  'Lovato E-GO II': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee7346ab570f60d7bb37a_4cyl-lpg-ego.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6754280dc37314e8f73e_4cyl-cng-ego.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6088406ac599186f8b2b6a24_ego-logo-02.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521c827db504fc22c670e_ego-logo.png'
  },
  'Lovato Smart ExR': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee733adf1d40cb74f7833_4cyl-lpg-smart.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6754af4e784afb8330cf_4cyl-cng-smart-exr.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/609c30dacc06e8cd8c6ea9e5_smart-exrlogo-03.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/6105218ad75db243ceeb475a_exr-logo.png'
  },
  'Lovato C-OBD II': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee60f5628ed4315175916_4cyl-lpg-cobd.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef67541fd9cd4ad1733d00_4cyl-cng-cobd.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60883f7a4d700e4999151d5c_c-obd-logo-01.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521b043afc02057ae8d57_c-obd-logo.png'
  },
  'Lovato C-OBD II 5-6cyl': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee733d5512eddeaba0e27_6-cyl-lpg-cobd.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef675387535ba8bd37a04b_6-cyl-cng-cobd.jpg'
    },
    cylsDescr: '5-6cyl',
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60883f7a4d700e4999151d5c_c-obd-logo-01.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521b043afc02057ae8d57_c-obd-logo.png'
  },
  'Lovato C-OBD II 8cyl': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee73479dd0f4e870b8c45_8-cyl-lpg-cobd.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6755572ae6790a962780_8-cyl-cng-cobd.jpg'
    },
    cylsDescr: '8cyl',
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60883f7a4d700e4999151d5c_c-obd-logo-01.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521b043afc02057ae8d57_c-obd-logo.png'
  },
  'Lovato Direct Injection': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee7341aea14affe7a7745_4cyl-lpg-DI.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6754a7bdb14d467b2a9b_4cyl-cng-DI.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/608843a4610d5c0d5968174c_direct-logo-04.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/61052116bda194738e42d1c5_di-logo.png'
  },
  'Lovato Direct Injection ExR': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee73476c7f3f6e21a5dd8_4cyl-lpg-DI-exr.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6754b39a8f3c2e68a726_4cyl-cng-DI-exr.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/608842f17c61a41e6f07fe13_di-exr-logo-04.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521dc5b98822c26e0144d_di-exr-logo.png'
  },
  'Lovato Direct Injection ExR 5-6cyl': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee73479dd0f30d40b8c44_6-cyl-lpg-DI-exr.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6753d4f2f6533da6f5d7_6-cyl-cng-DI-exr.jpg'
    },
    cylsDescr: '5-6cyl',
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/608842f17c61a41e6f07fe13_di-exr-logo-04.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521dc5b98822c26e0144d_di-exr-logo.png'
  },
  'Lovato Direct Injection ExR 8cyl': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60eee73410da6d79bf573625_8-cyl-lpg-DI-exr.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60ef6759d2274958726b8934_8-cyl-cng-DI-exr.jpg'
    },
    cylsDescr: '8cyl',
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/608842f17c61a41e6f07fe13_di-exr-logo-04.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521dc5b98822c26e0144d_di-exr-logo.png'
  },
  'Lovato Μονού Ψεκασμού': {
    fullKit: {
      lpg: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f01499ce19af4ccee7b7ea_lpg-monou-simeiou.jpg',
      cng: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60f014997b549b2900dc2d28_cng-monou-simeiou.jpg'
    },
    logo: 'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/60a7d730fbc8089bc98263ae_monou-psekasmou-05.svg',
    pngLogo:
      'https://uploads-ssl.webflow.com/60362f40a83dcf0034eb880b/610521a1778a96783b06a71d_monou-logo.png'
  }
};

const VAT = 1.24;

//SELECTED FUEL
lpgFuelSelectBtns = document.querySelectorAll('.lpg-fuel-select-btn');
cngFuelSelectBtns = document.querySelectorAll('.cng-fuel-select-btn');

//EASY PAY
const prokatavoliNoCreditSlider = document.querySelector('.prokatavoli-no-credit-slider');
const prokatavoliCreditSlider = document.querySelector('.prokatavoli-credit-slider');

const doseisNoCreditSlider = document.querySelector('.doseis-no-credit-slider');
const doseisCreditSelect = document.querySelector('.doseis-credit-select');

const noVehicleNoCreditSlider = document.querySelector('.no-vehicle-no-credit-slider');
const noVehicleCreditSlider = document.querySelector('.no-vehicle-credit-slider');
const noVehicleMetrhtaSlider = document.querySelector('.no-vehicle-metrhta-slider');

const prokatavoliNoCreditCover = document.querySelector('.prokatavoli-no-credit-cover');
const prokatavoliCreditCover = document.querySelector('.prokatavoli-credit-cover');

const doseisNoCreditCover = document.querySelector('.doseis-no-credit-cover');

const noVehicleNoCreditCover = document.querySelector('.no-vehicle-no-credit-cover');
const noVehicleCreditCover = document.querySelector('.no-vehicle-credit-cover');
const noVehicleMetrhtaCover = document.querySelector('.no-vehicle-metrhta-cover');

const outputNoCreditProkatavoli = document.querySelector('.output-no-credit-prokatavoli');
const outputCreditProkatavoli = document.querySelector('.output-credit-prokatavoli');

const outputNoCreditDoseis = document.querySelector('.output-no-credit-doseis');

const outputNoCreditNoVehicle = document.querySelector('.output-no-credit-no-vehicle');
const outputCreditNoVehicle = document.querySelector('.output-credit-no-vehicle');
const outputMetrhtaNoVehicle = document.querySelector('.output-metrhta-no-vehicle');

const noCreditProkatavoliMinus = document.querySelector('.no-credit-prokatavoli-minus');
const noCreditProkatavoliPlus = document.querySelector('.no-credit-prokatavoli-plus');
const creditProkatavoliMinus = document.querySelector('.credit-prokatavoli-minus');
const creditProkatavoliPlus = document.querySelector('.credit-prokatavoli-plus');

const noCreditDoseisMinus = document.querySelector('.no-credit-doseis-minus');
const noCreditDoseisPlus = document.querySelector('.no-credit-doseis-plus');

const noCreditNoVehicleMinus = document.querySelector('.no-credit-no-vehicle-minus');
const noCreditNoVehiclePlus = document.querySelector('.no-credit-no-vehicle-plus');
const creditNoVehicleMinus = document.querySelector('.credit-no-vehicle-minus');
const metrhtaNoVehicleMinus = document.querySelector('.metrhta-no-vehicle-minus');
const creditNoVehiclePlus = document.querySelector('.credit-no-vehicle-plus');
const metrhtaNoVehiclePlus = document.querySelector('.metrhta-no-vehicle-plus');

const noCreditEnapomeinanPoso = document.querySelector('.no-credit-enapomeinan-poso');
const creditEnapomeinanPoso = document.querySelector('.credit-enapomeinan-poso');

const noCreditFinalCost = document.querySelector('.no-credit-final-cost');
const creditFinalCost = document.querySelector('.credit-final-cost');

const noCreditMonthlyCost = document.querySelector('.no-credit-monthly-cost');
const noCreditMonthlyGain = document.querySelector('.no-credit-monthly-gain');
const creditMonthlyCost = document.querySelector('.credit-monthly-cost');
const creditMonthlyGain = document.querySelector('.credit-monthly-gain');
const metrhtaFinalCost = document.querySelector('.metrhta-final-cost');
const metrhtaYearlyGain = document.querySelector('.metrhta-yearly-gain');

const minProkatavoliNoCreditSliderText = document.querySelector(
  '.min-prokatavoli-no-credit-slider-text'
);
const maxProkatavoliNoCreditSliderText = document.querySelector(
  '.max-prokatavoli-no-credit-slider-text'
);
const minProkatavoliCreditSliderText = document.querySelector(
  '.min-prokatavoli-credit-slider-text'
);
const maxProkatavoliCreditSliderText = document.querySelector(
  '.max-prokatavoli-credit-slider-text'
);

const minDoseisNoCreditSliderText = document.querySelector('.min-doseis-no-credit-slider-text');
const maxDoseisNoCreditSliderText = document.querySelector('.max-doseis-no-credit-slider-text');

const minNoVehicleNoCreditSliderText = document.querySelector(
  '.min-no-vehicle-no-credit-slider-text'
);
const maxNoVehicleNoCreditSliderText = document.querySelector(
  '.max-no-vehicle-no-credit-slider-text'
);
const minNoVehicleCreditSliderText = document.querySelector('.min-no-vehicle-credit-slider-text');
const maxNoVehicleCreditSliderText = document.querySelector('.max-no-vehicle-credit-slider-text');
const minNoVehicleMetrhtaSliderText = document.querySelector('.min-no-vehicle-metrhta-slider-text');
const maxNoVehicleMetrhtaSliderText = document.querySelector('.max-no-vehicle-metrhta-slider-text');

const fuelPricesSelectVehicle = document.querySelector('#fuelPricesSelectVehicle');
const fuelPricesSelectNoVehicle = document.querySelector('#fuelPricesSelectNoVehicle');

const notificationIconBasket = document.querySelector('.notification-icon-basket');

const storesLocationSelect = document.querySelector('#selectStores');

let noCreditInterest = 12.6;
let creditInterest = 7.2;

let sourceReferrerDomain;

document.addEventListener('DOMContentLoaded', () => {
  if (preferredStorage.userSelections) userSelections = getUserSelections();
  userSelections.selectedFuel = 'lpg';

  initSelects();
  initFuelPrices();
  initDriveOftenRadio();
  initSelectedFuelListeners();
  initCalcOptions();
  initEasyPay();
  initStores();
  //localStorage.clear();
  //initStorage();
  initMails();
  initUserInfo();
  initBasket();
  // initCss();

  initLotteryCountdown();

  showFacebookBrowserProblem(isFacebookBrowser());

  initStepInterval();
  initProgressSteps();

  initHint();
  getSourceReferrerDomain();
});

function initHint() {
  document.querySelector('.hint').style.display = 'flex';
}

function initProgressSteps() {
  changeProgressStepState('fuel', 'green');
  // changeProgressStepState('car', 'next');
}

function showFacebookBrowserProblem(show) {
  if (isFacebookBrowser()) {
    document.querySelector('.facebook-browser-div').style.display = show ? 'block' : 'none';
  }
}

function initCalcOptions() {
  document.querySelector('#consumptionModelNameCalc').textContent = 'αυτοκίνητό σας';
  document.querySelector('#consumptionModelNameCalc').classList.remove('calc-info-style');
}

function initBasket() {
  updateBasketSection({ resetNoVehicle: true });
  progressStepClickedOnSidebar(); //Close when progress step is clicked
}

function progressStepClickedOnSidebar() {
  document.querySelectorAll('.side-bar-content .step-progress .flex-step').forEach(stepEl =>
    stepEl.addEventListener('click', e => {
      document.querySelector('.side-bar-close').click();
    })
  );
}

function initMails() {
  [...document.querySelectorAll('.info-email')].map(
    el => (el.textContent = 'info@lovatohellas.gr')
  );
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

function initSelects() {
  modelSelect.disabled = true;
  modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
  yearSelect.disabled = true;
  yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
  descriptionSelect.disabled = true;
  descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
}

function initFuelPrices() {
  if (
    userSelections &&
    userSelections.location &&
    userSelections.fuelPrices &&
    !isExpired(userSelections.fuelPrices.expDate)
  ) {
    fuelPrices = userSelections.fuelPrices.prices;
    initPlaceSelects(userSelections.location.place);
    modifyFuelPriceSliders(userSelections.location.place);
  } else {
    fetch(urlFuelPrices, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        data.pop(); //removes m.o.
        fuelPrices = data;

        let newValue = 'ΑΤΤΙΚΗΣ';
        if (
          userSelections &&
          userSelections.location &&
          userSelections.fuelPrices &&
          isExpired(userSelections.fuelPrices.expDate)
        ) {
          newValue = userSelections.location.place;
        }

        userSelections.fuelPrices = {
          prices: fuelPrices,
          expDate: setExpDate(fuelPricesCacheTime)
        };

        initPlaceSelects(newValue);
        modifyFuelPriceSliders(newValue, { save: true });
      })
      .catch(e => console.error('Error on FuelPrices Fetch:', e));
  }
}

function setExpDate(ms) {
  return new Date().getTime() + ms;
}

function isExpired(expDate) {
  if (!expDate) return true;
  return new Date().getTime() > expDate;
}

function initDriveOftenRadio() {
  selectDriveOftenRadioInput(2);
}

function initPlaceSelects(placeValue) {
  fuelPricesSelectVehicle.value = placeValue;
  fuelPricesSelectNoVehicle.value = placeValue;
  [...document.querySelectorAll('.place-calc-descr')].map(
    el =>
      (el.textContent =
        fuelPricesSelectVehicle.options[fuelPricesSelectVehicle.selectedIndex].textContent)
  );
  storesLocationSelect.value = placeValue;
}

fuelPricesSelectNoVehicle.addEventListener('change', e => {
  fuelPricesSelectVehicle.value = e.target.value;
  modifyFuelPriceSliders(e.target.value, { save: true });
  [...document.querySelectorAll('.place-calc-descr')].map(
    el =>
      (el.textContent =
        fuelPricesSelectVehicle.options[fuelPricesSelectVehicle.selectedIndex].textContent)
  );

  storesLocationSelect.value = e.target.value;
  locationOnChange(storesLocationSelect.value);
});
fuelPricesSelectVehicle.addEventListener('change', e => {
  fuelPricesSelectNoVehicle.value = e.target.value;
  modifyFuelPriceSliders(e.target.value, { save: true });
  [...document.querySelectorAll('.place-calc-descr')].map(
    el =>
      (el.textContent =
        fuelPricesSelectVehicle.options[fuelPricesSelectVehicle.selectedIndex].textContent)
  );

  storesLocationSelect.value = e.target.value;
  locationOnChange(storesLocationSelect.value);

  updateBasketSection({ calculator: true });
  if (step2Triggered && !step3Triggered) {
    trigger_calculator_step_3({ triggered_via: 'click' });
  }
});

function modifyFuelPriceSliders(value, { save = false } = {}) {
  const locationObj = fuelPrices.find(obj => obj.place.indexOf(value) !== -1);
  if (!locationObj) return;

  sliders[2].value = locationObj.petrol;
  outputs[2].value = locationObj.petrol;
  calcCovers[2].style.width = calcCoverWidth(sliders[2]) + '%';
  sliders[3].value = locationObj.lpg;
  outputs[3].value = locationObj.lpg;
  calcCovers[3].style.width = calcCoverWidth(sliders[3]) + '%';
  calcResult(false);
  if (save) {
    userSelections.calculator.fuelPricesSelectedIndex = fuelPricesSelectVehicle.selectedIndex;
    userSelections.location = {
      index: fuelPricesSelectVehicle.selectedIndex,
      place: fuelPricesSelectVehicle.value
      // place: fuelPricesSelectVehicle.options[fuelPricesSelectVehicle.selectedIndex].textContent
    };
    saveUserSelections();
  }
}

function initSelectedFuelListeners() {
  cngFuelSelectBtns.forEach(cngBtn => {
    cngBtn.addEventListener('click', e => {
      step2Triggered = false;
      if (userSelections.selectedFuel === 'cng') return;
      userSelections.selectedFuel = 'cng';
      saveUserSelections();

      const activeContainer = getActiveContainer();
      if (activeContainer) {
        activeContainer.style.display = 'none';
        showResults(fetchedModelObj);
      }
      calcResult();
      configureEasyPayMonthlyGain();
      updateBasketSection({ selectedFuel: true });
    });
  });
  lpgFuelSelectBtns.forEach(lpgBtn => {
    lpgBtn.addEventListener('click', e => {
      step2Triggered = false;
      if (userSelections.selectedFuel === 'lpg') return;
      userSelections.selectedFuel = 'lpg';
      saveUserSelections();

      const activeContainer = getActiveContainer();
      if (activeContainer) {
        activeContainer.style.display = 'none';
        showResults(fetchedModelObj);
      }
      calcResult();
      configureEasyPayMonthlyGain();
      updateBasketSection({ selectedFuel: true });
    });
  });
}

function initEasyPay() {
  initNoCredit();
  initCredit();
  initMetrhta();
  initEasyPayTabs();
  initEasyPaySystemSelection();
  resetEasyPay();
}

function initNoCredit() {
  prokatavoliNoCreditSlider.addEventListener('input', e =>
    prokatavoliNoCreditSliderOnChange(e.target.value)
  );
  doseisNoCreditSlider.addEventListener('input', e => doseisNoCreditSliderOnChange(e.target.value));
  noVehicleNoCreditSlider.addEventListener('input', e =>
    noVehicleNoCreditSliderOnChange(e.target.value)
  );

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
    prokatavoliNoCreditSliderOnChange(
      parseInt(prokatavoliNoCreditSlider.value) - parseInt(prokatavoliNoCreditSlider.step)
    )
  );
  noCreditProkatavoliPlus.addEventListener('click', () =>
    prokatavoliNoCreditSliderOnChange(
      parseInt(prokatavoliNoCreditSlider.value) + parseInt(prokatavoliNoCreditSlider.step)
    )
  );

  noCreditDoseisMinus.addEventListener('click', () =>
    doseisNoCreditSliderOnChange(
      parseInt(doseisNoCreditSlider.value) - parseInt(doseisNoCreditSlider.step)
    )
  );
  noCreditDoseisPlus.addEventListener('click', () =>
    doseisNoCreditSliderOnChange(
      parseInt(doseisNoCreditSlider.value) + parseInt(doseisNoCreditSlider.step)
    )
  );

  noCreditNoVehicleMinus.addEventListener('click', () =>
    noVehicleNoCreditSliderOnChange(
      parseInt(noVehicleNoCreditSlider.value) - parseInt(noVehicleNoCreditSlider.step)
    )
  );
  noCreditNoVehiclePlus.addEventListener('click', () =>
    noVehicleNoCreditSliderOnChange(
      parseInt(noVehicleNoCreditSlider.value) + parseInt(noVehicleNoCreditSlider.step)
    )
  );
}
function initCredit() {
  noVehicleCreditSlider.addEventListener('input', e =>
    noVehicleCreditSliderOnChange(e.target.value)
  );
  prokatavoliCreditSlider.addEventListener('input', e =>
    prokatavoliCreditSliderOnChange(e.target.value)
  );
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
    prokatavoliCreditSliderOnChange(
      parseInt(prokatavoliCreditSlider.value) - parseInt(prokatavoliCreditSlider.step)
    )
  );
  creditProkatavoliPlus.addEventListener('click', () =>
    prokatavoliCreditSliderOnChange(
      parseInt(prokatavoliCreditSlider.value) + parseInt(prokatavoliCreditSlider.step)
    )
  );

  creditNoVehicleMinus.addEventListener('click', () =>
    noVehicleCreditSliderOnChange(
      parseInt(noVehicleCreditSlider.value) - parseInt(noVehicleCreditSlider.step)
    )
  );
  creditNoVehiclePlus.addEventListener('click', () =>
    noVehicleCreditSliderOnChange(
      parseInt(noVehicleCreditSlider.value) + parseInt(noVehicleCreditSlider.step)
    )
  );

  doseisCreditSelect.selectedIndex = 11;
}

function initMetrhta() {
  noVehicleMetrhtaSlider.addEventListener('input', e =>
    noVehicleMetrhtaSliderOnChange(e.target.value)
  );

  outputMetrhtaNoVehicle.addEventListener('change', function () {
    if (+this.value > +noVehicleMetrhtaSlider.max) this.value = noVehicleMetrhtaSlider.max;
    if (+this.value < +noVehicleMetrhtaSlider.min) this.value = noVehicleMetrhtaSlider.min;
    if (+this.value) this.value = Math.round(+this.value);
    noVehicleMetrhtaSliderOnChange(this.value);
  });

  metrhtaNoVehicleMinus.addEventListener('click', () =>
    noVehicleMetrhtaSliderOnChange(
      parseInt(noVehicleMetrhtaSlider.value) - parseInt(noVehicleMetrhtaSlider.step)
    )
  );
  metrhtaNoVehiclePlus.addEventListener('click', () =>
    noVehicleMetrhtaSliderOnChange(
      parseInt(noVehicleMetrhtaSlider.value) + parseInt(noVehicleMetrhtaSlider.step)
    )
  );
  document.querySelector('#metrhtaFormDisable').addEventListener('submit', e => e.preventDefault());
}

function initEasyPayTabs() {
  document.querySelectorAll('.easy-pay-tab').forEach(el =>
    el.addEventListener('click', e => {
      userSelections.easyPay.method = getEasyPayMethod(e.target);
      hasResult() && updateBasketSection({ easyPay: true, prokatavoliDoseis: true });

      if (document.querySelector('.easy-pay-with-vehicle-container').style.display === 'none') {
        if (e.target.classList.contains('no-credit-tab')) {
          selectedEasyPaySystemPrice = +noVehicleNoCreditSlider.value;
        } else if (e.target.classList.contains('credit-tab')) {
          selectedEasyPaySystemPrice = +noVehicleCreditSlider.value;
        } else if (e.target.classList.contains('metrhta-tab')) {
          selectedEasyPaySystemPrice = +noVehicleCreditSlider.value;
        }
      }

      if (step2Triggered && !step4Triggered) {
        trigger_easy_pay_step_4({ triggered_via: 'click' });
      }
    })
  );
}

function initEasyPaySystemSelection() {
  document.querySelectorAll('.easy-pay-suggested-system-div').forEach(el =>
    el.addEventListener('click', e => {
      const selectedSystemDiv = e.target.closest('.easy-pay-suggested-system-div');

      userSelections.easyPay.system = getEasyPaySystem(selectedSystemDiv);
      updateBasketSection({ easyPay: true });

      changePriceFontWeight(selectedSystemDiv);

      const priceText = selectedSystemDiv.querySelector('.system-price-easy-pay').textContent;

      const oldSelectedEasyPaySystemPrice = selectedEasyPaySystemPrice;
      selectedEasyPaySystemPrice = parseFloat(priceText.replace('€', ''));
      if (oldSelectedEasyPaySystemPrice === selectedEasyPaySystemPrice) return;

      prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.value);
      prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.value);
      metrhtaFinalCost.textContent = selectedEasyPaySystemPrice.toFixed(2) + '€';

      if (step2Triggered && !step4Triggered) {
        trigger_easy_pay_step_4({ triggered_via: 'click' });
      }
    })
  );
}

function changePriceFontWeight(selectedSystemDiv) {
  if (selectedSystemDiv.classList.contains('system-1st-selection')) {
    [...document.querySelectorAll('.system-1st-selection .system-price-easy-pay')].map(
      el => (el.style.fontWeight = 'bold')
    );
    [...document.querySelectorAll('.system-2nd-selection .system-price-easy-pay')].map(
      el => (el.style.fontWeight = 'normal')
    );
  } else {
    [...document.querySelectorAll('.system-1st-selection .system-price-easy-pay')].map(
      el => (el.style.fontWeight = 'normal')
    );
    [...document.querySelectorAll('.system-2nd-selection .system-price-easy-pay')].map(
      el => (el.style.fontWeight = 'bold')
    );
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
  noCreditEnapomeinanPoso.textContent = (
    selectedEasyPaySystemPrice - parseInt(prokatavoliNoCreditSlider.value)
  ).toFixed(1);
  configureNoCreditMaxDoseisSlider();

  if (!userSelections.vehicle.suggestions) return;

  // userSelections.easyPay.noCreditSettings.prokatavoli = +prokatavoliNoCreditSlider.value;
  // userSelections.easyPay.noCreditSettings.finalCost = noCreditFinalCost.textContent;

  userSelections.easyPay.noCreditSettings = {
    ...userSelections.easyPay.noCreditSettings,
    prokatavoli: +prokatavoliNoCreditSlider.value,
    finalCost: noCreditFinalCost.textContent,
    monthlyCost: noCreditMonthlyCost.textContent
  };

  updateBasketSection({ prokatavoliDoseis: true });

  if (step2Triggered && !step4Triggered) {
    trigger_easy_pay_step_4({ triggered_via: 'click' });
  }
}

function prokatavoliCreditSliderOnChange(value) {
  const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;
  prokatavoliCreditSlider.max = floorPrice - 100;
  maxProkatavoliCreditSliderText.textContent = floorPrice - 100 + '€';

  prokatavoliCreditSlider.value = value;
  outputCreditProkatavoli.value = prokatavoliCreditSlider.value;
  prokatavoliCreditCover.style.width = calcCoverWidth(prokatavoliCreditSlider) + '%';
  prokatavoliCreditChangeMinMaxLabelsWeight();
  creditEnapomeinanPoso.textContent = (
    selectedEasyPaySystemPrice - parseInt(prokatavoliCreditSlider.value)
  ).toFixed(1);
  doseisCreditSelectOnChange(+doseisCreditSelect.value);

  if (!userSelections.vehicle.suggestions) return;
  // userSelections.easyPay.creditSettings.prokatavoli = +prokatavoliCreditSlider.value;
  // userSelections.easyPay.creditSettings.finalCost = creditFinalCost.textContent;

  userSelections.easyPay.creditSettings = {
    ...userSelections.easyPay.creditSettings,
    prokatavoli: +prokatavoliCreditSlider.value,
    finalCost: creditFinalCost.textContent,
    monthlyCost: creditMonthlyCost.textContent
  };
  updateBasketSection({ prokatavoliDoseis: true });

  if (step2Triggered && !step4Triggered) {
    trigger_easy_pay_step_4({ triggered_via: 'click' });
  }
}

function doseisNoCreditSliderOnChange(value) {
  doseisNoCreditSlider.value = value;
  outputNoCreditDoseis.value = doseisNoCreditSlider.value;
  doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
  doseisChangeMinMaxLabelsWeight();
  configureNoCreditResults();

  if (!userSelections.vehicle.suggestions) return;
  // userSelections.easyPay.noCreditSettings = { ...userSelections.easyPay.noCreditSettings, doseis: +doseisNoCreditSlider.value };
  // userSelections.easyPay.noCreditSettings.finalCost = noCreditFinalCost.textContent;

  userSelections.easyPay.noCreditSettings = {
    ...userSelections.easyPay.noCreditSettings,
    doseis: +doseisNoCreditSlider.value,
    finalCost: noCreditFinalCost.textContent,
    monthlyCost: noCreditMonthlyCost.textContent
  };
  updateBasketSection({ prokatavoliDoseis: true });

  if (step2Triggered && !step4Triggered) {
    trigger_easy_pay_step_4({ triggered_via: 'click' });
  }
}

function doseisCreditSelectOnChange(value) {
  configureCreditResults();
  if (!userSelections.vehicle.suggestions) return;
  // userSelections.easyPay.creditSettings = {
  // 	...userSelections.easyPay.creditSettings,
  // 	doseis: +doseisCreditSelect.value !== 1 ? +doseisCreditSelect.value : 'Χωρίς Δόσεις'
  // };
  // userSelections.easyPay.creditSettings.finalCost = creditFinalCost.textContent;
  userSelections.easyPay.creditSettings = {
    ...userSelections.easyPay.creditSettings,
    doseis: +doseisCreditSelect.value !== 1 ? +doseisCreditSelect.value : 'Χωρίς Δόσεις',
    finalCost: creditFinalCost.textContent,
    monthlyCost: creditMonthlyCost.textContent
  };
  updateBasketSection({ prokatavoliDoseis: true });

  if (step2Triggered && !step4Triggered) {
    trigger_easy_pay_step_4({ triggered_via: 'click' });
  }
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
function noVehicleMetrhtaSliderOnChange(value) {
  noVehicleMetrhtaSlider.value = value;
  outputMetrhtaNoVehicle.value = noVehicleMetrhtaSlider.value;
  noVehicleMetrhtaCover.style.width = calcCoverWidth(noVehicleMetrhtaSlider) + '%';
  noVehicleMetrhtaChangeMinMaxLabelsWeight();
  metrhtaFinalCost.textContent = (+noVehicleMetrhtaSlider.value).toFixed(2) + '€';

  selectedEasyPaySystemPrice = +noVehicleMetrhtaSlider.value;
  // prokatavoliMetrhtaSliderOnChange(prokatavoliMetrhtaSlider.value);
}

function prokatavoliNoCreditChangeMinMaxLabelsWeight() {
  maxProkatavoliNoCreditSliderText.style.fontWeight =
    prokatavoliNoCreditSlider.value === prokatavoliNoCreditSlider.max ? 'bold' : 'normal';
  minProkatavoliNoCreditSliderText.style.fontWeight =
    prokatavoliNoCreditSlider.value === prokatavoliNoCreditSlider.min ? 'bold' : 'normal';
}
function prokatavoliCreditChangeMinMaxLabelsWeight() {
  maxProkatavoliCreditSliderText.style.fontWeight =
    prokatavoliCreditSlider.value === prokatavoliCreditSlider.max ? 'bold' : 'normal';
  minProkatavoliCreditSliderText.style.fontWeight =
    prokatavoliCreditSlider.value === prokatavoliCreditSlider.min ? 'bold' : 'normal';
}
function doseisChangeMinMaxLabelsWeight() {
  maxDoseisNoCreditSliderText.style.fontWeight =
    doseisNoCreditSlider.value === doseisNoCreditSlider.max ? 'bold' : 'normal';
  minDoseisNoCreditSliderText.style.fontWeight =
    doseisNoCreditSlider.value === doseisNoCreditSlider.min ? 'bold' : 'normal';
}
function noVehicleNoCreditChangeMinMaxLabelsWeight() {
  maxNoVehicleNoCreditSliderText.style.fontWeight =
    noVehicleNoCreditSlider.value === noVehicleNoCreditSlider.max ? 'bold' : 'normal';
  minNoVehicleNoCreditSliderText.style.fontWeight =
    noVehicleNoCreditSlider.value === noVehicleNoCreditSlider.min ? 'bold' : 'normal';
}
function noVehicleCreditChangeMinMaxLabelsWeight() {
  maxNoVehicleCreditSliderText.style.fontWeight =
    noVehicleCreditSlider.value === noVehicleCreditSlider.max ? 'bold' : 'normal';
  minNoVehicleCreditSliderText.style.fontWeight =
    noVehicleCreditSlider.value === noVehicleCreditSlider.min ? 'bold' : 'normal';
}
function noVehicleMetrhtaChangeMinMaxLabelsWeight() {
  maxNoVehicleMetrhtaSliderText.style.fontWeight =
    noVehicleMetrhtaSlider.value === noVehicleMetrhtaSlider.max ? 'bold' : 'normal';
  minNoVehicleMetrhtaSliderText.style.fontWeight =
    noVehicleMetrhtaSlider.value === noVehicleMetrhtaSlider.min ? 'bold' : 'normal';
}

minProkatavoliNoCreditSliderText.addEventListener('click', e =>
  prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.min)
);
maxProkatavoliNoCreditSliderText.addEventListener('click', e =>
  prokatavoliNoCreditSliderOnChange(prokatavoliNoCreditSlider.max)
);
minProkatavoliCreditSliderText.addEventListener('click', e =>
  prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.min)
);
maxProkatavoliCreditSliderText.addEventListener('click', e =>
  prokatavoliCreditSliderOnChange(prokatavoliCreditSlider.max)
);

minDoseisNoCreditSliderText.addEventListener('click', e =>
  doseisNoCreditSliderOnChange(doseisNoCreditSlider.min)
);
maxDoseisNoCreditSliderText.addEventListener('click', e =>
  doseisNoCreditSliderOnChange(doseisNoCreditSlider.max)
);

minNoVehicleNoCreditSliderText.addEventListener('click', e =>
  noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.min)
);
maxNoVehicleNoCreditSliderText.addEventListener('click', e =>
  noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.max)
);
minNoVehicleCreditSliderText.addEventListener('click', e =>
  noVehicleCreditSliderOnChange(noVehicleCreditSlider.min)
);
maxNoVehicleCreditSliderText.addEventListener('click', e =>
  noVehicleCreditSliderOnChange(noVehicleCreditSlider.max)
);
minNoVehicleMetrhtaSliderText.addEventListener('click', e =>
  noVehicleMetrhtaSliderOnChange(noVehicleMetrhtaSlider.min)
);
maxNoVehicleMetrhtaSliderText.addEventListener('click', e =>
  noVehicleMetrhtaSliderOnChange(noVehicleMetrhtaSlider.max)
);

function resetEasyPay() {
  [...document.querySelectorAll('.easy-pay-vehicle-container')].map(
    el => (el.style.display = 'none')
  );
  [...document.querySelectorAll('.easy-pay-with-vehicle-container')].map(
    el => (el.style.display = 'none')
  );
  [...document.querySelectorAll('.easy-pay-no-vehicle-container')].map(
    el => (el.style.display = 'flex')
  );
  [...document.querySelectorAll('.easy-pay-no-vehicle-descr')].map(
    el => (el.style.display = 'flex')
  );

  selectedEasyPaySystemPrice = +noVehicleNoCreditSlider.value;
  noVehicleNoCreditSliderOnChange(noVehicleNoCreditSlider.value);
  noVehicleCreditSliderOnChange(noVehicleCreditSlider.value);
  noVehicleMetrhtaSliderOnChange(noVehicleMetrhtaSlider.value);

  resetLastStep();
}

/* STORAGE */
function initStorage() {
  const storageObj = JSON.parse(preferredStorage.getItem('userSelections'));
  if (storageObj && Object.keys(storageObj.vehicle).length !== 0) {
    userSelections = storageObj;
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
  calcResult(false);
}

/* STORAGE END */

makeSelect.addEventListener('change', function () {
  modelSelect.disabled = true;
  descriptionSelect.disabled = true;
  modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
  descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  showGuarantee(false);
  resetCalc();
  resetEasyPay();
  step2Triggered = false;
  calcResult(false);
  updateBasketSection({ resetNoVehicle: true });
  resetProgressSteps();

  userSelections.vehicle = {};
  delete userSelections.calculator.driveOftenIndex;
  userSelections.easyPay = {};
  saveUserSelections();

  if (!this.value) {
    yearSelect.disabled = true;
    yearSelect.innerHTML = '<option value="">Χρονολογία</option>';
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
        console.warn('status = ' + status);
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
      let errorMsg;
      if (status === 429) errorMsg = 'Πολλές κλήσεις, προσπαθήστε αργότερα....';
      else errorMsg = 'Προσπαθήστε ξανά';
      yearSelect.innerHTML = `<option value="">${errorMsg}</option>`;
      console.error('Error Fetch:', error);
    });
});

function startLoadingSelect(select, triggeredFrom = null, type = null) {
  if (!triggeredFrom) select.classList.add('loading-select');
  else {
    if (triggeredFrom === 'form') {
      document.querySelector('#submitSummaryBtn').value = 'Ετοιμάζουμε την προσφορά σου...';
    }
    if (triggeredFrom === 'basket') {
      if (type === 'download')
        document.querySelector('.download-summary-basket-descr').innerHTML =
          'Ετοιμάζουμε την<br>προσφορά σου...';
      else if (type === 'email')
        document.querySelector('.email-summary-basket-descr').innerHTML =
          'Ετοιμάζουμε την<br>προσφορά σου...';
    }
  }
}
function endLoadingSelect(select, triggeredFrom = null, type = null) {
  if (!triggeredFrom) select.classList.remove('loading-select');
  else {
    if (triggeredFrom === 'form') {
      document.querySelector('#submitSummaryBtn').value =
        formType === 'DOWNLOAD' ? 'Κατέβασε και εκτύπωσε!' : 'Πάρε με Email!';
    }
    if (triggeredFrom === 'basket') {
      if (type === 'download')
        document.querySelector('.download-summary-basket-descr').innerHTML =
          'Κατέβασε<br>και εκτύπωσε!';
      else if (type === 'email')
        document.querySelector('.email-summary-basket-descr').innerHTML = 'Πάρε<br>σε email!';
    }
  }
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
  showGuarantee(false);
  resetCalc();
  resetEasyPay();
  step2Triggered = false;

  calcResult(false);
  updateBasketSection({ resetNoVehicle: true });
  resetProgressSteps();

  userSelections.vehicle = {};
  delete userSelections.calculator.driveOftenIndex;
  userSelections.easyPay = {};
  saveUserSelections();

  if (!value) {
    modelSelect.disabled = true;
    modelSelect.innerHTML = '<option value="">Μοντέλο</option>';
    descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
    return;
  }

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
      if (status !== 200) {
        endLoadingSelect(modelSelect);
        yearSelect.innerHTML = `<option value="">Προσπαθήστε ξανά ${data.msg}</option>`;
        return;
      }
      fetchedModels = data;

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
  suggestedContainers.forEach(container => {
    container.style.display = 'none';
  });
  showGuarantee(false);
  resetCalc();
  resetEasyPay();
  step2Triggered = false;

  calcResult(false);
  updateBasketSection({ resetNoVehicle: true });
  resetProgressSteps();

  userSelections.vehicle = {};
  delete userSelections.calculator.driveOftenIndex;
  userSelections.easyPay = {};
  saveUserSelections();

  if (!value) {
    descriptionSelect.disabled = true;
    descriptionSelect.innerHTML = '<option value="">Περιγραφή</option>';
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
    engineCodesOptions = [...new Set(engineCodesOptions)].sort(
      (a, b) => parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0])
    );
    engineCodesOptions.forEach(engineCode => {
      let engineCodeValue = engineCode.split(' ');
      engineCodeValue.pop();
      engineCodeValue = engineCodeValue.join(' ');
      optionsArray.push(`<option value="${engineCodeValue}">${engineCode}</option>`);
    });
  } else {
    const filteredVehicles = fetchedModelObj.vehicles.slice();

    if (
      filteredVehicles.length === 1 ||
      (haveSameConsumption(filteredVehicles, { tolerance: 0.5 }) &&
        haveSameEmulators(filteredVehicles) &&
        (filteredVehicles.every(veh => veh.hp <= 180) ||
          filteredVehicles.every(veh => veh.hp > 180)))
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
      Math.abs(parseFloat(veh.consumption[0]) - parseFloat(vehicles[0].consumption[0])) <=
        tolerance &&
      Math.abs(parseFloat(veh.consumption[1]) - parseFloat(vehicles[0].consumption[1])) <=
        tolerance &&
      Math.abs(parseFloat(veh.consumption[2]) - parseFloat(vehicles[0].consumption[2])) <= tolerance
  );
}

function haveSameEmulators(vehicles) {
  const emulators = [];
  vehicles.forEach(veh => {
    if (veh.hasOwnProperty('emulators')) {
      emulators.push(veh.emulators[0]);
    } else {
      emulators.push(null);
    }
  });
  return [...new Set(emulators)].length === 1;
}

descriptionSelect.addEventListener('change', e => descriptionOnChange(e.target.value));

function descriptionOnChange(value) {
  suggestedContainers.forEach(cont => (cont.style.display = 'none'));

  if (!value) {
    showGuarantee(false);
    resetCalc();
    resetEasyPay();
    step2Triggered = false;

    calcResult(false);
    updateBasketSection({ resetNoVehicle: true });
    resetProgressSteps();

    userSelections.vehicle = {};
    delete userSelections.calculator.driveOftenIndex;
    userSelections.easyPay = {};
    saveUserSelections();

    return;
  }

  showResults(fetchedModelObj);
  calcResult(false);

  saveUserSelections();
}

function configureUserSelectionsAfterResults() {
  const activeContainer = getActiveContainer();
  const activeContainerId = activeContainer.id;

  userSelections = {
    ...userSelections,
    vehicle: {
      identification: {
        vehicleValues: {
          make: makeSelect.value,
          year: yearSelect.value,
          model: modelSelect.value,
          description:
            descriptionSelect.value +
            `${
              descriptionSelect.value.length === 1
                ? ' cyl'
                : descriptionSelect.value.includes(' - ')
                ? ''
                : ' hp'
            }`,
          makeImgUrl: makeImgPrefix + makeImgDict[makeSelect.value]
        },
        fetchedData: { fetchedYears, fetchedModels, fetchedModelObj },
        foundVehicleObj
      },
      suggestions: {
        containerId: activeContainerId,
        hasResult: activeContainerId.indexOf('notConvertible') === -1,
        systems: getSystemsNamePrice(activeContainer),
        emulators: {
          hasEmulators: hasValidEmulators(foundVehicleObj) || hasUHPII(foundVehicleObj),
          type:
            (hasValidEmulators(foundVehicleObj) || hasUHPII(foundVehicleObj)) && getEmulatorType()
        }
      }
    },
    calculator: {
      ...userSelections.calculator,
      driveOftenIndex: driveOftenIndexValue,
      fuelPricesSelectedIndex: fuelPricesSelectVehicle.selectedIndex,
      kmPerYearValue: +document.querySelector('.km-year').value,
      trueConsumption: +document.querySelector('.lt-100km').value,
      gain: userSelections.selectedFuel === 'lpg' ? lpgResult.textContent : cngResult.textContent,
      percentage:
        userSelections.selectedFuel === 'lpg'
          ? lpgPercentageEl.textContent
          : cngPercentageEl.textContent
    }
  };

  if (userSelections.vehicle.suggestions.hasResult) {
    userSelections.easyPay = {
      ...userSelections.easyPay,
      method: getEasyPayMethod(),
      system: {
        name: userSelections.vehicle.suggestions.systems[0].name, //default
        priceWithVAT: selectedEasyPaySystemPrice + '€',
        priceNoVAT: userSelections.vehicle.suggestions.systems.find(
          system => system.name === userSelections.vehicle.suggestions.systems[0].name
        ).priceNoVAT,
        systemLogoUrl:
          systemFullKitLogoUrlDict[userSelections.vehicle.suggestions.systems[0].name].logo,
        systemLogoUrlPng:
          systemFullKitLogoUrlDict[userSelections.vehicle.suggestions.systems[0].name].pngLogo,
        fullKitUrl:
          systemFullKitLogoUrlDict[userSelections.vehicle.suggestions.systems[0].name].fullKit[
            userSelections.selectedFuel
          ],
        cylsDescr:
          systemFullKitLogoUrlDict[userSelections.vehicle.suggestions.systems[0].name].cylsDescr
      },
      noCreditSettings: getNoCreditSettings(),
      creditSettings: getCreditSettings()
    };

    userSelections.vehicle.suggestions.emulators = {
      ...userSelections.vehicle.suggestions.emulators,
      emulatorText: emulatorTextDict[userSelections.vehicle.suggestions.emulators.type],
      isMandatory: emulatorIsMandatoryDict[userSelections.vehicle.suggestions.emulators.type],
      emulatorPrice: emulatorPriceDict[userSelections.vehicle.suggestions.emulators.type]
    };
    if (
      userSelections.vehicle.suggestions.emulators.hasEmulators &&
      !userSelections.vehicle.suggestions.emulators.isMandatory
    ) {
      userSelections.vehicle.suggestions.emulators.isSelected = emulatorSelected;
    }
  }
}

function showResults(fetchedModelObj) {
  const years = yearSelect.value;

  if (suggestedPricesChanges.length) resetToDefaultPrices();

  if (fetchedModelObj.isDirect) {
    showDirectResults(fetchedModelObj);
  } else if (fetchedModelObj.isMonou) {
    showMonouResults(fetchedModelObj);
  } else {
    showCylinderResults(fetchedModelObj, years);
  }

  const suggestedContainer = getActiveContainer();

  userSelections.vehicle.suggestions = {
    ...userSelections.vehicle.suggestions,
    containerId: suggestedContainer.id
  };
  saveUserSelections();

  adjustSectionPaddings();

  //If there is a suggestion
  if (
    suggestedContainer &&
    !suggestedContainer.classList.contains(
      `not-convertible-${userSelections.selectedFuel}-container`
    )
  ) {
    showGuarantee(true);
    displayEmulatorInfo(suggestedContainer);

    configureCalculatorAfterSuggestion();
    configureEasyPayAfterSuggestion();
    configureLastStepAfterSuggestion();
  } else {
    showGuarantee(false);
    resetCalc();
    resetEasyPay();
    updateBasketSection({ resetNoVehicle: true });
    resetProgressSteps();
  }

  configureUserSelectionsAfterResults();

  if (
    suggestedContainer &&
    !suggestedContainer.classList.contains(
      `not-convertible-${userSelections.selectedFuel}-container`
    )
  ) {
    updateBasketSection({
      vehicle: true,
      calculator: true,
      easyPay: true,
      prokatavoliDoseis: true,
      easyPayMonthlyGain: true
    });
    trigger_car_step_2();
  } else if (suggestedContainer) {
    trigger_not_convertible();
  }
}

function showGuarantee(show) {
  document.querySelector('.three-year-guarantee').style.display = show ? 'flex' : 'none';
}

function configureLastStepAfterSuggestion() {
  const modelName = document.querySelector('#modelNameNoCredit').textContent;
  document.querySelector('.finish-step-model').textContent = `${makeSelect.value} ${modelName}`;
}
function resetLastStep() {
  document.querySelector('.finish-step-model').textContent = 'όχημα σου';
}

function adjustSectionPaddings() {
  document.querySelector('#vehicle').style.paddingBottom = '3%';
  document.querySelector('#calculator').style.paddingTop = '3%';
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
  foundVehicleObj = consumptionsRace[0].veh;

  if (foundVehicleObj.isConvertible) {
    const directSystemDiv = document.querySelector(
      `#suggested-${userSelections.selectedFuel}-${systemQueryDict[foundVehicleObj.system]}`
    );
    let temp = descriptionSelect.value.split(' - ');
    directSystemDiv.querySelector('.di-engine-code-overlay').textContent =
      temp[1] + ' - ' + temp[0].replace(' ', '');
    directSystemDiv.style.display = 'grid';
  } else {
    document.querySelector(
      `.not-convertible-${userSelections.selectedFuel}-container`
    ).style.display = 'grid';
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
  document.querySelector(`#suggested-${userSelections.selectedFuel}-monou`).style.display = 'grid';
}

function showCylinderResults(fetchedModelObj, years) {
  foundVehicleObj = fetchedModelObj.vehicles[0]; // to be sure

  const descriptionValue = descriptionSelect.value;
  const consumptionsRace = runConsumptionRace(fetchedModelObj.vehicles);

  for (const consumptionObj of consumptionsRace) {
    const vehAttribute =
      descriptionValue.length === 1 ? consumptionObj.veh.cylinders : consumptionObj.veh.hp;
    if (vehAttribute == descriptionValue) {
      foundVehicleObj = consumptionObj.veh;
      break;
    }
  }

  const cyls = foundVehicleObj.cylinders;

  if (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'B8') {
    suggestedSystems = ['C-OBD II 4x2=8cyl'];
    const cobdDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-cobd-8cyl`);
    cobdDiv.querySelector('.suggested-descr-text').textContent = '4x2 = 8cyl';
    cobdDiv.querySelector('.left-overlay-description').textContent = '4x2 = 8cyl έως 180HP';
    cobdDiv.style.display = 'grid';
  } else if (cyls == 5 || cyls == 6) {
    suggestedSystems = ['C-OBD II 6cyl'];
    const cobdDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-cobd-6cyl`);
    // const cylinderDescrText = getCylinderDescrText();
    // cobdDiv.querySelector('.suggested-descr-text').textContent = '5-6cyl' + cylinderDescrText;
    // cobdDiv.querySelector('.left-overlay-description').textContent = '5-6cyl' + cylinderDescrText;
    cobdDiv.style.display = 'grid';
  } else if (cyls == 8) {
    suggestedSystems = ['C-OBD II 8cyl'];
    const cobdDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-cobd-8cyl`);
    // const cylinderDescrText = getCylinderDescrText();
    // cobdDiv.querySelector('.suggested-descr-text').textContent = '8cyl' + cylinderDescrText;
    // cobdDiv.querySelector('.left-overlay-description').textContent = '8cyl' + cylinderDescrText;
    cobdDiv.style.display = 'grid';
  } else if (years <= 1998) {
    if (
      foundVehicleObj.hp > 180 ||
      (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'T')
    ) {
      suggestedSystems = ['Smart ExR'];
      const exrDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-exr`);
      exrDiv.querySelector('.left-overlay-description').textContent =
        '2-4cyl' + getCylinderDescrText();
      exrDiv.style.display = 'grid';
    } else {
      suggestedSystems = ['E-GO'];
      document.querySelector(`#suggested-${userSelections.selectedFuel}-ego`).style.display =
        'grid';
    }
  } else if (years >= 1999 && years <= 2004) {
    if (
      foundVehicleObj.hp > 180 ||
      (foundVehicleObj.hasOwnProperty('emulators') && foundVehicleObj.emulators[0] === 'T')
    ) {
      suggestedSystems = ['Smart ExR'];
      const exrDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-exr`);
      exrDiv.querySelector('.left-overlay-description').textContent =
        '2-4cyl' + getCylinderDescrText();
      exrDiv.style.display = 'grid';
    } else {
      suggestedSystems = ['Smart ExR', 'E-GO'];
      const exrEgoDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-exr-ego`);
      exrEgoDiv.querySelector('.left-overlay-description').textContent =
        '2-4cyl' + getCylinderDescrText();
      exrEgoDiv.style.display = 'grid';
    }
  } else if (years >= 2005 && years <= 2013) {
    suggestedSystems = ['C-OBD II', 'Smart ExR'];
    const cobdExrDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-cobd-exr`);
    cobdExrDiv
      .querySelectorAll('.left-overlay-description')
      .forEach(el => (el.textContent = '2-4cyl' + getCylinderDescrText()));
    cobdExrDiv.style.display = 'grid';
  } else {
    suggestedSystems = ['C-OBD II'];
    const cobdDiv = document.querySelector(`#suggested-${userSelections.selectedFuel}-cobd`);
    cobdDiv.querySelector('.left-overlay-description').textContent =
      '2-4cyl' + getCylinderDescrText();
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
  suggestedContainer
    .querySelectorAll('.info-content-block')
    .forEach(emCont => (emCont.style.display = 'none'));

  if (hasValidEmulators(foundVehicleObj) || hasUHPII(foundVehicleObj)) {
    const vehicleEmulatorType = getEmulatorType();

    suggestedContainer
      .querySelectorAll(`.suggested-${userSelections.selectedFuel}-system`)
      .forEach(system => {
        system.querySelectorAll('.info-content-block').forEach(emCont => {
          if (emCont.classList.contains(`emulator-${vehicleEmulatorType}`)) {
            if (isApaitoumenoEmulatorType(vehicleEmulatorType)) {
              const priceEl = system.querySelector(
                `.suggested-${userSelections.selectedFuel}-price`
              );
              const defaultPrice = parseInt(priceEl.textContent.split('€')[0]);
              suggestedPricesChanges.push({ priceEl, defaultPrice });
              priceEl.textContent =
                defaultPrice + emulatorPriceDict[vehicleEmulatorType] + '€ + ΦΠΑ';
            } else {
              //init not selected emulator
              [...suggestedContainer.querySelectorAll('.check')].map(
                check => (check.style.display = 'none')
              );
              emulatorSelected = false;
            }
            emCont.querySelector('.info-content').style.height = '0px';
            emCont.style.display = 'block';
          }
        });
      });
  }
}
function hasValidEmulators(vehObj) {
  if (userSelections.selectedFuel === 'lpg') return vehObj.hasOwnProperty('emulators');
  return (
    vehObj.hasOwnProperty('emulators') &&
    cngOnlyEmulatorTypes.indexOf(vehObj.emulators[0].toLowerCase()) !== -1
  );
}

function hasUHPII(vehObj) {
  if (userSelections.selectedFuel === 'cng') return false;
  return vehObj.hp > 180 && vehObj.cylinders <= 4;
}

function getEmulatorType() {
  if (hasUHPII(foundVehicleObj)) {
    if (userSelections.selectedFuel === 'lpg') return foundVehicleObj.hp > 360 ? 'double-hp' : 'hp';
    else return 'hp';
  }
  return foundVehicleObj.emulators[0].toLowerCase();
}

function configureCalculatorAfterSuggestion() {
  document.querySelector('#calcTitle').textContent =
    'Υπολόγισε πόσα θα εξοικονομείς με το αυτοκίνητό σου!';

  document.querySelector('#makeImg').src = makeImgPrefix + makeImgDict[makeSelect.value];
  document.querySelector('#modelName').textContent = `${modelSelect.value} (${yearSelect.value})`;

  document.querySelector(
    '#inConsumption .text-span'
  ).innerHTML = `(${foundVehicleObj.consumption[0]}L/100km)`;
  document.querySelector(
    '#outConsumption .text-span'
  ).innerHTML = `(${foundVehicleObj.consumption[1]}L/100km)`;
  document.querySelector(
    '#combinedConsumption .text-span'
  ).innerHTML = `(${foundVehicleObj.consumption[2]}L/100km)`;

  const consumptionRadios = document.querySelectorAll('.radio-button.w-radio');

  consumptionRadios[0].dataset.cons = foundVehicleObj.consumption[0];
  consumptionRadios[1].dataset.cons = foundVehicleObj.consumption[1];
  consumptionRadios[2].dataset.cons = foundVehicleObj.consumption[2];

  document.querySelector('#calcContainerVehicle').style.display = 'block';
  document.querySelector('#calcContainerNoVehicle').style.display = 'none';

  sliders[1].value = foundVehicleObj.consumption[getDriveOftenIndex()];
  outputs[1].value = sliders[1].value;
  calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';

  [...document.querySelectorAll('.in-consumption')].map(
    el => (el.textContent = foundVehicleObj.consumption[0])
  );
  [...document.querySelectorAll('.out-consumption')].map(
    el => (el.textContent = foundVehicleObj.consumption[1])
  );
  [...document.querySelectorAll('.combined-consumption')].map(
    el => (el.textContent = foundVehicleObj.consumption[2])
  );

  document.querySelector(
    '#consumptionModelNameCalc'
  ).textContent = `${makeSelect.value} ${modelSelect.value} (${yearSelect.value})`;
  document.querySelector('#consumptionModelNameCalc').classList.add('calc-info-style');
}

function selectDriveOftenRadioInput(index) {
  document
    .querySelectorAll('.radio-button.w-radio input')
    .forEach((radio, i) => (radio.checked = i === index));
  document
    .querySelectorAll('.consumption-radio-input')
    .forEach((radio, i) =>
      i === index
        ? radio.classList.add('w--redirected-checked')
        : radio.classList.remove('w--redirected-checked')
    );
}

function getDriveOftenRadioIndex() {
  let index;
  document.querySelectorAll('.radio-button.w-radio input').forEach((radio, i) => {
    if (radio.checked) {
      index = i;
    }
  });
  return index;
}

function resetCalc() {
  document.querySelector('#calcTitle').innerHTML =
    'Υπολόγισε πόσα θα εξοικονομείς με ένα σύστημα Lovato!';

  document.querySelector('#consumptionModelNameCalc').textContent = 'αυτοκίνητό σας';
  document.querySelector('#consumptionModelNameCalc').classList.remove('calc-info-style');

  document.querySelector('#calcContainerVehicle').style.display = 'none';
  document.querySelector('#calcContainerNoVehicle').style.display = 'flex';

  sliders[1].value = 8;
  outputs[1].value = 8;
  calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';

  if (!getActiveContainer()) {
    document.querySelector('#vehicle').style.paddingBottom = '9%';
    document.querySelector('#calculator').style.paddingTop = '7%';
  }
}

document.querySelectorAll('.radio-button.w-radio input').forEach(el => {
  el.addEventListener('change', e => {
    const consumptionLabelWithData = e.target.closest('.radio-button.w-radio');

    document
      .querySelectorAll('.radio-button.w-radio .consumption-choice')
      .forEach(el => (el.style.fontWeight = 'normal')); //DEBUG!!
    consumptionLabelWithData.querySelector('.consumption-choice').style.fontWeight = 'bold';

    sliders[1].value = consumptionLabelWithData.dataset.cons;
    outputs[1].value = consumptionLabelWithData.dataset.cons;
    calcCovers[1].style.width = calcCoverWidth(sliders[1]) + '%';
    calcResult();

    userSelections.calculator.driveOftenIndex = getDriveOftenIndex();
    updateBasketSection({ calculator: true });
  });
});

function getDriveOftenIndex() {
  let index = 2;
  [...document.querySelectorAll('.radio-button.w-radio input')].forEach((el, i) => {
    if (el.checked) index = i;
  });
  driveOftenIndexValue = index;
  return index;
}

function getSystemsNamePrice(activeContainer) {
  const names = systemNamesFromIdDict[activeContainer.id];
  const prices = [
    ...activeContainer.querySelectorAll(`.suggested-${userSelections.selectedFuel}-price`)
  ].map(priceEl => priceEl.textContent);

  const array = [];
  names.forEach((name, i) => array.push({ name, priceNoVAT: prices[i] }));
  return array;
}

function getEasyPayMethod(target) {
  if (!Object.keys(userSelections.vehicle).length) return;
  let tabEl;
  if (target) {
    tabEl = target.closest('.easy-pay-tab');
  } else {
    tabEl = [...document.querySelectorAll('.easy-pay-tab')].find(tab =>
      tab.classList.contains('w--current')
    );
  }
  if (tabEl.classList.contains('no-credit-tab')) {
    return 'Χωρίς πιστωτική κάρτα';
  } else if (tabEl.classList.contains('credit-tab')) {
    return 'Με πιστωτική κάρτα';
  } else if (tabEl.classList.contains('metrhta-tab')) {
    return 'Μετρητά';
  }
}

function getEasyPaySystem(selectedSystemDiv) {
  if (!userSelections.vehicle.suggestions.systems) return;

  const name = selectedSystemDiv.classList.contains('system-1st-selection')
    ? userSelections.vehicle.suggestions.systems[0].name
    : userSelections.vehicle.suggestions.systems[1].name;

  const priceWithVAT = selectedSystemDiv.querySelector('.system-price-easy-pay').textContent;
  const priceNoVAT = userSelections.vehicle.suggestions.systems.find(
    system => system.name === name
  ).priceNoVAT;
  const systemLogoUrl = systemFullKitLogoUrlDict[name].logo;
  const systemLogoUrlPng = systemFullKitLogoUrlDict[name].pngLogo;
  const fullKitUrl = systemFullKitLogoUrlDict[name].fullKit[userSelections.selectedFuel];
  const cylsDescr = systemFullKitLogoUrlDict[name].cylsDescr;

  return { name, priceWithVAT, priceNoVAT, systemLogoUrl, systemLogoUrlPng, fullKitUrl, cylsDescr };
}

function getNoCreditSettings() {
  if (!userSelections.vehicle.suggestions.systems) return;
  return {
    prokatavoli: +prokatavoliNoCreditSlider.value,
    doseis: +doseisNoCreditSlider.value,
    finalCost: noCreditFinalCost.textContent,
    monthlyCost: noCreditMonthlyCost.textContent
  };
}

function getCreditSettings() {
  if (!userSelections.vehicle.suggestions.systems) return;
  return {
    prokatavoli: +prokatavoliCreditSlider.value,
    doseis: +doseisCreditSelect.value,
    finalCost: creditFinalCost.textContent,
    monthlyCost: creditMonthlyCost.textContent
  };
}

function getCylinderDescrText() {
  if (userSelections.selectedFuel === 'cng') return '';

  const hp = foundVehicleObj.hasOwnProperty('hp')
    ? foundVehicleObj.hp
    : Number(foundVehicleObj.engineCodes[0].split(' ')[0]);
  return hp <= 180 ? ' έως 180HP' : hp <= 360 ? ' έως 360HP' : ' άνω των 360HP';
}

function configureEasyPayAfterSuggestion() {
  configureModelEasyPay();
  configureSystemsEasyPay();
  configureNoCreditSliders();
  configureCreditSliders();
  configureNoCreditResults();
  configureCreditResults();
  configureMetrhtaResults();
  doseisNoCreditSliderOnChange(doseisNoCreditSlider.max); //init on max
}

function configureModelEasyPay() {
  const makeImgSrc = document.querySelector('#makeImg').src;
  const modelNameText = document.querySelector('#modelName').textContent;
  document.querySelector('#makeImgNoCredit').src = makeImgSrc;
  document.querySelector('#makeImgCredit').src = makeImgSrc;
  document.querySelector('#makeImgMetrhta').src = makeImgSrc;
  document.querySelector('#modelNameNoCredit').textContent = modelNameText;
  document.querySelector('#modelNameCredit').textContent = modelNameText;
  document.querySelector('#modelNameMetrhta').textContent = modelNameText;

  [...document.querySelectorAll('.easy-pay-vehicle-container')].map(
    el => (el.style.display = 'flex')
  );
  [...document.querySelectorAll('.easy-pay-with-vehicle-container')].map(
    el => (el.style.display = 'flex')
  );
  [...document.querySelectorAll('.easy-pay-no-vehicle-container')].map(
    el => (el.style.display = 'none')
  );
  [...document.querySelectorAll('.easy-pay-no-vehicle-descr')].map(
    el => (el.style.display = 'none')
  );
}

function configureSystemsEasyPay() {
  const activeContainer = getActiveContainer();
  const systemLogoSrcs = [...activeContainer.querySelectorAll('.system-logo')].map(el => el.src);
  const systemLogoCreditEls = document.querySelectorAll('.system-logo-credit');
  const systemPriceCreditEls = document.querySelectorAll('.system-price-easy-pay');
  const suggestedPrices = [
    ...activeContainer.querySelectorAll(`.suggested-${userSelections.selectedFuel}-price`)
  ].map(el => el.textContent.split('€')[0] * VAT + '€');

  systemLogoCreditEls.forEach((el, i) => (el.src = systemLogoSrcs[i % 2]));
  systemPriceCreditEls.forEach((el, i) => (el.textContent = suggestedPrices[i % 2]));

  if (systemLogoSrcs.length === 2) {
    [...document.querySelectorAll('.easy-pay-first-suggestion-text')].map(
      el => (el.textContent = 'Η ΙΔΑΝΙΚΟΤΕΡΗ ΠΡΟΤΑΣΗ ΜΑΣ')
    );
    [...document.querySelectorAll('.easy-pay-second-suggestion')].map(
      el => (el.style.display = 'block')
    );
  } else {
    [...document.querySelectorAll('.easy-pay-first-suggestion-text')].map(
      el => (el.textContent = 'ΠΡΟΤΑΣΗ ΣΥΣΤΗΜΑΤΟΣ')
    );
    [...document.querySelectorAll('.easy-pay-second-suggestion')].map(
      el => (el.style.display = 'none')
    );
  }
  // document.querySelector('.easy-pay-suggested-system-div').click(); //default selection first suggestion DEBUG
  //Clicking first easy pay system manually
  [...document.querySelectorAll('.system-1st-selection .suggested-system')].map(
    el => (el.style.backgroundColor = 'rgba(132, 184, 211, 0.34)')
  );
  [...document.querySelectorAll('.system-2nd-selection .suggested-system')].map(
    el => (el.style.backgroundColor = 'rgba(241, 241, 241)')
  );
  [...document.querySelectorAll('.system-1st-selection .system-checkmark')].map(
    el => (el.style.display = 'block')
  );
  [...document.querySelectorAll('.system-2nd-selection .system-checkmark')].map(
    el => (el.style.display = 'none')
  );
  changePriceFontWeight(document.querySelector('.system-1st-selection'));

  selectedEasyPaySystemPrice = +document
    .querySelector('.system-price-easy-pay')
    .textContent.replace('€', '');
}

function configureNoCreditSliders() {
  const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;

  prokatavoliNoCreditSlider.max = floorPrice - 500;
  maxProkatavoliNoCreditSliderText.textContent = floorPrice - 500 + '€';

  prokatavoliNoCreditCover.style.width = calcCoverWidth(prokatavoliNoCreditSlider) + '%';
  doseisNoCreditCover.style.width = calcCoverWidth(doseisNoCreditSlider) + '%';
  outputNoCreditProkatavoli.value = prokatavoliNoCreditSlider.value;
  outputNoCreditDoseis.value = doseisNoCreditSlider.value;

  noCreditEnapomeinanPoso.textContent = (
    selectedEasyPaySystemPrice - parseInt(prokatavoliNoCreditSlider.value)
  ).toFixed(1);

  configureNoCreditMaxDoseisSlider();
}

function configureCreditSliders() {
  const floorPrice = Math.floor(selectedEasyPaySystemPrice / 10) * 10;
  prokatavoliCreditSlider.max = floorPrice - 100;
  maxProkatavoliCreditSliderText.textContent = floorPrice - 100 + '€';

  prokatavoliCreditCover.style.width = calcCoverWidth(prokatavoliCreditSlider) + '%';
  outputCreditProkatavoli.value = prokatavoliCreditSlider.value;

  creditEnapomeinanPoso.textContent = (
    selectedEasyPaySystemPrice - parseInt(prokatavoliCreditSlider.value)
  ).toFixed(1);
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

  const monthlyCost = -PMT(
    noCreditInterest / 100 / 12,
    doseisNoCreditSliderValueInt,
    +noCreditEnapomeinanPoso.textContent
  );
  noCreditMonthlyCost.textContent = monthlyCost.toFixed(2) + '€';

  configureEasyPayMonthlyGain();

  noCreditFinalCost.textContent =
    (monthlyCost * doseisNoCreditSliderValueInt + prokatavoliNoCreditSliderValueInt).toFixed(2) +
    '€';
}

function configureCreditResults() {
  const doseisCreditSelectValueInt = +doseisCreditSelect.value;
  const prokatavoliCreditSliderValueInt = +prokatavoliCreditSlider.value;

  const monthlyCost = getCreditMonthlyCost(
    +creditEnapomeinanPoso.textContent,
    doseisCreditSelectValueInt
  );
  creditMonthlyCost.textContent = monthlyCost.toFixed(2) + '€';

  configureEasyPayMonthlyGain();

  creditFinalCost.textContent =
    (
      Math.round(
        (monthlyCost * doseisCreditSelectValueInt + prokatavoliCreditSliderValueInt) * 10
      ) / 10
    ).toFixed(2) + '€';
}

function configureMetrhtaResults() {
  metrhtaFinalCost.textContent = selectedEasyPaySystemPrice.toFixed(2) + '€';
}

function configureEasyPayMonthlyGain() {
  const fuelResult = userSelections.selectedFuel === 'lpg' ? lpgResult : cngResult;
  let monthlyGain = parseFloat(fuelResult.textContent.replace('€', ''));
  if (!perMonthCheckbox.checked) monthlyGain /= 12;

  noCreditMonthlyGain.textContent = monthlyGain.toFixed(2) + '€';
  creditMonthlyGain.textContent = noCreditMonthlyGain.textContent;
  metrhtaYearlyGain.textContent = (monthlyGain * 12).toFixed(2) + '€';
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

  let posoEksoflisis =
    (poso / doseis) *
    0.982 *
    ((1 - 1 / Math.pow(1 + creditInterest / 100 / 12, doseis)) / (creditInterest / 100 / 12));
  posoEksoflisis = Math.round(posoEksoflisis * 100) / 100;
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
  return [...suggestedContainers].filter(
    container => container.style.display !== 'none' && container.style.display
  )[0];
}

/* System Identification END */

/* Basket */
function updateBasketSection(sections) {
  if (sections.selectedFuel) {
    if (userSelections.selectedFuel === 'lpg') {
      document.querySelector('.lpg-btn-basket').style.display = 'block';
      document.querySelector('.cng-btn-basket').style.display = 'none';
    } else {
      document.querySelector('.lpg-btn-basket').style.display = 'none';
      document.querySelector('.cng-btn-basket').style.display = 'block';
    }
  }

  // if (!hasResult()) return;
  if (sections.vehicle) {
    notificationIconBasket.style.display = 'flex';
    document.querySelector('#makeImgBasket').src = document.querySelector('#makeImg').src;
    document.querySelector('#modelNameBasket').textContent =
      document.querySelector('#modelName').textContent;
    document.querySelector('.vehicle-divider-basket').style.display = 'block';
    document.querySelector('.vehicle-container-basket').style.display = 'flex';

    document.querySelector('.suggested-system-text-basket').textContent =
      userSelections.vehicle.suggestions.systems.length > 1
        ? 'Ιδανικότερη πρόταση:'
        : 'Πρόταση συστήματος:';

    document.querySelector('.suggested-system-name-basket').textContent =
      userSelections.vehicle.suggestions.systems[0].name;
    document.querySelector('.easy-pay-system-name-basket').textContent =
      userSelections.vehicle.suggestions.systems[0].name;
    document.querySelector('.suggested-system-price-basket').textContent =
      userSelections.vehicle.suggestions.systems[0].priceNoVAT;

    document.querySelector('.suggestion-container-basket').style.display = 'block';
    document.querySelector('.calculator-container-basket').style.display = 'block';
    document.querySelector('.easy-pay-container-basket').style.display = 'block';

    if (userSelections.vehicle.suggestions.emulators.hasEmulators) {
      if (
        userSelections.vehicle.suggestions.emulators.isMandatory ||
        userSelections.vehicle.suggestions.emulators.isSelected
      ) {
        document.querySelector('.emulator-const-text-basket').textContent =
          userSelections.vehicle.suggestions.emulators.emulatorText;
        document.querySelector('.emulator-const-basket').style.display = 'flex';
        document.querySelector('.emulator-let-basket').style.display = 'none';
      } else {
        document.querySelector('.emulator-let-text-basket').textContent =
          userSelections.vehicle.suggestions.emulators.emulatorText +
          ` (+${userSelections.vehicle.suggestions.emulators.emulatorPrice}€)`;
        document.querySelector('.emulator-const-basket').style.display = 'none';
        document.querySelector('.emulator-let-basket').style.display = 'flex';
      }
    } else {
      document.querySelector('.emulator-const-basket').style.display = 'none';
      document.querySelector('.emulator-let-basket').style.display = 'none';
    }
  }

  if (sections.resetNoVehicle) {
    notificationIconBasket.style.display = 'none';
    document.querySelector('.vehicle-divider-basket').style.display = 'none';
    document.querySelector('.vehicle-container-basket').style.display = 'none';

    document.querySelector('.suggestion-container-basket').style.display = 'none';
    document.querySelector('.calculator-container-basket').style.display = 'none';
    document.querySelector('.easy-pay-container-basket').style.display = 'none';
  }

  if (sections.calculator) {
    document.querySelector('.drive-often-text-basket').textContent =
      userSelections.calculator.driveOftenIndex === 0
        ? 'Εντός πόλης'
        : userSelections.calculator.driveOftenIndex === 1
        ? 'Εκτός πόλης'
        : 'Μικτά';
    document.querySelector('.fuel-place-basket').textContent =
      fuelPricesSelectVehicle.options[fuelPricesSelectVehicle.selectedIndex].innerHTML;
    document.querySelector('.km-per-year-text-basket').textContent =
      userSelections.calculator.kmPerYearValue + ' km';

    document.querySelector('.gain-label-basket').textContent = userSelections.calculator
      .perMonthCheckbox
      ? 'Μηνιαίο όφελος:'
      : 'Ετήσιο όφελος:';
    document.querySelector('.gain-text-basket').textContent = userSelections.calculator.gain;
    document.querySelector('.percentage-text-basket').textContent =
      userSelections.calculator.percentage;
  }

  if (!userSelections.vehicle.suggestions) return;

  if (sections.easyPay) {
    document.querySelector('.easy-pay-method-basket').textContent = userSelections.easyPay.method;
    document.querySelector('.suggested-system-name-basket').textContent =
      userSelections.easyPay.system.name;
    document.querySelector('.easy-pay-system-name-basket').textContent =
      userSelections.easyPay.system.name;
    document.querySelector('.easy-pay-system-vat-basket').textContent =
      userSelections.easyPay.system.priceWithVAT;

    document.querySelector('.suggested-system-text-basket').textContent =
      userSelections.easyPay.system.name === userSelections.vehicle.suggestions.systems[0].name
        ? 'Ιδανικότερη πρόταση:'
        : 'Οικονομικότερη πρόταση:';

    const systemIndex =
      userSelections.easyPay.system.name === userSelections.vehicle.suggestions.systems[0].name
        ? 0
        : 1;
    document.querySelector('.suggested-system-price-basket').textContent =
      userSelections.vehicle.suggestions.systems[systemIndex].priceNoVAT;
  }

  if (hasResult() && sections.prokatavoliDoseis) {
    if (userSelections.easyPay.method === 'Χωρίς πιστωτική κάρτα') {
      document.querySelector('.easy-pay-prokatavoli-basket').textContent =
        userSelections.easyPay.noCreditSettings.prokatavoli + '€';
      document.querySelector('.easy-pay-doseis-basket').textContent =
        userSelections.easyPay.noCreditSettings.doseis;
      document.querySelector('.easy-pay-final-cost-basket').textContent =
        userSelections.easyPay.noCreditSettings.finalCost;
      document.querySelector('.easy-pay-monthly-cost-basket').textContent =
        userSelections.easyPay.noCreditSettings.monthlyCost;

      [...document.querySelectorAll('.not-needed-row-metrhta-basket')].map(
        el => (el.style.display = 'flex')
      );
      [...document.querySelectorAll('.needed-row-metrhta-basket')].map(
        el => (el.style.display = 'none')
      );
    } else if (userSelections.easyPay.method === 'Με πιστωτική κάρτα') {
      document.querySelector('.easy-pay-prokatavoli-basket').textContent =
        userSelections.easyPay.creditSettings.prokatavoli + '€';
      document.querySelector('.easy-pay-doseis-basket').textContent =
        userSelections.easyPay.creditSettings.doseis;
      document.querySelector('.easy-pay-final-cost-basket').textContent =
        userSelections.easyPay.creditSettings.finalCost;
      document.querySelector('.easy-pay-monthly-cost-basket').textContent =
        userSelections.easyPay.creditSettings.monthlyCost;
      [...document.querySelectorAll('.not-needed-row-metrhta-basket')].map(
        el => (el.style.display = 'flex')
      );
      [...document.querySelectorAll('.needed-row-metrhta-basket')].map(
        el => (el.style.display = 'none')
      );
    } else if (userSelections.easyPay.method === 'Μετρητά') {
      document.querySelector('.easy-pay-final-cost-basket').textContent =
        userSelections.easyPay.system.priceWithVAT;
      document.querySelector('.easy-pay-yearly-gain').textContent = userSelections.calculator
        .perMonthCheckbox
        ? (+userSelections.calculator.gain.replace('€', '') * 12).toFixed(2) + '€'
        : userSelections.calculator.gain;
      [...document.querySelectorAll('.not-needed-row-metrhta-basket')].map(
        el => (el.style.display = 'none')
      );
      [...document.querySelectorAll('.needed-row-metrhta-basket')].map(
        el => (el.style.display = 'flex')
      );
    }
  }
  if (sections.easyPayMonthlyGain) {
    document.querySelector('.easy-pay-monthly-gain-basket').textContent = perMonthCheckbox.checked
      ? userSelections.calculator.gain
      : Math.round((userSelections.calculator.gain.replace('€', '') / 12) * 100) / 100 + '€';
  }
}

function isApaitoumenoEmulatorType(type) {
  return apaitoumenaEmulatorTypes.indexOf(type) !== -1;
}

/* Basket END */

/* Calculator */
// let lpgConsumption = 1.15; //15% more than petrol (direct => 1.28)
// let cngConsumption = -0.444; //44,44% less than petrol

const sliders = document.querySelectorAll('.range-slider-calc');
const outputs = document.querySelectorAll('.calc-output');
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

let lpgConsumption, cngConsumption;
let lpgGain, cngGain, lpgExpenses, cngExpenses, petrolExpenses;

function calcResult(allowedToTrigger = true) {
  const selectedVehicleIsDirect = hasResult() && fetchedModelObj.isDirect;

  lpgConsumption = selectedVehicleIsDirect ? 1.28 : 1.15;
  cngConsumption = selectedVehicleIsDirect ? -0.24 : -0.444;

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

    petrolExpenses = +(petrolCostPerMonth * 12).toFixed(1);
    lpgExpenses = +(lpgCostPerMonth * 12).toFixed(1);
    cngExpenses = +(cngCostPerMonth * 12).toFixed(1);

    petrolCost.textContent = petrolExpenses.toFixed(1) + '€';
    lpgCost.textContent = lpgExpenses.toFixed(1) + '€';
    cngCost.textContent = cngExpenses.toFixed(1) + '€';

    lpgGain = +((petrolCostPerMonth - lpgCostPerMonth) * 12).toFixed(2);

    lpgResult.textContent = lpgGain.toFixed(2) + '€';
    lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

    cngGain = +((petrolCostPerMonth - cngCostPerMonth) * 12).toFixed(2);

    cngResult.textContent = cngGain.toFixed(2) + '€';
    cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';

    userSelections.calculator.perMonthCheckbox = false;
  } else {
    costLabels.forEach(label => (label.textContent = 'Μηνιαία Έξοδα:'));
    lpgResultLabel.textContent = 'Μηνιαίο όφελος';
    cngResultLabel.textContent = 'Μηνιαίο όφελος';

    petrolExpenses = +petrolCostPerMonth.toFixed(1);
    lpgExpenses = +lpgCostPerMonth.toFixed(1);
    cngExpenses = +cngCostPerMonth.toFixed(1);

    petrolCost.textContent = petrolExpenses.toFixed(1) + '€';
    lpgCost.textContent = lpgExpenses.toFixed(1) + '€';
    cngCost.textContent = cngExpenses.toFixed(1) + '€';

    lpgGain = +(petrolCostPerMonth - lpgCostPerMonth).toFixed(2);

    lpgResult.textContent = lpgGain.toFixed(2) + '€';
    lpgPercentageEl.textContent = lpgPercentageValue.toFixed(1) + '%';

    cngGain = +(petrolCostPerMonth - cngCostPerMonth).toFixed(2);

    cngResult.textContent = cngGain.toFixed(2) + '€';
    cngPercentageEl.textContent = cngPercentageValue.toFixed(1) + '%';

    petrolExpenses = +(petrolExpenses * 12).toFixed(1);
    lpgExpenses = +(lpgExpenses * 12).toFixed(1);
    cngExpenses = +(cngExpenses * 12).toFixed(1);
    lpgGain = +(lpgGain * 12).toFixed(1);
    cngGain = +(cngGain * 12).toFixed(1);

    userSelections.calculator.perMonthCheckbox = true;
  }

  configureEasyPayMonthlyGain();

  userSelections.calculator.kmPerYearValue = kmPerYear;
  userSelections.calculator.trueConsumption = ltPer100Km;
  userSelections.calculator.gain =
    userSelections.selectedFuel === 'lpg' ? lpgResult.textContent : cngResult.textContent;
  userSelections.calculator.percentage =
    userSelections.selectedFuel === 'lpg'
      ? lpgPercentageEl.textContent
      : cngPercentageEl.textContent;
  updateBasketSection({ calculator: true, easyPayMonthlyGain: true, prokatavoliDoseis: true });

  if (allowedToTrigger && step2Triggered && !step3Triggered) {
    trigger_calculator_step_3({ triggered_via: 'click' });
  }

  calcResultHypothesis({ years: 5 });
  showHintActiveTime = 0;
  hintJustClosed = false;
}

function calcCoverWidth(slider) {
  let offset = (slider.max - slider.value) / (slider.max - slider.min) > 0.2 ? 0 : 1.5;
  return ((slider.max - slider.value) / (slider.max - slider.min)) * 100 + offset;
}

/* Calculator END */

/* STORAGE */
function saveUserSelections() {
  if (typeof Storage !== 'undefined')
    preferredStorage.setItem('userSelections', JSON.stringify(userSelections));
}
function getUserSelections() {
  if (typeof Storage !== 'undefined') return JSON.parse(preferredStorage.getItem('userSelections'));
  return null;
}
function saveUserInfo() {
  if (typeof Storage !== 'undefined')
    preferredStorage.setItem('userInfo', JSON.stringify(userInfo));
}
function getUserInfo() {
  if (typeof Storage !== 'undefined') return JSON.parse(preferredStorage.getItem('userInfo'));
  return null;
}

function isFacebookBrowser() {
  let ua = navigator.userAgent || navigator.vendor || window.opera;
  return ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
}

/* SUMMARY DOWNLOAD */
document.querySelector('.open-download-form').addEventListener('click', e => {
  formType = 'DOWNLOAD';
  showFacebookBrowserProblem(true);
  document.querySelector('#submitSummaryBtn').value = 'Κατέβασε και εκτύπωσε!';
});
document.querySelector('.open-email-form').addEventListener('click', e => {
  formType = 'EMAIL';
  showFacebookBrowserProblem(false);
  document.querySelector('#submitSummaryBtn').value = 'Πάρε με Email!';
});

document
  .querySelector('#submitSummaryBtn')
  .addEventListener('click', e => handleSummarySubmit(e, 'form'));

document
  .querySelector('#downloadSummaryBtnBasket')
  .addEventListener('click', e => downloadSummarySubmit(e, 'basket'));
document
  .querySelector('#emailSummaryBtnBasket')
  .addEventListener('click', e => emailSummarySubmit(e, 'basket'));

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
  if (
    !getActiveContainer() ||
    !userSelections ||
    !Object.keys(userSelections.vehicle).length ||
    (userSelections.vehicle.suggestions && !userSelections.vehicle.suggestions.hasResult)
  ) {
    return false;
  } else return true;
}

function downloadSummarySubmit(e, triggeredFrom) {
  const validationResult = validateUserForm();
  if (!validationResult.valid) return handleInvalidDownload(validationResult.msg);

  [...document.querySelectorAll('.summary-form-error')].map(el => (el.style.display = 'none'));

  dataToSend = userSelections;
  dataToSend.mapBaseUrl = mapBaseUrl;
  dataToSend.userInfo = userInfo;
  delete dataToSend.fuelPrices;
  delete dataToSend.vehicle.identification.fetchedData;

  startLoadingSelect(e.target, triggeredFrom, 'download');
  fetch(downloadSummaryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: dataToSend })
  })
    .then(res => {
      if (res.status !== 200) {
        endLoadingSelect(e.target, triggeredFrom, 'download');
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
      endLoadingSelect(e.target, triggeredFrom, 'download');
      closeSummaryForm();
      trigger_system_summary('download');
    })
    .catch(error => {
      endLoadingSelect(e.target, triggeredFrom, 'download');
      console.error('Error Fetch:', error);
    });
}

function emailSummarySubmit(e, triggeredFrom) {
  const validationResult = validateUserForm();
  if (!validationResult.valid) return handleInvalidDownload(validationResult.msg);

  [...document.querySelectorAll('.summary-form-error')].map(el => (el.style.display = 'none'));

  dataToSend = userSelections;
  dataToSend.mapBaseUrl = mapBaseUrl;
  dataToSend.userInfo = userInfo;
  delete dataToSend.fuelPrices;
  delete dataToSend.vehicle.identification.fetchedData;

  startLoadingSelect(e.target, triggeredFrom, 'email');
  fetch(emailSummaryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: dataToSend })
  })
    .then(res => {
      if (res.status !== 200) {
        endLoadingSelect(e.target, triggeredFrom, 'email');
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
      endLoadingSelect(e.target, triggeredFrom, 'email');
      if (triggeredFrom === 'form') {
        document.querySelector('.summary-success-form').style.display = 'block';
        document.querySelector('.success-msg-email').textContent = userInfo.email;
        setTimeout(() => {
          closeSummaryForm();
          document.querySelector('.summary-success-form').style.display = 'none';
        }, 3000);
      } else if (triggeredFrom === 'basket') {
        document.querySelector('.summary-form-success').style.display = 'block';
        document.querySelector('.success-msg-email-basket').textContent = userInfo.email;
        setTimeout(() => {
          document.querySelector('.summary-form-success').style.display = 'none';
        }, 3000);
      }
      trigger_system_summary('email');
    })
    .catch(error => {
      endLoadingSelect(e.target, triggeredFrom, 'email');
      console.error('Error Fetch:', error);
    });
}

function closeSummaryForm() {
  document.querySelector('.contact-info-container').style.display = 'none';
  document.querySelector('.contact-info-overlay').style.display = 'none';
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
      msg: 'Θα πρέπει πρώτα να επιλέξετε το όχημα σας από το Βήμα 2!'
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

/* STORES */

function initStores() {
  if (userSelections.location) {
    locationOnChange(userSelections.location.place);
  } else {
    locationOnChange(storesLocationSelect.value);
  }
  // enableGPSButtonClick();
}

document.querySelector('#stores').addEventListener('click', () => {
  if (geolocationError) {
    document.querySelector('.geolocation-error').style.display = 'none';
    geolocationError = false;
  }
});

document.querySelector('.open-map-btn').addEventListener('click', () => {
  const url = `${mapBaseUrl}?gps=ΝΟΜΟΣ%20${
    storesLocationSelect.options[storesLocationSelect.selectedIndex].innerHTML
  }&filters=1`;
  window.open(url, '_blank');
});

[...document.querySelectorAll('.enable-gps-btn')].forEach(btn =>
  btn.addEventListener('click', enableGPSButtonClick)
);

async function enableGPSButtonClick({ showError = true } = {}) {
  try {
    const currentLatLng = await getCurrentPosition();
    // console.log('my current position', currentLatLng);
    populateClosestsPins({ lat: currentLatLng[0], lng: currentLatLng[1] });
  } catch (e) {
    console.log('error on geolocation', e);
    if (!showError) return;
    geolocationError = true;
    const error = document.querySelector('.geolocation-error');
    error.textContent = isFacebookBrowser()
      ? 'Ανοίξτε τη σελίδα σε άλλον περιηγητή (Chrome, Firefox κλπ) γιατί το GPS δεν υποστηρίζεται από το περιηγητή του Facebook. Επιλέξτε τις τρεις κουκίδες πάνω δεξιά στις ρυθμίσεις και στη συνέχεια άνοιγμα στο Chrome (ή άλλον περιηγητή).'
      : 'Η τοποθεσία σας είναι απενεργοποιημένη, προσπαθήστε ξανά';
    error.style.display = 'block';
  }
}

function setLocationSelectHeader(label) {
  if (isLocationSelected) return;
  const temp = [...locationSelect.options].map(option => option.outerHTML);
  temp[0] = `<option value="">${label}</option>`;
  locationSelect.innerHTML = temp.join('');
}

storesLocationSelect.addEventListener('change', e => locationOnChange(e.target.value));
function locationOnChange(value) {
  if (!value) {
    isLocationSelected = false;
    return;
  }
  isLocationSelected = true;

  storesLocationSelect.value = value;
  document.querySelector('.searching-place-text-location').textContent =
    storesLocationSelect.options[storesLocationSelect.selectedIndex].innerHTML;
  resetLocationContainer();

  if (
    userSelections.location &&
    userSelections.location.numPlaces &&
    (userSelections.location.numPlaces.places || userSelections.location.numPlaces.places === 0) &&
    userSelections.location.place === value &&
    userSelections.location.place === userSelections.location.numPlaces.place &&
    !isExpired(userSelections.location.numPlaces.expDate)
  ) {
    fetchedPinsLength = userSelections.location.numPlaces.places;
    populateLocationContainerResults(fetchedPinsLength);
    return;
  }

  fetch(numPlaceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ place: value, lovatoServices: ['lovatoSystems'] })
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
      populateLocationContainerResults(fetchedPinsLength);
      userSelections.location.numPlaces = {
        place: storesLocationSelect.value,
        places: fetchedPinsLength,
        expDate:
          !userSelections.location.numPlaces || isExpired(userSelections.location.numPlaces.expDate)
            ? setExpDate(numPlacesCacheTime)
            : userSelections.location.numPlaces.expDate
      };
      saveUserSelections();
    })
    .catch(error => {
      //endLoadingSelect(dimensionSelect);
      //litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Pins Error Fetch:', error);
    });

  // showResults();
}

function resetLocationContainer() {
  document.querySelector('.searching-location').style.display = 'flex';
  // document.querySelector('.location-results-container').style.display = 'none';
}

function populateLocationContainerResults(fetchedPinsLength) {
  if (fetchedPinsLength) {
    document.querySelector('.pins-found').style.display = 'block';
    document.querySelector('.pins-not-found').style.display = 'none';
    document.querySelector('.found-places-text-location').textContent = fetchedPinsLength;
  } else {
    document.querySelector('.pins-found').style.display = 'none';
    document.querySelector('.pins-not-found').style.display = 'block';
  }

  const locationStr = storesLocationSelect.options[storesLocationSelect.selectedIndex].innerHTML;
  document.querySelector('.selected-location-string').textContent =
    locationStr.charAt(0).toUpperCase() + locationStr.slice(1).toLowerCase();

  document.querySelector('.searching-location').style.display = 'none';
  // document.querySelector('#locationResultsContainer').style.display = 'flex';
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

function populateClosestsPins(userLatLng) {
  document.querySelector('.searching-closests').style.display = 'flex';

  fetch(closestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      geometry: userLatLng,
      lovatoServices: ['lovatoSystems'],
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
      document.querySelector('.searching-closests').style.display = 'none';
    })
    .catch(error => {
      //endLoadingSelect(dimensionSelect);
      //litresSelect.innerHTML = '<option value="">Προσπαθήστε ξανά</option>';
      console.error('Pins Error Fetch:', error);
    });
}

function openLocationListContainer() {
  const locationListContainer = document.querySelector('.location-list-container');
  locationListContainer.style.display = 'flex';
  locationListContainer.style.height = 'auto';
}

function addLocationStr(location) {
  document.querySelector('.location-address-string').textContent = location;
}

function prepareClosestList(fetchedClosests) {
  generateListItems(fetchedClosests);
  populateClosestsList(fetchedClosests);
}

function generateListItems(fetchedClosests) {
  const listItem = document.querySelector('.list-item').cloneNode(true);
  const containerList = document.querySelector('.location-list-block');
  [...containerList.querySelectorAll('.list-item')].forEach(el => {
    el.remove();
  });
  for (let i = 0; i < fetchedClosests.length; i++) {
    const cloneListItem = listItem.cloneNode(true);
    containerList.appendChild(cloneListItem);
  }
}

function populateClosestsList(fetchedClosests) {
  let names, addresses, phones, emails, distances, openMaps;

  let geometryParam;
  const filtersParam = '1';

  names = [...document.querySelectorAll('.closest-name')];
  addresses = [...document.querySelectorAll('.closest-address')];
  phones = [...document.querySelectorAll('.closest-phone')];
  emails = [...document.querySelectorAll('.closest-email')];
  distances = [...document.querySelectorAll('.closest-distance')];
  openMaps = [...document.querySelectorAll('.closest-open-map')];

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

/* CSS */

function initCss() {
  //LPG
  document.querySelectorAll('.suggested-overlay-block').forEach(el => {
    mouseLeaveSuggestedOverlayLPG(el);
    el.addEventListener('mouseleave', e => mouseLeaveSuggestedOverlayLPG(el));
  });
  document.querySelectorAll('.suggested-system-value-block').forEach(el => {
    el.addEventListener('mouseenter', e => mouseEnterSuggestedOverlayLPG(el));
  });

  //CNG
  document.querySelectorAll('.suggested-overlay-block-cng').forEach(el => {
    mouseLeaveSuggestedOverlayCNG(el);
    el.addEventListener('mouseleave', e => mouseLeaveSuggestedOverlayCNG(el));
  });
  document.querySelectorAll('.suggested-system-value-block').forEach(el => {
    el.addEventListener('mouseenter', e => mouseEnterSuggestedOverlayCNG(el));
  });
}

function mouseEnterSuggestedOverlayLPG(el) {
  const parent = el.closest('.suggested-lpg-system');
  if (!parent) return;
  const target = parent.querySelector('.suggested-overlay-block');
  target.classList.remove('fade-out');
  target.classList.add('fade-in');
}
function mouseLeaveSuggestedOverlayLPG(el) {
  const parent = el.closest('.suggested-lpg-system');
  const target = parent.querySelector('.suggested-overlay-block');
  target.classList.remove('fade-in');
  target.classList.add('fade-out');
}
function mouseEnterSuggestedOverlayCNG(el) {
  const parent = el.closest('.suggested-cng-system');
  if (!parent) return;
  const target = parent.querySelector('.suggested-overlay-block-cng');
  target.classList.remove('fade-out');
  target.classList.add('fade-in');
}
function mouseLeaveSuggestedOverlayCNG(el) {
  const parent = el.closest('.suggested-cng-system');
  const target = parent.querySelector('.suggested-overlay-block-cng');
  target.classList.remove('fade-in');
  target.classList.add('fade-out');
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
  if (!isEmail(userInfo.email)) return { valid: false, msg: 'Απαιτείται έγκυρο email' };
  if (isNaN(userInfo.phone) || userInfo.phone.length != 10)
    return { valid: false, msg: 'Απαιτείται έγκυρος αριθμός τηλεφώνου (10ψηφία)' };
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
    userSelections: hasResult() && userSelections
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

/* gps # only on mobile */
document
  .querySelector('.gps-btn-after-img')
  .addEventListener(
    'click',
    () => isMobile() && document.querySelector('#storesGPS').scrollIntoView({ behavior: 'smooth' })
  );

function isMobile() {
  return window.matchMedia('screen and (max-width: 768px)').matches;
}

// const seedDate = new Date(2021, 7, 28, 1, 8);
// const seedDate = new Date('9/10/21');
let baseDate;

const _second = 1000;
const _minute = _second * 60;
const _hour = _minute * 60;
const _day = _hour * 24;
const daysCountdown = document.querySelector('#days');
const hoursCountdown = document.querySelector('#hours');
const minutesCountdown = document.querySelector('#minutes');
const secondsCountdown = document.querySelector('#seconds');

function initLotteryCountdown() {
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
      // baseDate = new Date(new Date().getTime() + 60000);
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

function getNextLotteryDate(date) {
  const minutes = 60 * 24 * 10;
  return new Date(date.getTime() + minutes * 60000);
}

/* GTAG */
let gtagDebug = false;
function triggerGtagEvent(eventName, params = {}) {
  if (!gtagDebug && window.location.href.includes('.io'))
    return { status: 'Error', message: 'dev' };
  if (typeof gtag === 'undefined') return { status: 'Error', message: 'gtag undefined' };
  if (typeof eventName === 'undefined' || eventName === '')
    return { status: 'Error', message: 'eventName undefined' };

  gtag('event', eventName, params);
  return {
    status: 'OK',
    message: `"${eventName}" event triggered with params: "${
      Object.keys(params).length && JSON.stringify(params)
    }"`
  };
}

// learn_more_klirwsh
document
  .querySelector('.link-block-6')
  .addEventListener('click', e => trigger_learn_more_klirwsh());
function trigger_learn_more_klirwsh() {
  triggerGtagEvent('learn_more_klirwsh', { from_page: 'arxiki' });
}

// step_2_ok
function trigger_car_step_2() {
  step2Triggered = true;
  step3Triggered = false;
  step4Triggered = false;
  step3ActiveTime = 0;
  step4ActiveTime = 0;

  hintClosedCounter = 0;

  resetProgressSteps();
  changeProgressStepState('car', 'green');
  // changeProgressStepState('calculator', 'next');

  triggerGtagEvent('car_step_2', {
    selected_fuel: userSelections.selectedFuel,
    vehicle_make: userSelections.vehicle.identification.vehicleValues.make,
    vehicle_year: userSelections.vehicle.identification.vehicleValues.year,
    vehicle_model: userSelections.vehicle.identification.vehicleValues.model,
    vehicle_description: userSelections.vehicle.identification.vehicleValues.description,
    suggested_system: userSelections.vehicle.suggestions.systems[0].name
  });
}

function trigger_not_convertible() {
  triggerGtagEvent('not_convertible', {
    selected_fuel: userSelections.selectedFuel,
    vehicle_make: userSelections.vehicle.identification.vehicleValues.make,
    vehicle_year: userSelections.vehicle.identification.vehicleValues.year,
    vehicle_model: userSelections.vehicle.identification.vehicleValues.model,
    vehicle_description: userSelections.vehicle.identification.vehicleValues.description
  });
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  const top = rect.top / (window.innerHeight || document.documentElement.clientHeight);
  const bottom = rect.bottom / (window.innerHeight || document.documentElement.clientHeight);

  return (
    ((top <= 0.5 && top >= 0) ||
      (bottom <= 1 && bottom >= 0.5) ||
      (rect.height >= (window.innerHeight || document.documentElement.clientHeight) &&
        top <= 0.5 &&
        bottom >= 0.5)) &&
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

let systemSummaryTriggered = false;

function trigger_system_summary(type) {
  systemSummaryTriggered = true;
  changeProgressStepState('summary', 'green');
  triggerGtagEvent('system_summary', { summary_type: type });
}

let step2Triggered = false,
  step3ActiveTime = 0,
  step4ActiveTime = 0,
  step3Triggered = false,
  step4Triggered = false,
  stepSecondsNeededToTrigger = 8;

function initStepInterval() {
  setInterval(() => {
    step3CalculatorWatch();
    step4EasyPayWatch();
    showHintWatch();
  }, 1000);
}

function step3CalculatorWatch() {
  if (!step2Triggered) {
    step3ActiveTime = 0;
    return;
  }
  if (isElementInViewport(document.querySelector('#calculator'))) {
    step3ActiveTime++;
    if (step3ActiveTime >= stepSecondsNeededToTrigger && !step3Triggered) {
      trigger_calculator_step_3({ triggered_via: 'time' });
    }
  }
}

function step4EasyPayWatch() {
  if (!step2Triggered) {
    step4ActiveTime = 0;
    return;
  }
  if (isElementInViewport(document.querySelector('#easy-pay'))) {
    step4ActiveTime++;
    if (step4ActiveTime >= stepSecondsNeededToTrigger && !step4Triggered) {
      trigger_easy_pay_step_4({ triggered_via: 'time' });
    }
  }
}

function trigger_calculator_step_3(options) {
  if (!step2Triggered) return;
  step3Triggered = true;
  changeProgressStepState('calculator', 'green');
  triggerGtagEvent('calculator_step_3', options);
}

function trigger_easy_pay_step_4(options) {
  if (!step2Triggered) return;
  step4Triggered = true;

  changeProgressStepState('easy-pay', 'green');
  triggerGtagEvent('easyPay_step_4', options);
}

function changeProgressStepState(stepName, state) {
  let stateClassName, display;
  if (state === 'green') {
    stateClassName = 'green-round-checkbox';
    display = 'flex';
  } else if (state === 'gray') {
    stateClassName = 'green-round-checkbox';
    display = 'none';
  }

  [...document.querySelectorAll(`.progress-step-${stepName} .green-round-checkbox`)].map(
    el => (el.style.display = 'none')
  );
  [...document.querySelectorAll(`.progress-step-${stepName} .${stateClassName}`)].map(
    el => (el.style.display = display)
  );

  if (state === 'green') {
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-number`)].map(
      el => (el.style.opacity = '0.6')
    );
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-text`)].map(
      el => (el.style.opacity = '0.6')
    );
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-number`)].map(
      el => (el.style.fontWeight = 'normal')
    );
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-text`)].map(
      el => (el.style.fontWeight = 'normal')
    );
  } else {
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-number`)].map(
      el => (el.style.opacity = '1')
    );
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-text`)].map(
      el => (el.style.opacity = '1')
    );
  }

  if (getStepState('easy-pay') === 'green') {
    applyNextState('summary');
  } else if (getStepState('calculator') === 'green') {
    applyNextState('easy-pay');
  } else if (getStepState('car') === 'green') {
    applyNextState('calculator');
  } else if (getStepState('fuel') === 'green') {
    applyNextState('car');
  }

  if (stepName === 'summary' && state === 'green') {
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-number`)].map(
      el => (el.style.fontWeight = 'normal')
    );
    [...document.querySelectorAll(`.progress-step-${stepName} .progress-text`)].map(
      el => (el.style.fontWeight = 'normal')
    );
    if (getStepState('calculator') === 'gray' && getStepState('easy-pay') === 'green') {
      applyNextState('calculator');
    }
  }
}

function getStepState(stepName) {
  if (
    document.querySelector(`.progress-step-${stepName} .green-round-checkbox`).style.display ===
    'flex'
  ) {
    return 'green';
  }
  if (
    document.querySelector(`.progress-step-${stepName} .next-checkbox`).style.display === 'flex'
  ) {
    return 'next';
  }
  return 'gray';
}

function applyNextState(stepName) {
  if (getStepState(stepName) === 'green') return;
  [...document.querySelectorAll(`.next-checkbox`)].map(el => (el.style.display = 'none'));
  [...document.querySelectorAll(`.flex-step .progress-number`)].map(
    el => (el.style.fontWeight = 'normal')
  );
  [...document.querySelectorAll(`.flex-step .progress-text`)].map(
    el => (el.style.fontWeight = 'normal')
  );
  [...document.querySelectorAll(`.progress-step-${stepName} .next-checkbox`)].map(
    el => (el.style.display = 'flex')
  );
  [...document.querySelectorAll(`.progress-step-${stepName} .progress-number`)].map(
    el => (el.style.fontWeight = 'bold')
  );
  [...document.querySelectorAll(`.progress-step-${stepName} .progress-text`)].map(
    el => (el.style.fontWeight = 'bold')
  );
}

function resetProgressSteps() {
  changeProgressStepState('fuel', 'green');
  changeProgressStepState('car', 'gray');
  changeProgressStepState('calculator', 'gray');
  changeProgressStepState('easy-pay', 'gray');
  changeProgressStepState('summary', 'gray');
  // changeProgressStepState('car', 'next');
}

/* Hints */
const hintEl = document.querySelector('.hint');
let showHintActiveTime = 0,
  hintJustClosed = false,
  hintClosedCounter = 0;
const hintSecondsNeededToTrigger = 7;
const hintClosedLimit = 2;

function showHintWatch() {
  if (!step2Triggered || hintJustClosed || hintClosedCounter >= hintClosedLimit) {
    showHintActiveTime = 0;
    return;
  }
  if (isElementInViewport(document.querySelector('#calculator'))) {
    showHintActiveTime++;
    if (showHintActiveTime >= hintSecondsNeededToTrigger) {
      showHint({ section: 'calculator' });
    }
  } else {
    hintEl.classList.remove('show-hint');
  }
}

document.querySelector('.hint-close-btn').addEventListener('click', e => {
  hintClosedCounter++;
  hintJustClosed = true;
  hintEl.classList.remove('show-hint');
});

function showHint({ section }) {
  if (section === 'calculator') {
    hintEl.classList.add('show-hint');
  }
}

function calcResultHypothesis({ years }) {
  const fuelGain = userSelections.selectedFuel === 'lpg' ? lpgGain : cngGain;
  const savingsAfterYears = Math.ceil(fuelGain * years).toLocaleString('el');
  const expensesAfterYears = Math.ceil(petrolExpenses * years).toLocaleString('el');
  const fuelTypeString = userSelections.selectedFuel === 'lpg' ? 'υγραεριοκίνηση' : 'φυσικό αέριο';
  paintResultHypothesis(years, fuelTypeString, savingsAfterYears, expensesAfterYears);
}

function paintResultHypothesis(years, fuelTypeString, savingsAfterYears, expensesAfterYears) {
  document.querySelector('.hint-years').textContent = years;
  document.querySelector('.hint-fuel').textContent = fuelTypeString;
  document.querySelector('.hint-savings').textContent = savingsAfterYears + '€';
  document.querySelector('.hint-expenses').textContent = expensesAfterYears + '€';
}

/* Include Emulator Price */
[...document.querySelectorAll('.check-wrapper')].forEach(wrapper => {
  wrapper.addEventListener('click', e => {
    const emulatorType = userSelections.vehicle.suggestions.emulators.type;
    const emulatorPrice = emulatorPriceDict[emulatorType];
    const activeContainer = getActiveContainer();
    const activeContainerChecks = [...activeContainer.querySelectorAll('.check')];

    emulatorSelected = activeContainerChecks[0].style.display !== 'block';

    activeContainerChecks.map(
      thisCheck => (thisCheck.style.display = emulatorSelected ? 'block' : 'none')
    );

    activeContainer
      .querySelectorAll(`.suggested-${userSelections.selectedFuel}-price`)
      .forEach(priceEl => {
        const prevPriceNumber = +priceEl.textContent.split('€')[0];

        if (emulatorSelected)
          suggestedPricesChanges.push({ priceEl, defaultPrice: prevPriceNumber });

        const newPriceNumber = emulatorSelected
          ? prevPriceNumber + emulatorPrice
          : prevPriceNumber - emulatorPrice;
        priceEl.textContent = newPriceNumber + '€ + ΦΠΑ';
      });

    configureEasyPayAfterSuggestion();
    configureUserSelectionsAfterResults();
    updateBasketSection({
      vehicle: true,
      calculator: true,
      easyPay: true,
      prokatavoliDoseis: true,
      easyPayMonthlyGain: true
    });
  });
});

document.querySelector('.sidebar-btn').addEventListener('click', e => {
  trigger_sidebar_open({
    step_2_triggered: step2Triggered,
    step_3_triggered: step3Triggered,
    step_4_triggered: step4Triggered,
    system_summary_triggered: systemSummaryTriggered
  });
});

function trigger_sidebar_open(options) {
  triggerGtagEvent('sidebar_open', options);
}

function getSourceReferrerDomain() {
  let sourceURL =
    window.location != window.parent.location ? document.referrer : document.location.href;
  sourceReferrerDomain = new URL(sourceURL).hostname;
  console.log('sourceReferrerDomain', sourceReferrerDomain);
}
