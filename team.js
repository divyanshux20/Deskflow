(() => {
  "use strict";
  const auth = window.TheDeskAuth;
  const list = document.getElementById("team-list");
  const management = document.getElementById("user-management");
  const form = document.getElementById("user-form");
  const message = document.getElementById("user-form-message");
  const session = auth.getSession();
  const isAdmin = auth.hasPermission("manage-users", session.role);
  management.hidden = !isAdmin;

  function render() {
    const users = auth.getUsers();
    list.innerHTML = users.map((user) => `
      <article class="team-person">
        <span class="person-initials" aria-hidden="true">${auth.normalize(user.username).slice(0, 2).toUpperCase()}</span>
        <span><strong>${escapeHTML(user.username)}</strong><span>${escapeHTML(user.role)}</span></span>
        ${isAdmin ? `<label><span class="sr-only">Role for ${escapeHTML(user.username)}</span><select data-user-role="${escapeHTML(user.username)}">${Object.keys(auth.roles).map((role) => `<option${role === user.role ? " selected" : ""}>${role}</option>`).join("")}</select></label>
          <button type="button" class="text-button" data-remove-user="${escapeHTML(user.username)}"${auth.normalize(user.username) === auth.normalize(session.username) ? " disabled" : ""}>Remove</button>` : ""}
      </article>`).join("");
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    try {
      auth.createUser({ username: values.get("username"), password: values.get("password"), role: values.get("role") });
      form.reset();
      message.textContent = "ACCOUNT ADDED.";
      render();
    } catch (error) {
      message.textContent = error.message.toUpperCase();
    }
  });
  list.addEventListener("change", (event) => {
    const select = event.target.closest("[data-user-role]");
    if (!select) return;
    try {
      auth.updateUserRole(select.dataset.userRole, select.value);
      render();
    } catch (error) {
      message.textContent = error.message.toUpperCase();
      render();
    }
  });
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-user]");
    if (!button) return;
    try {
      auth.removeUser(button.dataset.removeUser);
      render();
    } catch (error) {
      message.textContent = error.message.toUpperCase();
    }
  });
  render();
})();
