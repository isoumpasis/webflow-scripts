const par = document.querySelector('.paragraph-2');
console.log('whyn ontih???gn');

document.querySelector('DOMContentLoaded', () => {
  console.log('whyn ontihgn');
  if (
    typeof Storage !== 'undefined' &&
    localStorage.suggestedSystems &&
    localStorage.selectedSystem
  ) {
    const suggestedSystems = JSON.parse(localStorage.suggestedSystems);
    const selectedSystem = localStorage.selectedSystem;

    par.innerHTML += `<br>Προτάθηκαν: `;
    suggestedStr = `<span style='text-decoration:underline;'>${suggestedSystems[0]}</span>`;
    if (suggestedSystems.length > 1)
      suggestedStr += `, <span style='text-decoration:underline;'>${suggestedSystems[1]}</span>`;
    par.innerHTML += suggestedStr;

    par.innerHTML += `<br>Επιλέχτηκε: <span style='text-decoration:underline;'>${selectedSystem}</span>`;
  }
});
