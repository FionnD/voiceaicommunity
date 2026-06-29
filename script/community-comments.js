(function () {
  const DATA_URL = "data/community-comments.json";

  const state = {
    comments: [],
    commentsBySection: new Map(),
    source: null,
    activeSection: "all",
    sidebar: null,
    list: null
  };

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function countLabel(count) {
    return count === 1 ? "1 note" : `${count} notes`;
  }

  function groupComments(comments) {
    const grouped = new Map();

    comments.forEach((comment) => {
      if (!grouped.has(comment.section)) {
        grouped.set(comment.section, []);
      }
      grouped.get(comment.section).push(comment);
    });

    return grouped;
  }

  function uniqueComments(comments) {
    const seen = new Set();

    return comments.filter((comment) => {
      if (seen.has(comment.id)) {
        return false;
      }
      seen.add(comment.id);
      return true;
    });
  }

  function getHeadingText(sectionId) {
    const heading = document.getElementById(sectionId);
    if (!heading) {
      return "";
    }

    const clone = heading.cloneNode(true);
    clone.querySelectorAll(".header-anchor, .comment-marker").forEach((node) => node.remove());
    return clone.textContent.trim().replace(/\s+/g, " ");
  }

  function getSectionMeta(sectionId) {
    const headingText = getHeadingText(sectionId);
    const match = headingText.match(/^([0-9]+(?:\.[0-9]+)*)\.?\s*(.+)$/);

    if (!match) {
      return {
        sectionNumber: "",
        sectionTitle: headingText || sectionId
      };
    }

    return {
      sectionNumber: match[1],
      sectionTitle: match[2]
    };
  }

  function extractIssueField(body, label) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(
      `(?:^|\\n)###\\s+${escapedLabel}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`,
      "i"
    );
    const match = body.match(expression);

    if (!match) {
      return "";
    }

    return match[1].trim().replace(/^_No response_$/i, "");
  }

  function normalizeIssueSection(rawSection) {
    const trimmed = rawSection.trim().replace(/^#/, "");
    const parenthesizedAnchor = trimmed.match(/\(([a-z0-9-]+)\)$/i);

    if (parenthesizedAnchor) {
      return parenthesizedAnchor[1];
    }

    return trimmed.split(/\s+/)[0] || "";
  }

  function splitCommentBody(body) {
    return body
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  function parseIssueLinks(rawLinks) {
    return rawLinks
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const markdownLink = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i);
        if (markdownLink) {
          return {
            label: markdownLink[1],
            url: markdownLink[2]
          };
        }

        const bareLink = line.match(/https?:\/\/\S+/i);
        if (!bareLink) {
          return null;
        }

        let label = bareLink[0];
        try {
          label = new URL(bareLink[0]).hostname;
        } catch (error) {
          label = bareLink[0];
        }

        return {
          label,
          url: bareLink[0]
        };
      })
      .filter(Boolean);
  }

  function parseGitHubIssue(issue) {
    if (!issue || issue.pull_request || !issue.body) {
      return null;
    }

    const section = normalizeIssueSection(extractIssueField(issue.body, "Section anchor"));
    const body = extractIssueField(issue.body, "Comment");

    if (!section || !body || !document.getElementById(section)) {
      return null;
    }

    const meta = getSectionMeta(section);
    const title =
      extractIssueField(issue.body, "Comment title") ||
      issue.title.replace(/^\[comment\]:\s*/i, "").trim() ||
      "GitHub comment";

    const links = parseIssueLinks(extractIssueField(issue.body, "Links"));
    links.push({
      label: `GitHub #${issue.number}`,
      url: issue.html_url
    });

    return {
      id: `github-issue-${issue.number}`,
      section,
      sectionNumber: meta.sectionNumber,
      sectionTitle: meta.sectionTitle,
      author: issue.user && issue.user.login ? issue.user.login : "github-user",
      authorUrl: issue.user && issue.user.html_url ? issue.user.html_url : issue.html_url,
      title,
      body: splitCommentBody(body),
      links
    };
  }

  async function loadGitHubComments(source) {
    if (!source || !source.issuesApiUrl) {
      return [];
    }

    const response = await fetch(source.issuesApiUrl, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub HTTP ${response.status}`);
    }

    const issues = await response.json();
    if (!Array.isArray(issues)) {
      return [];
    }

    return issues.map(parseGitHubIssue).filter(Boolean);
  }

  function buildSidebar(source) {
    const sidebar = createElement("aside", "community-sidebar");
    sidebar.id = "community-comments";
    sidebar.setAttribute("aria-label", "Comments");

    const inner = createElement("div", "community-sidebar__inner");
    const header = createElement("div", "community-sidebar__header");
    const eyebrow = createElement("p", "community-sidebar__eyebrow", "Comments");

    const action = createElement("a", "community-sidebar__action", "Comment on GitHub");
    action.href =
      source && source.newIssueUrl
        ? source.newIssueUrl
        : source && source.repository
          ? source.repository
          : "https://github.com/FionnD/voiceaicommunity";
    action.target = "_blank";
    action.rel = "noopener noreferrer";

    const list = createElement("div", "community-comment-list");

    header.append(eyebrow, action);
    inner.append(header, list);
    sidebar.append(inner);
    document.body.append(sidebar);

    state.sidebar = sidebar;
    state.list = list;
  }

  function renderCommentCard(comment) {
    const article = createElement("article", "community-comment");
    article.dataset.section = comment.section;

    const author = createElement("a", "community-comment__author", `@${comment.author}`);
    author.href = comment.authorUrl || "#";
    author.target = "_blank";
    author.rel = "noopener noreferrer";

    const body = createElement("div", "community-comment__body");
    (comment.body || []).forEach((paragraph) => {
      body.append(createElement("p", "", paragraph));
    });

    const footer = createElement("div", "community-comment__links");
    (comment.links || []).forEach((link) => {
      const item = createElement("a", "", link.label);
      item.href = link.url;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
      footer.append(item);
    });

    article.append(author, body);
    if (footer.childElementCount) {
      article.append(footer);
    }

    return article;
  }

  function renderComments() {
    if (!state.list) {
      return;
    }

    const visibleComments =
      state.activeSection === "all"
        ? state.comments
        : state.commentsBySection.get(state.activeSection) || [];

    clearElement(state.list);
    visibleComments.forEach((comment) => state.list.append(renderCommentCard(comment)));

    document.querySelectorAll(".comment-marker").forEach((marker) => {
      marker.classList.toggle("is-active", marker.dataset.section === state.activeSection);
    });
  }

  function setFilter(section, shouldFocusSidebar) {
    state.activeSection = section;
    renderComments();

    if (shouldFocusSidebar && state.sidebar && window.matchMedia("(max-width: 1180px)").matches) {
      state.sidebar.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  function addMarkers() {
    document.querySelectorAll(".comment-marker").forEach((marker) => marker.remove());

    state.commentsBySection.forEach((comments, sectionId) => {
      const heading = document.getElementById(sectionId);
      if (!heading) {
        return;
      }

      const marker = createElement("button", "comment-marker", countLabel(comments.length));
      marker.type = "button";
      marker.dataset.section = sectionId;
      marker.setAttribute(
        "aria-label",
        `${countLabel(comments.length)} for ${comments[0].sectionNumber} ${comments[0].sectionTitle}`
      );
      marker.addEventListener("click", () => setFilter(sectionId, true));

      heading.classList.add("has-community-comments");
      heading.append(" ", marker);
    });
  }

  function syncFromHash() {
    const sectionId = window.location.hash.replace("#", "");
    if (sectionId && state.commentsBySection.has(sectionId)) {
      setFilter(sectionId, false);
    }
  }

  function handleError(error) {
    console.error("Unable to load community comments", error);

    buildSidebar({
      repository: "https://github.com/FionnD/voiceaicommunity"
    });
    if (state.list) {
      state.list.append(createElement("p", "community-sidebar__error", "Comments could not be loaded."));
    }
  }

  async function init() {
    document.body.classList.add("has-community-sidebar");

    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      state.comments = data.comments || [];
      state.commentsBySection = groupComments(state.comments);
      state.source = data.source || null;

      buildSidebar(state.source);
      addMarkers();
      renderComments();
      syncFromHash();
      window.addEventListener("hashchange", syncFromHash);

      loadGitHubComments(state.source)
        .then((githubComments) => {
          if (!githubComments.length) {
            return;
          }

          state.comments = uniqueComments([...githubComments, ...state.comments]);
          state.commentsBySection = groupComments(state.comments);
          addMarkers();
          renderComments();
          syncFromHash();
        })
        .catch((error) => {
          console.warn("Unable to load GitHub community comments", error);
        });
    } catch (error) {
      handleError(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
