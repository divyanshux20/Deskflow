(() => {
  "use strict";
  const form = document.getElementById("story-form");
  const session = window.TheDeskAuth.getSession();
  const deadline = form.elements.namedItem("deadline");
  const today = new Date();
  const todayValue = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  deadline.min = todayValue;
  const suggested = new Date(today.getTime() + 3 * 86400000 - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  deadline.value = suggested;
  form.elements.namedItem("submitter").value = session.username;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!window.TheDeskAuth.hasPermission("submit")) return;
    const values = new FormData(form);
    const headline = String(values.get("headline") || "").trim();
    const summary = String(values.get("summary") || "").trim();
    if (!headline || !summary) return;
    const now = new Date().toISOString();
    const story = {
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      headline, summary, category: String(values.get("category")), priority: String(values.get("priority")),
      deadline: String(values.get("deadline")), submitter: session.username,
      assigneeId: session.role === "Journalist" ? session.username : null,
      stage: "Idea", createdAt: now, approvedBy: null, approvedAt: null, publishedAt: null,
      comments: [], activity: [{ at: now, message: `Story idea submitted by ${session.username}` }],
    };
    const stories = window.TheDeskData.getStories();
    stories.unshift(story);
    window.TheDeskData.saveStories(stories);
    window.location.assign("board.html");
  });
})();
