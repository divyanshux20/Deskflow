(() => {
  "use strict";
  const auth = window.TheDeskAuth;
  const session = auth.getSession();
  const page = document.body.dataset.page;
  const nav = [
    ["Dashboard", "dashboard.html", "dashboard"],
    ["Board", "board.html", "board"],
    ["Submit Story", "submit.html", "submit"],
    ["Published", "published.html", "published"],
    ["Team", "team.html", "team"],
  ].filter(([label]) => label !== "Team" || session.role !== "Journalist");

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="wordmark" href="dashboard.html" aria-label="The Desk dashboard">The Desk<span>.</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      ${nav.map(([label, href, key]) => `<a class="nav-link" href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
    <div class="session-controls">
      <span class="session-identity">${escapeHTML(session.username)} · ${escapeHTML(session.role)}</span>
      <a class="sign-out-link" href="login.html" id="sign-out">Sign out</a>
    </div>`;
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<a class="footer-wordmark" href="dashboard.html">The Desk<span>.</span></a><p>Made for the work that matters.</p>`;
  document.body.prepend(header);
  document.body.append(footer);
  document.getElementById("sign-out").addEventListener("click", (event) => {
    event.preventDefault();
    auth.signOut();
  });
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    document.getElementById("main-nav").classList.toggle("is-open", !expanded);
  });

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
})();
