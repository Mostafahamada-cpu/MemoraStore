/* ================================================================
   MEMORA — Icon set (line icons, same style as the invitation demos:
   24×24 viewBox, no fill, currentColor stroke, 1.4 stroke width)
   MemoraIcons.svg('henna')            -> inline <svg> markup
   MemoraIcons.forItem(product|bundle)  -> icon key for a catalog item
   ================================================================ */
(function () {
  const paths = {
    // occasions
    wedding: '<circle cx="9" cy="13" r="5"/><circle cx="15" cy="13" r="5"/><path d="M9 8l1.5-3h3L15 8"/>',
    engagement: '<circle cx="12" cy="14" r="6"/><path d="M9.5 8l1.2-3h2.6l1.2 3M12 5l-1.5-2h3z"/>',
    henna: '<path d="M12 3c-3 3-3 6 0 8 3-2 3-5 0-8z"/><path d="M12 11v10"/><path d="M12 15c-2.5 0-4-1.5-5-3.5M12 15c2.5 0 4-1.5 5-3.5"/><path d="M12 19c-2 0-3.5-1-4.5-2.5M12 19c2 0 3.5-1 4.5-2.5"/>',
    birthday: '<path d="M4 20h16"/><path d="M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 15c1.3 1.2 2.6 1.2 4 0 1.3 1.2 2.6 1.2 4 0 1.3 1.2 2.6 1.2 4 0"/><path d="M12 11V8"/><path d="M12 5c-.8 1-.8 2 0 3 .8-1 .8-2 0-3z"/>',
    'gender-reveal': '<path d="M4 10h16v10H4z"/><path d="M12 10v10M4 14h16"/><path d="M12 10c-3 0-5-1.5-5-3s1.5-2 2.5-1.5S12 8 12 10zM12 10c3 0 5-1.5 5-3s-1.5-2-2.5-1.5S12 8 12 10z"/>',
    bachelorette: '<path d="M6 3h5l-1 7a2.5 2.5 0 0 1-3 0z"/><path d="M13 3h5l-1 7a2.5 2.5 0 0 1-3 0z"/><path d="M8.5 10.5V20M15.5 10.5V20M6 20h5M13 20h5"/><path d="M11 6.5h2"/>',
    game: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".6"/><circle cx="17.5" cy="13.5" r=".6"/>',
    date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 18c2-1.6 3.5-3 3.5-4.5a1.75 1.75 0 0 0-3.5-.5 1.75 1.75 0 0 0-3.5.5C8.5 15 10 16.4 12 18z"/>',
    bundle: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    custom: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/><path d="M4 3l.5 1.5L6 5l-1.5.5L4 7l-.5-1.5L2 5l1.5-.5z"/>',
    // add-ons
    location: '<path d="M12 21c4-4 7-7.5 7-11a7 7 0 1 0-14 0c0 3.5 3 7 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    countdown: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 3h4M12 3v2"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'background-animation': '<path d="M3 17c3-4 6-4 9 0s6 4 9 0"/><path d="M3 11c3-4 6-4 9 0s6 4 9 0"/><path d="M6 5h.01M12 4h.01M18 5h.01"/>',
    gallery: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    'our-story': '<path d="M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z"/><path d="M12 6v14"/>',
    rsvp: '<path d="M20 6L9 17l-5-5"/>',
    'custom-animation': '<path d="M5 4h14v11H5z"/><path d="M9 15v5M15 15v5M7 20h10"/><path d="M12 7l1 2.2 2.4.3-1.8 1.6.5 2.4L12 12.3l-2.1 1.2.5-2.4L8.6 9.5 11 9.2z"/>',
    // ui
    check: '<path d="M20 6L9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 9.5c.3 2.6 2.9 5.2 5.5 5.5l1.5-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    device: '<rect x="3" y="5" width="13" height="12" rx="2"/><path d="M7 20h5"/><rect x="16" y="9" width="5" height="11" rx="1.5"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h1.5a3.5 3.5 0 0 0 3.5-3.5C20 7.5 16.5 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    infinity: '<path d="M12 12c-2-3-3.5-4.5-6-4.5a4.5 4.5 0 0 0 0 9c2.5 0 4-1.5 6-4.5s3.5-4.5 6-4.5a4.5 4.5 0 0 1 0 9c-2.5 0-4-1.5-6-4.5z"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    party: '<path d="M5 20l3.5-11 7.5 7.5z"/><path d="M9.5 8.5c1.5-1.5 3-1.5 4.5 0M13 5l1-2M17 8l2-1M16 12l2 1"/>',
  };

  const byEvent = { wedding: 'wedding', engagement: 'engagement', henna: 'henna', birthday: 'birthday', 'gender-reveal': 'gender-reveal', bachelorette: 'bachelorette', date: 'date', custom: 'custom', bundle: 'bundle' };

  function svg(key, cls = '') {
    const d = paths[key] || paths.custom;
    return `<svg class="m-icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  function forItem(item) {
    if (!item) return 'custom';
    if (item.icon && paths[item.icon]) return item.icon;         // admin can set the icon key directly
    if (item.slug && paths[item.slug]) return item.slug;          // add-ons: slug = icon key
    if (item.slug === 'bachelorette-game') return 'game';
    if (item.kind === 'bundle') return 'bundle';
    if (item.type === 'custom') return 'custom';
    return byEvent[item.eventType] || 'custom';
  }

  window.MemoraIcons = { svg, forItem, keys: Object.keys(paths) };
})();
