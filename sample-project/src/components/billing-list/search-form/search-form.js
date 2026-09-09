(function () {
  "use strict";

  const components = document.querySelectorAll(
    '[data-component="search-form"]',
  );

  components.forEach((component) => {
    const input = component.querySelector('[data-field="billing-number"]');
    const searchButton = component.querySelector('[data-action="search"]');
    const clearButton = component.querySelector('[data-action="clear"]');

    searchButton?.addEventListener("click", () => {
      component.dispatchEvent(
        new CustomEvent("app:search", {
          bubbles: true,
          detail: { billingNumber: input?.value.trim() ?? "" },
        }),
      );
    });

    clearButton?.addEventListener("click", () => {
      if (input) input.value = "";
      component.dispatchEvent(
        new CustomEvent("app:search", {
          bubbles: true,
          detail: { billingNumber: "" },
        }),
      );
    });
  });
})();
