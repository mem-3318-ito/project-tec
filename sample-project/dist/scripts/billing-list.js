(function () {
  "use strict";

  const MOCK_DATA_URL = "./assets/mock/billing-list.json";

  const pageRoot = document.querySelector('[data-page="billing-list"]');
  const resultTable = pageRoot?.querySelector(
    '[data-component="result-table"]',
  );

  let billingItems = [];

  function filterByBillingNumber(billingNumber) {
    const keyword = billingNumber.trim();
    if (!keyword) return billingItems;
    return billingItems.filter((item) =>
      item.billingNumber.includes(keyword),
    );
  }

  function updateResultTable(items) {
    resultTable?.dispatchEvent(
      new CustomEvent("app:update-rows", { detail: { items } }),
    );
  }

  pageRoot?.addEventListener("app:search", (event) => {
    updateResultTable(
      filterByBillingNumber(event.detail?.billingNumber ?? ""),
    );
  });

  fetch(MOCK_DATA_URL)
    .then((response) => response.json())
    .then((data) => {
      billingItems = data.items;
      updateResultTable(billingItems);
    })
    .catch((error) => {
      console.error("failed to load mock billing data:", error);
    });
})();
