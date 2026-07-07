(function(){

  /* =====================================================
     EDIT ME — quick personalization points
     ===================================================== */
  var SPOTIFY_TRACK_URL = "https://open.spotify.com/track/6YYjo0Q9iYlG3KrUOPr1kt?si=971689abd8b24373";           // paste a Spotify track/playlist share link here, e.g. "https://open.spotify.com/track/XXXXXXXX"
  var WEDDING_DATE = new Date(2026, 9, 7, 18, 0, 0); // Oct 7, 2026, 6:00 PM (change the "18" if the ceremony time differs)
  var ADMIN_PASSPHRASE = "omarrowan2026"; // couple-only passphrase to view RSVPs

  /* ============ PRELOADER ============ */
  var minTime = new Promise(function(res){ setTimeout(res, 1700); });
  var loaded = new Promise(function(res){
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res);
  });
  Promise.all([minTime, loaded]).then(function(){
    document.getElementById('preloader').classList.add('hide');
    document.body.classList.add('loaded');
  });

  /* ============ SCROLL REVEAL ============ */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, {threshold:.15});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ============ COUNTDOWN ============ */
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var diff = WEDDING_DATE - new Date();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff/86400000);
    var h = Math.floor(diff%86400000/3600000);
    var m = Math.floor(diff%3600000/60000);
    var s = Math.floor(diff%60000/1000);
    document.getElementById('cd-days').textContent = pad(d);
    document.getElementById('cd-hours').textContent = pad(h);
    document.getElementById('cd-mins').textContent = pad(m);
    document.getElementById('cd-secs').textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ============ NARRATED LOVE STORY ============ */
  var narrateBtn = document.getElementById('narrate-btn');
  var narrateLabel = document.getElementById('narrate-label');
  var storyText = document.getElementById('story-text').innerText;
  var utterance = null;

  if ('speechSynthesis' in window){
    narrateBtn.addEventListener('click', function(){
      if (speechSynthesis.speaking){
        speechSynthesis.cancel();
        return;
      }
      utterance = new SpeechSynthesisUtterance(storyText);
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onstart = function(){
        narrateBtn.classList.add('speaking');
        narrateBtn.setAttribute('aria-pressed','true');
        narrateLabel.textContent = 'Pause Narration';
      };
      utterance.onend = utterance.onerror = function(){
        narrateBtn.classList.remove('speaking');
        narrateBtn.setAttribute('aria-pressed','false');
        narrateLabel.textContent = 'Listen to Our Story';
      };
      speechSynthesis.speak(utterance);
    });
  } else {
    narrateBtn.style.display = 'none';
  }

  /* ============ MUSIC WIDGET ============ */
  var musicBtn = document.getElementById('music-btn');
  var musicPanel = document.getElementById('music-panel');
  var frameWrap = document.getElementById('music-frame-wrap');
  var emptyState = document.getElementById('music-empty-state');

  function spotifyEmbedSrc(url){
    var m = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0';
  }

  var embedSrc = SPOTIFY_TRACK_URL ? spotifyEmbedSrc(SPOTIFY_TRACK_URL) : null;
  if (embedSrc){
    emptyState.style.display = 'none';
    frameWrap.style.display = 'block';
    frameWrap.innerHTML = '<iframe src="' + embedSrc + '" width="100%" height="152" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe>';
  }

  musicBtn.addEventListener('click', function(){
    var open = musicPanel.classList.toggle('open');
    musicBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    musicBtn.classList.toggle('playing', open && !!embedSrc);
  });

  

})();