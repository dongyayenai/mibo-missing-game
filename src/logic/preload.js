const imageCache = new Map();
const audioCache = new Map();
const IMAGE_PRELOAD_TIMEOUT_MS = 5000;

export function preloadImages(urls) {
  const preloadTasks = urls.map((url) => {
    if (imageCache.has(url)) {
      return imageCache.get(url);
    }

    const preloadTask = new Promise((resolve) => {
      const image = new Image();
      let settled = false;
      let timeoutId;
      const settle = (result) => {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        image.onload = null;
        image.onerror = null;
        resolve(result);
      };

      image.onload = () => {
        console.log('Image loaded:', url);
        settle({ url, status: 'loaded' });
      };
      image.onerror = () => {
        console.error('Image failed:', url);
        settle({ url, status: 'failed' });
      };
      image.src = url;
      timeoutId = window.setTimeout(() => {
        console.warn('Image timed out:', url);
        settle({ url, status: 'timed-out' });
      }, IMAGE_PRELOAD_TIMEOUT_MS);
    });

    imageCache.set(url, preloadTask);
    return preloadTask;
  });

  return Promise.allSettled(preloadTasks).then((results) => {
    const imageResults = results.map((result) => (
      result.status === 'fulfilled'
        ? result.value
        : { url: 'unknown', status: 'failed' }
    ));
    const failedUrls = imageResults
      .filter((result) => result.status === 'failed')
      .map((result) => result.url);
    const timedOutUrls = imageResults
      .filter((result) => result.status === 'timed-out')
      .map((result) => result.url);
    const summary = {
      totalImages: urls.length,
      loadedCount: imageResults.filter((result) => result.status === 'loaded').length,
      failedUrls,
      timedOutUrls,
    };

    console.log('Image preload summary:', summary);

    if (failedUrls.length > 0 || timedOutUrls.length > 0) {
      console.warn('Some images failed to preload; continuing anyway.', {
        failedUrls,
        timedOutUrls,
      });
    }

    return summary;
  });
}

export function preloadAudio(urls) {
  const preloadTasks = urls.map((url) => {
    if (audioCache.has(url)) {
      return audioCache.get(url);
    }

    const preloadTask = new Promise((resolve) => {
      try {
        const audio = new Audio();
        let settled = false;
        let timeoutId;
        const settle = (loaded) => {
          if (settled) {
            return;
          }

          settled = true;
          window.clearTimeout(timeoutId);
          audio.removeEventListener('canplaythrough', finish);
          audio.removeEventListener('loadeddata', finish);
          audio.removeEventListener('error', fail);
          resolve({ url, loaded });
        };
        const finish = () => settle(true);
        const fail = () => settle(false);

        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', finish, { once: true });
        audio.addEventListener('loadeddata', finish, { once: true });
        audio.addEventListener('error', fail, { once: true });
        audio.src = url;
        audio.load();
        timeoutId = window.setTimeout(fail, 3000);
      } catch {
        resolve({ url, loaded: false });
      }
    });

    audioCache.set(url, preloadTask);
    return preloadTask;
  });

  return Promise.all(preloadTasks);
}
