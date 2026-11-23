(() => {
  "use strict";
  const ui = window.TheDeskUI;
  const auth = window.TheDeskAuth;
  const stages = ui.stages;
  const search = document.getElementById("search-input");
  const filters = ["stage-filter", "priority-filter", "journalist-filter", "category-filter"];
  const board = document.getElementById("board-view");
  const table = document.getElementById("table-view");
  const empty = document.getElementById("empty-state");
  const priorityRank = { Breaking: 4, High: 3, Medium: 2, Low: 1 };
  let layout = "board";

  document.getElementById("stage-filter").innerHTML += stages.map((stage) => `<option>${ui.escapeHTML(stage)}</option>`).join("");
  const journalists = auth.getUsers().filter((user) => user.role === "Journalist");
  document.getElementById("journalist-filter").innerHTML += journalists.map((user) => `<option>${ui.escapeHTML(user.username)}</option>`).join("");

  function canMove(story, direction) {
    const user = auth.getSession();
    const next = stages[stages.indexOf(story.stage) + direction];
    if (!user || !next || ["Approved", "Published"].includes(next) || !auth.hasPermission("move-own", user.role)) return false;
    return user.role !== "Journalist" || (ui.accountName(story.assigneeId) === user.username && direction === 1 && stages.indexOf(next) <= stages.indexOf("Editing"));
  }

  function moveStory(id, direction) {
    const stories = ui.getStories();
    const story = stories.find((item) => item.id === id);
    if (!story || !ui.canView(story) || !canMove(story, direction)) return;
    const next = stages[stages.indexOf(story.stage) + direction];
    const previous = story.stage;
    story.stage = next;
    story.approvedBy = null;
    story.approvedAt = null;
    story.publishedAt = null;
    ui.addActivity(story, `Moved from ${previous} to ${next} by ${auth.getSession().username}`);
    ui.saveStories(stories);
    render();
  }

  function filteredStories() {
    const query = search.value.trim().toLowerCase();
    const [stage, priority, journalist, category] = filters.map((id) => document.getElementById(id).value);
    const results = ui.visibleStories().filter((story) =>
      (!query || [story.headline, story.summary, story.submitter, story.category, ui.accountName(story.assigneeId)].some((value) => String(value).toLowerCase().includes(query))) &&
      (!stage || story.stage === stage) && (!priority || story.priority === priority) &&
      (!journalist || ui.accountName(story.assigneeId) === journalist) && (!category || story.category === category));
    const sort = document.getElementById("sort-select").value;
    if (sort === "priority") results.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
    if (sort === "deadline") results.sort((a, b) => new Date(a.deadline || "9999-12-31") - new Date(b.deadline || "9999-12-31"));
    return results;
  }

  function render() {
    const stories = filteredStories();
    board.innerHTML = stages.map((stage) => {
      const current = stories.filter((story) => story.stage === stage);
      return `<section class="stage-column" aria-label="${ui.escapeHTML(stage)} stage">
        <div class="stage-heading"><h3>${ui.escapeHTML(stage)}</h3><span>${String(current.length).padStart(2, "0")}</span></div>
        ${current.length ? current.map((story) => `${ui.storyLink(story)}
          ${canMove(story, -1) || canMove(story, 1) ? `<div class="move-controls">
            ${canMove(story, -1) ? `<button class="text-button" type="button" data-move="${ui.escapeHTML(story.id)}" data-direction="-1">Move back</button>` : ""}
            ${canMove(story, 1) ? `<button class="text-button" type="button" data-move="${ui.escapeHTML(story.id)}" data-direction="1">Move forward</button>` : ""}
          </div>` : ""}`).join("") : '<p class="stage-empty">Nothing here yet.</p>'}
      </section>`;
    }).join("");
    table.innerHTML = `<table><thead><tr><th>Headline</th><th>Stage</th><th>Priority</th><th>Journalist</th><th>Deadline</th></tr></thead><tbody>
      ${stories.map((story) => `<tr><td><a href="story.html?id=${encodeURIComponent(story.id)}">${ui.escapeHTML(story.headline)}</a></td><td>${ui.escapeHTML(story.stage)}</td><td>${ui.tag(story.priority, story.priority === "Breaking" ? "tag-breaking" : "")}</td><td>${ui.escapeHTML(ui.accountName(story.assigneeId))}</td><td>${ui.escapeHTML(ui.formatDate(story.deadline))}</td></tr>`).join("")}
      </tbody></table>`;
    board.hidden = layout !== "board";
    table.hidden = layout !== "table";
    empty.hidden = stories.length > 0;
  }
  document.querySelectorAll("[data-layout]").forEach((button) => button.addEventListener("click", () => {
    layout = button.dataset.layout;
    document.querySelectorAll("[data-layout]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    render();
  }));
  [search, ...filters.map((id) => document.getElementById(id)), document.getElementById("sort-select")].forEach((control) => {
    control.addEventListener(control === search ? "input" : "change", render);
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-move]");
    if (button) moveStory(button.dataset.move, Number(button.dataset.direction));
  });
  render();
})();
