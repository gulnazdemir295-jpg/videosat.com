// AWS IVS Browser Service
// WARNING: Do NOT embed AWS credentials or stream keys in client code in production.
// Keys/tokens must be delivered via secure backend endpoints.

(function() {
  if (typeof window === 'undefined') return;

  // Internal cache (can be set by pages after fetching backend config)
  window.__ivsPlaybackUrl = window.__ivsPlaybackUrl || '';

  function isIVSPlayerSupported() {
    return !!(window.IVSPlayer && window.IVSPlayer.isPlayerSupported);
  }

  async function setupIVSPlayer(videoEl, playbackUrl) {
    if (!videoEl || !playbackUrl) return false;
    try {
      if (isIVSPlayerSupported()) {
        const player = window.IVSPlayer.create();
        player.attachHTMLVideoElement(videoEl);
        player.load(playbackUrl);
        await player.play();
        return true;
      } else {
        videoEl.src = playbackUrl;
        await videoEl.play().catch(() => {});
        return true;
      }
    } catch (e) {
      console.warn('IVS player setup failed:', e);
      return false;
    }
  }

  async function startIVSBrowserPublish(videoEl) {
    // Placeholder: Real publishing should be done via encoder or Web Broadcast SDK
    // using a secure, short-lived auth flow from backend.
    console.log('startIVSBrowserPublish(): placeholder called');
    return { ok: true };
  }

  function stopIVSPublish() {
    console.log('stopIVSPublish(): placeholder called');
  }

  window.awsIVSService = {
    getPlaybackUrl: () => window.__ivsPlaybackUrl || '',
    setPlaybackUrl: (url) => { window.__ivsPlaybackUrl = url || ''; },
    setupIVSPlayer,
    startIVSBrowserPublish,
    stopIVSPublish,
  };
})();

