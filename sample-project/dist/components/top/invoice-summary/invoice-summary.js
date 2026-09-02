const components = document.querySelectorAll(
  '[data-component="invoice-summary"]',
);

components.forEach((component) => {
  const button = component.querySelector(
    '[data-action="view-contract-status"]',
  );

  button?.addEventListener("click", () => {
    component.dispatchEvent(
      new CustomEvent("app:prototype-action", {
        bubbles: true,
        detail: { action: "view-contract-status" },
      }),
    );
  });
});
