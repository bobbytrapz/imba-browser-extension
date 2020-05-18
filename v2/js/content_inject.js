if (!window.didInject) {
    window.didInject = true;
    window.browser = (function () {
        return window.msBrowser ||
            window.browser ||
            window.chrome;
    })();
    const url = browser.extension.getURL(`/pages/_content.html`);
    fetch(url)
        .then(res => res.text())
        .then(data => {
            document.body.innerHTML += data;
        })
        .catch(err => {
            console.error(`_content.html: ${err}`);
        });
}
