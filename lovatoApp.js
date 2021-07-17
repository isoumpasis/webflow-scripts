const preferredStorage = localStorage;

document.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
});

function saveUserInfo() {
  if (typeof Storage !== 'undefined')
    preferredStorage.setItem('userInfo', JSON.stringify(userInfo));
}
function getUserInfo() {
  if (typeof Storage !== 'undefined') return JSON.parse(preferredStorage.getItem('userInfo'));
  return null;
}

function initUserInfo() {
  let tempUserInfo = getUserInfo();
  if (
    !tempUserInfo
    // || Object.keys(tempUserInfo).length !== 4
  )
    return;
  userInfo = tempUserInfo;
  [...document.querySelectorAll('.user-info-username')].map(
    el => (el.value = userInfo.username || '')
  );
  [...document.querySelectorAll('.user-info-email')].map(el => (el.value = userInfo.email || ''));
  [...document.querySelectorAll('.user-info-phone')].map(el => (el.value = userInfo.phone || ''));

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
