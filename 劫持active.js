(function () {
  Object.defineProperty(document, "hidden", {
    get: function () {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(document, "visibilityState", {
    get: function () {
      return "visible";
    },
    configurable: true,
  });

  document.hasFocus = function () {
    return true;
  };

  const events = ["visibilitychange", "blur", "focusout", "pagehide"];

  events.forEach((eventType) => {
    window.addEventListener(
      eventType,
      function (e) {
        console.log(`%c🚫 拦截了 window.${eventType}`, "color: red;");
        e.stopImmediatePropagation();
        e.preventDefault();
      },
      true
    );

    document.addEventListener(
      eventType,
      function (e) {
        console.log(`%c🚫 拦截了 document.${eventType}`, "color: red;");
        e.stopImmediatePropagation();
        e.preventDefault();
      },
      true
    );
  });

  setInterval(() => {
    window.dispatchEvent(new Event("focus"));
  }, 1000);
})();
