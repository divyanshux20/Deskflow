(() => {
  "use strict";
  const stages = ["Idea", "Research", "Writing", "Editing", "Fact-Check", "Approved", "Published"];
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const formatDate = (value, options = { month: "short", day: "numeric" }) => {
    if (!value) return "—";
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en", options).format(date);
  };
  const formatTimestamp = (value) => formatDate(value, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const getStories = () => window.TheDeskData.getStories();
  const saveStories = (stories) => window.TheDeskData.saveStories(stories);
  const legacyAccounts = {
    "maya-chen": "journalist1", "liam-patel": "journalist1", "james-okafor": "journalist2",
    "sofia-ramirez": "journalist2", "amara-williams": "journalist2", "elena-brooks": "editor1", "david-kim": "editor1",
  };
  const accountName = (id) => {
    const username = legacyAccounts[id] || id;
    return window.TheDeskAuth.getUsers().find((user) => window.TheDeskAuth.normalize(user.username) === window.TheDeskAuth.normalize(username))?.username || "Unassigned";
  };
  const canView = (story) => {
    const session = window.TheDeskAuth.getSession();
    return Boolean(session && (window.TheDeskAuth.hasPermission("view-all", session.role) ||
      (window.TheDeskAuth.hasPermission("view-own", session.role) && window.TheDeskAuth.normalize(accountName(story.assigneeId)) === window.TheDeskAuth.normalize(session.username))));
  };
  const tag = (text, extra = "") => `<span class="tag ${extra}">${escapeHTML(text)}</span>`;
  const storyLink = (story, extra = "") => `
    <a class="story-card ${extra}" href="story.html?id=${encodeURIComponent(story.id)}">
      <div class="story-meta">${tag(story.category, "category-tag")}${tag(story.priority, story.priority === "Breaking" ? "tag-breaking" : "")}</div>
      <h3 class="story-title">${escapeHTML(story.headline)}</h3>
      <p class="story-summary">${escapeHTML(story.summary)}</p>
      <p class="card-byline">With <strong>${escapeHTML(accountName(story.assigneeId))}</strong></p>
      <div class="deadline-line"><span>${escapeHTML(story.stage)}</span><time datetime="${escapeHTML(story.deadline || "")}">${escapeHTML(formatDate(story.deadline))}</time></div>
      <span class="text-link">Read story details <span aria-hidden="true">↗</span></span>
    </a>`;
  const addActivity = (story, message) => {
    story.activity = Array.isArray(story.activity) ? story.activity : [];
    story.activity.unshift({ at: new Date().toISOString(), message });
  };
  const visibleStories = () => getStories().filter(canView);
  const notify = (message) => {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("p");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  };
  window.TheDeskUI = { stages, escapeHTML, formatDate, formatTimestamp, getStories, saveStories, accountName, canView, tag, storyLink, addActivity, visibleStories, notify };
})();
