(() => {
  "use strict";
  const auth = window.TheDeskAuth;
  const session = auth.getSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }
  const allowed = (document.documentElement.dataset.allowedRoles || Object.keys(auth.roles).join(","))
    .split(",").map((role) => role.trim());
  if (!allowed.includes(session.role)) {
    window.location.replace("access-denied.html");
    return;
  }
})();
