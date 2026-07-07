(function(){

  /* =====================================================
     EDIT ME — quick personalization points
     ===================================================== */
  var SPOTIFY_TRACK_URL = "https://open.spotify.com/track/5k4lqXHUPP36MAaFkvBck9?si=1085254f42b6479c";           // paste a Spotify track/playlist share link here, e.g. "https://open.spotify.com/track/XXXXXXXX"
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

  /* ============ ENVELOPE INTRO ============ */
  var envelopeOpened = false;
  var envelopeWrapper = document.getElementById('envelope-wrapper');
  var envelopeContainer = document.querySelector('.envelope');
  var openEnvelopeBtn = document.getElementById('open-btn');

  function openEnvelope(){
    if (envelopeOpened) return;
    envelopeOpened = true;
    if (envelopeContainer) envelopeContainer.classList.add('open');
    if (openEnvelopeBtn){
      openEnvelopeBtn.style.opacity = '0';
      openEnvelopeBtn.style.transform = 'translateY(10px)';
      openEnvelopeBtn.style.pointerEvents = 'none';
    }
    setTimeout(function(){
      if (envelopeWrapper) envelopeWrapper.classList.add('fade-out');
      setTimeout(function(){
        if (envelopeWrapper) envelopeWrapper.style.display = 'none';
      }, 680);
    }, 1400);
  }
  if (openEnvelopeBtn) openEnvelopeBtn.addEventListener('click', openEnvelope);
  if (envelopeContainer) envelopeContainer.addEventListener('click', openEnvelope);

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

  /* ============ RSVP SUBMIT ============ */
  var form = document.getElementById('rsvp-form');
  var confirmBox = document.getElementById('rsvp-confirm');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('r-name').value.trim();
    if (!name) return;

    var data = {
      name: name,
      attending: form.querySelector('input[name="attending"]:checked').value,
      guests: document.getElementById('r-guests').value,
      meal: document.getElementById('r-meal').value,
      song: document.getElementById('r-song').value.trim(),
      message: document.getElementById('r-msg').value.trim(),
      timestamp: new Date().toISOString()
    };

    var key = 'rsvp:' + Date.now() + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g,'-');

    function showConfirm(){
      form.style.display = 'none';
      confirmBox.classList.add('show');
    }

    if (window.storage && window.storage.set){
      window.storage.set(key, JSON.stringify(data), true)
        .then(function(result){
          showConfirm();
          if (!result){ console.warn('RSVP may not have saved — storage returned empty result.'); }
        })
        .catch(function(err){
          console.error('RSVP storage error:', err);
          showConfirm();
        });
    } else {
      showConfirm();
    }
  });

  /* ============ ADMIN VIEW ============ */
  var adminLink = document.getElementById('admin-link');
  var adminModal = document.getElementById('admin-modal');
  var adminList = document.getElementById('admin-list');
  var adminClose = document.getElementById('admin-close');

  adminClose.addEventListener('click', function(){ adminModal.classList.remove('open'); });

  adminLink.addEventListener('click', function(){
    var pass = window.prompt('Couple\'s passphrase:');
    if (pass !== ADMIN_PASSPHRASE){
      if (pass !== null) alert('Incorrect passphrase.');
      return;
    }
    adminModal.classList.add('open');
    adminList.innerHTML = '<p class="admin-empty">Loading...</p>';

    if (!(window.storage && window.storage.list)){
      adminList.innerHTML = '<p class="admin-empty">Storage isn\'t available in this view.</p>';
      return;
    }

    window.storage.list('rsvp:', true).then(function(res){
      var keys = (res && res.keys) ? res.keys : [];
      if (!keys.length){
        adminList.innerHTML = '<p class="admin-empty">No RSVPs yet.</p>';
        return;
      }
      Promise.all(keys.map(function(k){
        return window.storage.get(k, true).catch(function(){ return null; });
      })).then(function(results){
        var entries = results
          .filter(Boolean)
          .map(function(r){ try { return JSON.parse(r.value); } catch(e){ return null; } })
          .filter(Boolean)
          .sort(function(a,b){ return new Date(b.timestamp) - new Date(a.timestamp); });

        if (!entries.length){
          adminList.innerHTML = '<p class="admin-empty">No RSVPs yet.</p>';
          return;
        }

        adminList.innerHTML = entries.map(function(e){
          return '<div class="admin-row"><b>' + escapeHtml(e.name) + ' — ' + escapeHtml(e.attending) + '</b>' +
            '<span>Guests: ' + escapeHtml(String(e.guests)) + ' &middot; Meal: ' + escapeHtml(e.meal) +
            (e.song ? ' &middot; Song: ' + escapeHtml(e.song) : '') + '</span>' +
            (e.message ? '<div style="margin-top:6px; font-style:italic;">' + escapeHtml(e.message) + '</div>' : '') +
            '</div>';
        }).join('');
      });
    }).catch(function(err){
      adminList.innerHTML = '<p class="admin-empty">Couldn\'t load responses.</p>';
      console.error(err);
    });
  });

  function escapeHtml(str){
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

})();