(() => {
  "use strict";
  const ui = window.TheDeskUI;
  const auth = window.TheDeskAuth;
  const id = new URLSearchParams(window.location.search).get("id");
  let stories = ui.getStories();
  let story = stories.find((item) => item.id === id);
  if (!story) {
    window.location.replace("404.html");
    return;
  }
  if (!ui.canView(story)) {
    window.location.replace("access-denied.html");
    return;
  }
  const main = document.getElementById("story-detail");
  const currentUser = auth.getSession();

  function render() {
    stories = ui.getStories();
    story = stories.find((item) => item.id === id);
    if (!story) {
      window.location.replace("404.html");
      return;
    }
    const comments = Array.isArray(story.comments) ? story.comments : [];
    const activity = [...(story.activity || [])].sort((a, b) => new Date(b.at) - new Date(a.at));
    const editors = auth.getUsers().filter((user) => user.role === "Journalist");
    const canReview = auth.hasPermission("approve");
    const canComment = auth.hasPermission("comment");
    main.innerHTML = `
      <a class="back-link" href="board.html">← Back to the board</a>
      <div class="story-detail-top"><p class="eyebrow">STORY DESK · ${ui.escapeHTML(story.stage)}</p><p class="story-meta">${ui.tag(story.category, "category-tag")} ${ui.tag(story.priority, story.priority === "Breaking" ? "tag-breaking" : "")}</p></div>
      <h1>${ui.escapeHTML(story.headline)}</h1>
      <p class="story-deck">${ui.escapeHTML(story.summary)}</p>
      <dl class="story-facts">
        <div><dt>Submitted by</dt><dd>${ui.escapeHTML(story.submitter)}</dd></div>
        <div><dt>Assigned to</dt><dd>${ui.escapeHTML(ui.accountName(story.assigneeId))}</dd></div>
        <div><dt>Deadline</dt><dd>${ui.escapeHTML(ui.formatDate(story.deadline, { month: "long", day: "numeric", year: "numeric" }))}</dd></div>
        <div><dt>Created</dt><dd>${ui.escapeHTML(ui.formatDate(story.createdAt, { month: "long", day: "numeric", year: "numeric" }))}</dd></div>
        ${story.approvedAt ? `<div><dt>Approved by</dt><dd>${ui.escapeHTML(ui.accountName(story.approvedBy))}</dd></div>` : ""}
        ${story.publishedAt ? `<div><dt>Published</dt><dd>${ui.escapeHTML(ui.formatTimestamp(story.publishedAt))}</dd></div>` : ""}
      </dl>
      ${auth.hasPermission("assign") ? `<div class="assignment-control"><label for="assignment">Assign journalist</label><select id="assignment">${editors.map((person) => `<option value="${ui.escapeHTML(person.username)}"${person.username === ui.accountName(story.assigneeId) ? " selected" : ""}>${ui.escapeHTML(person.username)}</option>`).join("")}</select></div>` : ""}
      ${canReview && ["Editing", "Fact-Check"].includes(story.stage) ? `<div class="story-actions">
        <button class="button button-dark" type="button" data-action="approve">Approve story</button>
        <button class="button button-outline" type="button" data-action="changes">Request changes</button>
      </div>` : ""}
      ${canReview && story.stage === "Approved" ? `<div class="story-actions"><button class="button button-dark" type="button" data-action="publish">Publish story</button></div>` : ""}
      <div class="detail-columns">
        <section aria-labelledby="comments-title">
          <div class="section-heading compact"><div><p class="eyebrow">THE CONVERSATION</p><h2 id="comments-title">Comments <span class="muted-count">${comments.length}</span></h2></div></div>
          <div class="comments-list">${comments.length ? comments.map((comment) => `<article class="comment"><div class="comment-head"><strong>${ui.escapeHTML(comment.author)}</strong><time datetime="${ui.escapeHTML(comment.at)}">${ui.escapeHTML(ui.formatTimestamp(comment.at))}</time></div><p>${ui.escapeHTML(comment.message)}</p></article>`).join("") : '<p class="empty-state">No comments yet.</p>'}</div>
          ${canComment ? `<form id="comment-form" class="comment-form"><label for="comment">Add a comment</label><textarea id="comment" name="comment" maxlength="1000" required placeholder="Add a note to the story"></textarea><button class="button button-outline" type="submit">Add comment</button></form>` : ""}
        </section>
        <section aria-labelledby="activity-title">
          <div class="section-heading compact"><div><p class="eyebrow">A RECORD OF THE WORK</p><h2 id="activity-title">Activity</h2></div></div>
          <ol class="activity-list">${activity.map((item) => `<li><time datetime="${ui.escapeHTML(item.at)}">${ui.escapeHTML(ui.formatTimestamp(item.at))}</time><p>${ui.escapeHTML(item.message)}</p></li>`).join("") || "<li>No activity recorded.</li>"}</ol>
        </section>
      </div>`;
  }

  function save() {
    ui.saveStories(stories);
    render();
  }

  main.addEventListener("change", (event) => {
    if (event.target.id !== "assignment" || !auth.hasPermission("assign")) return;
    const previous = ui.accountName(story.assigneeId);
    story.assigneeId = event.target.value;
    ui.addActivity(story, `${previous === "Unassigned" ? "Assigned" : `Reassigned from ${previous}`} to ${event.target.value} by ${currentUser.username}`);
    save();
  });
  main.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "approve" && auth.hasPermission("approve") && ["Editing", "Fact-Check"].includes(story.stage)) {
      story.stage = "Approved";
      story.approvedBy = currentUser.username;
      story.approvedAt = new Date().toISOString();
      story.publishedAt = null;
      ui.addActivity(story, `Approved by ${currentUser.username}`);
    } else if (action === "changes" && auth.hasPermission("request-changes") && ["Editing", "Fact-Check"].includes(story.stage)) {
      story.stage = "Writing";
      story.approvedBy = null;
      story.approvedAt = null;
      story.publishedAt = null;
      ui.addActivity(story, `Changes requested by ${currentUser.username}; returned to Writing`);
    } else if (action === "publish" && auth.hasPermission("publish") && story.stage === "Approved" && story.approvedAt) {
      story.stage = "Published";
      story.publishedAt = new Date().toISOString();
      ui.addActivity(story, `Published by ${currentUser.username}`);
      save();
      window.location.assign("published.html");
      return;
    } else return;
    save();
  });
  main.addEventListener("submit", (event) => {
    if (event.target.id !== "comment-form") return;
    event.preventDefault();
    const message = new FormData(event.target).get("comment").toString().trim();
    if (!message || !auth.hasPermission("comment") || !ui.canView(story)) return;
    story.comments = Array.isArray(story.comments) ? story.comments : [];
    story.comments.unshift({ author: currentUser.username, at: new Date().toISOString(), message });
    ui.addActivity(story, `Comment added by ${currentUser.username}`);
    save();
  });
  render();
})();
