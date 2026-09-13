import { LightningElement } from "lwc";

export default class AppHeader extends LightningElement {
  handleList() {
    this.dispatchEvent(new CustomEvent("navigate", { detail: "list" }));
  }

  handleNew() {
    this.dispatchEvent(new CustomEvent("navigate", { detail: "new" }));
  }
}
