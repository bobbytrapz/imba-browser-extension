(async () => {
      console.log("import.meta.url=", import.meta.url);
      window.browser = (function () {
        return window.msBrowser ||
            window.browser ||
            window.chrome;
      })();
    }
)()
