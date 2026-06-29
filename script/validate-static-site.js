const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const stylesPath = path.join(root, "styles.css");
const commentsPath = path.join(root, "data", "community-comments.json");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function existsLocalReference(reference) {
  const cleanReference = reference.split("#")[0].split("?")[0];

  if (
    !cleanReference ||
    cleanReference.startsWith("#") ||
    cleanReference.startsWith("http://") ||
    cleanReference.startsWith("https://") ||
    cleanReference.startsWith("mailto:") ||
    cleanReference.startsWith("tel:") ||
    cleanReference.startsWith("data:")
  ) {
    return true;
  }

  const relativePath = cleanReference.startsWith("/")
    ? cleanReference.slice(1)
    : cleanReference;
  const absolutePath = path.join(root, relativePath);

  if (fs.existsSync(absolutePath)) {
    return true;
  }

  if (fs.existsSync(path.join(absolutePath, "index.html"))) {
    return true;
  }

  return false;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const index = read(indexPath);
const styles = read(stylesPath);
const commentsData = JSON.parse(read(commentsPath));
const comments = commentsData.comments || [];

assert(index.includes("script/community-comments.js"), "index.html must load community-comments.js");
assert(styles.includes(".community-sidebar"), "styles.css must include community sidebar styles");
assert(comments.length > 0, "community-comments.json must contain comments");

const ids = new Set();
comments.forEach((comment) => {
  assert(comment.id, "Each comment needs an id");
  assert(!ids.has(comment.id), `Duplicate comment id: ${comment.id}`);
  ids.add(comment.id);

  assert(comment.section, `Comment ${comment.id} needs a section`);
  assert(
    index.includes(`id="${comment.section}"`),
    `Comment ${comment.id} points to missing section #${comment.section}`
  );
  assert(comment.author, `Comment ${comment.id} needs an author`);
  assert(comment.title, `Comment ${comment.id} needs a title`);
  assert(Array.isArray(comment.body) && comment.body.length > 0, `Comment ${comment.id} needs body text`);
});

const localReferences = [...index.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
const missingReferences = localReferences.filter((reference) => !existsLocalReference(reference));

assert(
  missingReferences.length === 0,
  `Missing local references:\n${missingReferences.map((reference) => `- ${reference}`).join("\n")}`
);

console.log(`Validated ${comments.length} community comments and ${localReferences.length} local references.`);
