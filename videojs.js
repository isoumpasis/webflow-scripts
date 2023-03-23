videojs.addLanguage('el', {
  Play: 'Aναπαραγωγή',
  Pause: 'Παύση',
  'Current Time': 'Τρέχων χρόνος',
  Duration: 'Συνολικός χρόνος',
  'Remaining Time': 'Υπολοιπόμενος χρόνος',
  'Play Video': 'Αναπαραγωγή',
  Fullscreen: 'Πλήρης οθόνη',
  'Exit Fullscreen': 'Έξοδος από πλήρη οθόνη',
  Mute: 'Σίγαση',
  Unmute: 'Kατάργηση σίγασης',
  'Playback Rate': 'Ρυθμός αναπαραγωγής',
  Subtitles: 'Υπότιτλοι',
  'subtitles off': 'απόκρυψη υπότιτλων',
  Captions: 'Λεζάντες',
  'captions off': 'απόκρυψη λεζάντων',
  'Close Modal Dialog': 'Κλείσιμο παραθύρου',
  'You aborted the media playback': 'Ακυρώσατε την αναπαραγωγή',
  'A network error caused the media download to fail part-way.':
    'Ένα σφάλμα δικτύου προκάλεσε την αποτυχία μεταφόρτωσης του αρχείου προς αναπαραγωγή.',
  'The media could not be loaded, either because the server or network failed or because the format is not supported.':
    'Το αρχείο προς αναπαραγωγή δεν ήταν δυνατό να φορτωθεί είτε γιατί υπήρξε σφάλμα στον διακομιστή ή το δίκτυο, είτε γιατί ο τύπος του αρχείου δεν υποστηρίζεται.',
  'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.':
    'Η αναπαραγωγή ακυρώθηκε είτε λόγω κατεστραμμένου αρχείου, είτε γιατί το αρχείο απαιτεί λειτουργίες που δεν υποστηρίζονται από το πρόγραμμα περιήγησης που χρησιμοποιείτε.',
  'No compatible source was found for this media.':
    'Δεν βρέθηκε συμβατή πηγή αναπαραγωγής για το συγκεκριμένο αρχείο.',
  'The media is encrypted and we do not have the keys to decrypt it.':
    'Το αρχείο προς αναπαραγωγή είναι κρυπτογραφημένo και δεν υπάρχουν τα απαραίτητα κλειδιά αποκρυπτογράφησης.',
  Close: 'Κλείσιμο',
  'Modal Window': 'Aναδυόμενο παράθυρο',
  'This is a modal window': 'Το παρών είναι ένα αναδυόμενο παράθυρο',
  'This modal can be closed by pressing the Escape key or activating the close button.':
    'Αυτό το παράθυρο μπορεί να εξαφανιστεί πατώντας το πλήκτρο Escape ή πατώντας το κουμπί κλεισίματος.',
  ', opens captions settings dialog': ', εμφανίζει τις ρυθμίσεις για τις λεζάντες',
  ', opens subtitles settings dialog': ', εμφανίζει τις ρυθμίσεις για τους υπότιτλους',
  ', opens descriptions settings dialog': ', εμφανίζει τις ρυθμίσεις για τις περιγραφές',
  ', selected': ', επιλεγμένο',
  'Picture-in-Picture': 'Προβολή σε παράθυρο'
});

let bigPlayBtn, heroVideo;

let videoStarted = false;

const player = videojs('heroVideo', {
  language: 'el',
  controls: false,
  loop: true,
  playsinline: true,
  fluid: true,
  muted: true,
  autoplay: true
  // aspectRatio: "16:9"
});

let interval = null;

player.on('ready', function () {
  console.log('ready');
  bigPlayBtn = document.querySelector('.vjs-big-play-button');
  heroVideo = document.querySelector('#heroVideo');

  bigPlayBtn.style.display = 'block';
  heroVideo.style.cursor = 'pointer';

  interval = setInterval(() => {
    console.log(player.currentTime());
    player.currentTime(0);
  }, 3000);
});

// player.on('click', function (e) {
heroVideo.addEventListener('click', e => {
  bigPlayBtn.style.display = 'none';
  heroVideo.style.cursor = 'default';
  if (interval) {
    clearInterval(interval);
    interval = null;

    player.controls(true);
    player.muted(false);
    player.currentTime(0);
  }
});
// });
