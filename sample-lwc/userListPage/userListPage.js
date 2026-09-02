import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getUsers } from "c/mockUsers";

const PAGE_SIZE = 2;

export default class UserListPage extends NavigationMixin(LightningElement) {
  users = getUsers();
  filters = { name: "", status: "" };
  currentPage = 1;

  get filteredUsers() {
    const normalizedName = this.filters.name.toLowerCase();

    return this.users.filter((user) => {
      const matchesName = !normalizedName || user.name.toLowerCase().includes(normalizedName);
      const matchesStatus = !this.filters.status || user.status === this.filters.status;
      return matchesName && matchesStatus;
    });
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredUsers.length / PAGE_SIZE));
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredUsers.slice(start, start + PAGE_SIZE);
  }

  handleSearch(event) {
    this.filters = { ...event.detail };
    this.currentPage = 1;
  }

  handlePageChange(event) {
    this.currentPage = event.detail;
  }

  handleViewUser(event) {
    this.navigateTo("userDetailPage", { c__userId: event.detail });
  }

  handleEditUser(event) {
    this.navigateTo("userEditPage", { c__userId: event.detail });
  }

  handleHeaderNavigate(event) {
    if (event.detail === "new") {
      this.navigateTo("userEditPage");
      return;
    }

    this.navigateTo("userListPage");
  }

  navigateTo(componentName, state = {}) {
    this[NavigationMixin.Navigate]({
      type: "standard__component",
      attributes: { componentName: `c__${componentName}` },
      state
    });
  }
}
