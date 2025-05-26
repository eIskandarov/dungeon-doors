if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(registration => registration.update())
    .then(reg => console.log('Service worker registered.', reg));
}
