(() => {
  "use strict";
  const ui = window.TheDeskUI;
  const stories = ui.visibleStories().filter((story) => story.stage === "Published")
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  document.getElementById("archive-count").textContent = `${stories.length} ${stories.length === 1 ? "story" : "stories"}`;
  document.getElementById("published-list").innerHTML = stories.length
    ? stories.map((story) => `<a class="archive-item" href="story.html?id=${encodeURIComponent(story.id)}">
        <div><p class="story-meta">${ui.tag(story.category, "category-tag")}</p><h2>${ui.escapeHTML(story.headline)}</h2><p>${ui.escapeHTML(story.summary)}</p></div>
        <span>By ${ui.escapeHTML(ui.accountName(story.assigneeId))}</span>
        <time datetime="${ui.escapeHTML(story.publishedAt || "")}">${ui.escapeHTML(ui.formatDate(story.publishedAt, { month: "long", day: "numeric", year: "numeric" }))}</time>
      </a>`).join("")
    : '<p class="empty-state">The archive is ready for its first story.</p>';
})();
