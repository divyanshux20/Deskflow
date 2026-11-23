(() => {
  "use strict";

  const STORIES_KEY = "the-desk-state-v1";
  const USERS_KEY = "the-desk-users-v1";
  const REMEMBER_KEY = "the-desk-remembered-username";
  const dateOffset = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const timeAgo = (days, hours = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(date.getHours() - hours);
    return date.toISOString();
  };
  const demoUsers = [
    { username: "admin", password: "admin123", role: "Admin" },
    { username: "editor1", password: "editor123", role: "Editor" },
    { username: "journalist1", password: "journal123", role: "Journalist" },
    { username: "journalist2", password: "journal123", role: "Journalist" },
  ];
  const demoStories = [
    {
      id: "story-housing", headline: "The quiet redesign of the city’s social housing", category: "Politics", priority: "High",
      summary: "A new generation of residents is asking for more than affordable rent. We visit the neighbourhoods rethinking what public housing can be.",
      deadline: dateOffset(1), submitter: "James Okafor", assigneeId: "journalist2", stage: "Writing",
      createdAt: timeAgo(4), comments: [
        { author: "journalist2", at: timeAgo(3, 5), message: "Interviewed three residents in the east district. The community-led design angle is strongest." },
        { author: "editor1", at: timeAgo(2, 2), message: "Please include the city’s response before the first draft is filed." },
      ],
      activity: [
        { at: timeAgo(4), message: "Story idea submitted by James Okafor" },
        { at: timeAgo(3, 20), message: "Assigned to journalist2 by editor1" },
        { at: timeAgo(2, 10), message: "Moved from Research to Writing by journalist2" },
      ],
    },
    {
      id: "story-water", headline: "A river comes back to life, one block at a time", category: "World", priority: "Medium",
      summary: "Along a once-polluted stretch of the river, neighbours, scientists and city crews are building a restoration project that belongs to everyone.",
      deadline: dateOffset(4), submitter: "Sofia Ramirez", assigneeId: "journalist2", stage: "Research",
      createdAt: timeAgo(3), comments: [
        { author: "journalist1", at: timeAgo(2, 7), message: "The ecology team has agreed to a site visit next week. Looking for a local historian to add context." },
      ],
      activity: [
        { at: timeAgo(3), message: "Story idea submitted by Sofia Ramirez" },
        { at: timeAgo(2, 12), message: "Assigned to journalist1 by editor1" },
        { at: timeAgo(2, 7), message: "Moved from Idea to Research by journalist1" },
      ],
    },
    {
      id: "story-chips", headline: "The small chipmakers changing the AI supply chain", category: "Business", priority: "Breaking",
      summary: "Beyond the household names, a new class of specialist manufacturers is finding leverage in the race to power the next wave of computing.",
      deadline: dateOffset(0), submitter: "Amara Williams", assigneeId: "journalist2", stage: "Editing",
      createdAt: timeAgo(2), comments: [
        { author: "journalist2", at: timeAgo(1, 4), message: "Draft is filed. Revenue figures are sourced from public filings; I’ve added the methodology note." },
        { author: "editor1", at: timeAgo(0, 8), message: "Strong reporting. Tighten the second section and verify the production estimate." },
      ],
      activity: [
        { at: timeAgo(2), message: "Story idea submitted by Amara Williams" },
        { at: timeAgo(2, 4), message: "Assigned to journalist2 by editor1" },
        { at: timeAgo(1, 1), message: "Moved from Writing to Editing by journalist2" },
      ],
    },
    {
      id: "story-final", headline: "The last mile: how a women’s team built its own league", category: "Sports", priority: "High",
      summary: "Players who were told to wait for the game to catch up decided to build a new path themselves. The result is changing who gets to play.",
      deadline: dateOffset(2), submitter: "Maya Chen", assigneeId: "journalist1", stage: "Fact-Check",
      createdAt: timeAgo(5), comments: [
        { author: "journalist1", at: timeAgo(1, 10), message: "All interview transcripts are uploaded. Checking the league's founding-year discrepancy now." },
      ],
      activity: [
        { at: timeAgo(5), message: "Story idea submitted by Maya Chen" },
        { at: timeAgo(4, 18), message: "Assigned to journalist1 by editor1" },
        { at: timeAgo(1, 11), message: "Moved from Editing to Fact-Check by editor1" },
      ],
    },
    {
      id: "story-night", headline: "What a city sounds like after midnight", category: "Culture", priority: "Low",
      summary: "From the bakery ovens to the last train, a sound artist traces the overlooked rhythms that carry a city through the night.",
      deadline: dateOffset(7), submitter: "Maya Chen", assigneeId: "journalist1", stage: "Idea",
      createdAt: timeAgo(1), comments: [],
      activity: [
        { at: timeAgo(1), message: "Story idea submitted by Maya Chen" },
        { at: timeAgo(1, 1), message: "Assigned to journalist1 by editor1" },
      ],
    },
    {
      id: "story-clinic", headline: "Inside the clinics bringing care to the doorstep", category: "World", priority: "Medium",
      summary: "Mobile health teams are closing gaps in rural care. The model is expanding, but the people behind it say the hardest part is staying.",
      deadline: dateOffset(-2), submitter: "Sofia Ramirez", assigneeId: "journalist2", stage: "Approved",
      createdAt: timeAgo(8), comments: [
        { author: "journalist1", at: timeAgo(4), message: "The district health office has confirmed the latest patient figures." },
        { author: "editor1", at: timeAgo(1, 3), message: "Approved. The reporting is clear and the patient voices carry the piece." },
      ],
      approvedBy: "editor1", approvedAt: timeAgo(1, 3),
      activity: [
        { at: timeAgo(8), message: "Story idea submitted by Sofia Ramirez" },
        { at: timeAgo(7), message: "Assigned to journalist1 by editor1" },
        { at: timeAgo(1, 3), message: "Approved by editor1" },
      ],
    },
    {
      id: "story-grid", headline: "The neighbourhoods learning to share their power", category: "Tech", priority: "High",
      summary: "Community energy cooperatives are turning rooftops into a local resource—and putting the question of who owns clean power on the table.",
      deadline: dateOffset(-5), submitter: "Liam Patel", assigneeId: "journalist1", stage: "Published",
      createdAt: timeAgo(14), publishedAt: timeAgo(1, 9), approvedBy: "editor1", approvedAt: timeAgo(2, 4), comments: [],
      activity: [
        { at: timeAgo(14), message: "Story idea submitted by Liam Patel" },
        { at: timeAgo(13), message: "Assigned to journalist2 by editor1" },
        { at: timeAgo(2, 4), message: "Approved by editor1" },
        { at: timeAgo(1, 9), message: "Published by editor1" },
      ],
    },
    {
      id: "story-language", headline: "The students keeping a language alive in the classroom", category: "Culture", priority: "Medium",
      summary: "A public school programme pairs elders with students to pass on a language at risk of disappearing, one lesson and one family at a time.",
      deadline: dateOffset(-3), submitter: "James Okafor", assigneeId: "journalist2", stage: "Published",
      createdAt: timeAgo(17), publishedAt: timeAgo(3, 6), approvedBy: "editor1", approvedAt: timeAgo(4, 2), comments: [
        { author: "journalist2", at: timeAgo(5), message: "The family names and spellings have been checked with the programme coordinator." },
      ],
      activity: [
        { at: timeAgo(17), message: "Story idea submitted by James Okafor" },
        { at: timeAgo(16), message: "Assigned to journalist2 by editor1" },
        { at: timeAgo(4, 2), message: "Approved by editor1" },
        { at: timeAgo(3, 6), message: "Published by editor1" },
      ],
    },
  ];

  function read(key, fallback, validate) {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
    let value;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      console.error(`The Desk data at ${key} is not valid JSON.`, error);
      throw new Error("Saved newsroom data is invalid. Clear this site's local storage to restart.");
    }
    if (!validate(value)) throw new Error("Saved newsroom data has an unexpected format.");
    return value;
  }

  const getStories = () => read(STORIES_KEY, { stories: demoStories }, (value) => value && Array.isArray(value.stories)).stories;
  const saveStories = (stories) => localStorage.setItem(STORIES_KEY, JSON.stringify({ stories }));
  const getUsers = () => {
    const users = read(USERS_KEY, demoUsers, Array.isArray);
    const activeUsers = users.filter((user) => String(user?.username || "").trim().toLowerCase() !== "divyanshu");
    if (activeUsers.length !== users.length) saveUsers(activeUsers);
    return activeUsers;
  };
  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const getRememberedUsername = () => {
    const username = localStorage.getItem(REMEMBER_KEY);
    if (String(username || "").trim().toLowerCase() === "divyanshu") {
      localStorage.removeItem(REMEMBER_KEY);
      return null;
    }
    return username;
  };
  const saveRememberedUsername = (username) => username
    ? localStorage.setItem(REMEMBER_KEY, username)
    : localStorage.removeItem(REMEMBER_KEY);

  window.TheDeskData = { getStories, saveStories, getUsers, saveUsers, getRememberedUsername, saveRememberedUsername, demoUsers };
})();
