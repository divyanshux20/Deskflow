(() => {
  "use strict";
  const ui = window.TheDeskUI;
  const stories = ui.visibleStories();
  const counts = {
    total: stories.length,
    progress: stories.filter((story) => !["Idea", "Approved", "Published"].includes(story.stage)).length,
    approval: stories.filter((story) => ["Editing", "Fact-Check"].includes(story.stage)).length,
    published: stories.filter((story) => story.stage === "Published").length,
  };
  Object.entries(counts).forEach(([key, value]) => {
    document.getElementById(`stat-${key}`).textContent = String(value);
  });
  const recent = [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  document.getElementById("recent-stories").innerHTML = recent.length
    ? recent.map((story) => ui.storyLink(story, "recent-story")).join("")
    : '<p class="empty-state">No stories are assigned to you yet.</p>';
})();
