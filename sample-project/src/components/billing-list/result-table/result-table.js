(function () {
  "use strict";

  function formatBillingMonth(yyyymm) {
    const text = String(yyyymm);
    return `${text.slice(0, 4)}/${text.slice(4, 6)}`;
  }

  function formatBillingAmount(amount) {
    return `${Number(amount).toLocaleString("ja-JP")}円`;
  }

  function renderRows(component, items) {
    const tbody = component.querySelector('[data-role="rows"]');
    const empty = component.querySelector('[data-role="empty"]');
    if (!tbody || !empty) return;

    tbody.textContent = "";
    empty.hidden = items.length > 0;

    for (const item of items) {
      const row = document.createElement("tr");

      const billingNumberCell = document.createElement("td");
      billingNumberCell.textContent = item.billingNumber;

      const billingMonthCell = document.createElement("td");
      billingMonthCell.textContent = formatBillingMonth(item.billingMonth);

      const billingAmountCell = document.createElement("td");
      billingAmountCell.textContent = formatBillingAmount(item.billingAmount);

      row.append(billingNumberCell, billingMonthCell, billingAmountCell);
      tbody.append(row);
    }
  }

  const components = document.querySelectorAll(
    '[data-component="result-table"]',
  );

  components.forEach((component) => {
    component.addEventListener("app:update-rows", (event) => {
      renderRows(component, event.detail?.items ?? []);
    });
  });
})();
