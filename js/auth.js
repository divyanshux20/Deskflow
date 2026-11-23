(() => {
  "use strict";

  const data = window.TheDeskData;
  const roles = Object.freeze({
    Journalist: ["submit", "comment", "view-own"],
    Editor: ["submit", "comment", "view-all", "move-own", "assign", "approve", "request-changes", "publish"],
    Admin: ["submit", "comment", "view-all", "move-own", "assign", "approve", "request-changes", "publish", "manage-users"],
  });
  const SESSION_KEY = "the-desk-session-v1";
  const normalize = (value) => String(value || "").trim().toLowerCase();
  async function hashPassword(password) {
    if (!window.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(String(password));
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function getUsers() {
    return data.getUsers().map(({ username, role }) => ({ username, role }));
  }

  function getSession() {
    let session;
    try {
      session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
      console.error("The Desk session could not be read.", error);
      return null;
    }
    if (!session || typeof session.username !== "string" || !roles[session.role] || !Number.isFinite(session.loginTime)) return null;
    const user = data.getUsers().find((item) => normalize(item.username) === normalize(session.username));
    return user && user.role === session.role ? session : null;
  }

  function hasPermission(permission, role = getSession()?.role) {
    return Boolean(role && roles[role]?.includes(permission));
  }

  async function authenticate(username, password, selectedRole) {
    const user = data.getUsers().find((item) => normalize(item.username) === normalize(username));
    if (!user) return { ok: false, reason: "credentials" };
    const passwordMatches = user.password === password ||
      (typeof user.passwordHash === "string" && await hashPassword(password) === user.passwordHash);
    if (!passwordMatches) return { ok: false, reason: "credentials" };
    if (user.role !== selectedRole) return { ok: false, reason: "role" };
    return { ok: true, username: user.username, role: user.role };
  }

  function startSession(username, role) {
    const user = data.getUsers().find((item) => normalize(item.username) === normalize(username));
    if (!user || user.role !== role) throw new Error("The account role changed. Please sign in again.");
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role, loginTime: Date.now() }));
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("the-desk-last-activity-v1");
    window.location.replace("login.html");
  }

  function requireAdmin() {
    const session = getSession();
    if (!session || !hasPermission("manage-users", session.role)) throw new Error("Only an administrator can manage accounts.");
    return session;
  }

  function createUser({ username, password, role }) {
    requireAdmin();
    const clean = String(username || "").trim();
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(clean)) throw new Error("Use 3–32 letters, numbers, dots, underscores or hyphens.");
    if (String(password || "").length < 8) throw new Error("Use a password with at least 8 characters.");
    if (!roles[role]) throw new Error("Choose a valid role.");
    const users = data.getUsers();
    if (users.some((user) => normalize(user.username) === normalize(clean))) throw new Error("That username already exists.");
    users.push({ username: clean, password: String(password), role });
    data.saveUsers(users);
  }

  function updateUserRole(username, role) {
    const session = requireAdmin();
    if (!roles[role]) throw new Error("Choose a valid role.");
    const users = data.getUsers();
    const target = users.find((user) => normalize(user.username) === normalize(username));
    if (!target) throw new Error("That account no longer exists.");
    if (target.role === "Admin" && role !== "Admin" && users.filter((user) => user.role === "Admin").length === 1) {
      throw new Error("Keep at least one administrator account.");
    }
    target.role = role;
    data.saveUsers(users);
    if (normalize(session.username) === normalize(username) && role !== session.role) signOut();
  }

  function removeUser(username) {
    const session = requireAdmin();
    if (normalize(session.username) === normalize(username)) throw new Error("You cannot remove your own signed-in account.");
    const users = data.getUsers();
    const target = users.find((user) => normalize(user.username) === normalize(username));
    if (!target) throw new Error("That account no longer exists.");
    if (target.role === "Admin" && users.filter((user) => user.role === "Admin").length === 1) {
      throw new Error("Keep at least one administrator account.");
    }
    data.saveUsers(users.filter((user) => normalize(user.username) !== normalize(username)));
  }

  window.TheDeskAuth = {
    roles, authenticate, startSession, getSession, signOut, hasPermission, getUsers,
    createUser, updateUserRole, removeUser, normalize,     rememberKey: "the-desk-remembered-username",
  };

  const form = document.getElementById("login-form");
  if (!form) return;
  if (getSession()) {
    window.location.replace("dashboard.html");
    return;
  }

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const error = document.getElementById("login-error");
  const signInButton = document.getElementById("sign-in-button");
  const remember = document.getElementById("remember-username");
  try {
    const savedUsername = data.getRememberedUsername();
    if (savedUsername) {
      usernameInput.value = savedUsername;
      remember.checked = true;
    }
  } catch (storageError) {
    console.error("The remembered username could not be read.", storageError);
  }
  document.getElementById("toggle-password").addEventListener("click", (event) => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    event.currentTarget.textContent = show ? "Hide" : "Show";
    event.currentTarget.setAttribute("aria-pressed", String(show));
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    const role = form.querySelector('input[name="role"]:checked')?.value;
    signInButton.disabled = true;
    try {
      const result = await authenticate(usernameInput.value, passwordInput.value, role);
      if (!result.ok) {
        error.textContent = result.reason === "role"
          ? "THAT ACCOUNT DOES NOT HAVE THE SELECTED ROLE."
          : "USERNAME OR PASSWORD NOT RECOGNIZED.";
        error.classList.add("is-error");
        return;
      }
      data.saveRememberedUsername(remember.checked ? result.username : "");
      startSession(result.username, result.role);
      window.location.assign("dashboard.html");
    } catch (loginError) {
      console.error("Sign in failed.", loginError);
      error.textContent = "SIGN IN IS TEMPORARILY UNAVAILABLE.";
      error.classList.add("is-error");
    } finally {
      signInButton.disabled = false;
    }
  });
})();
