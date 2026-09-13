(function () {
  "use strict";

  const components = document.querySelectorAll(
    '[data-component="back-button"]',
  );

  components.forEach((component) => {
    component.addEventListener("click", () => {
      component.dispatchEvent(
        new CustomEvent("app:prototype-action", {
          bubbles: true,
          detail: { action: "back" },
        }),
      );
    });
  });
})();
