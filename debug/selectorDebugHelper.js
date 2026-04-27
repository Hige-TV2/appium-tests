const fs = require("fs");
const path = require("path");

function ensureDebugDir() {
  const dir = path.resolve(process.cwd(), "debug");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeLabel(label) {
  return label.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function safeWriteJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Parse XML attributes string into a plain object.
 * Handles the standard Appium page-source attribute format where values never
 * contain unescaped double-quotes.
 */
function parseXmlAttrs(attrStr) {
  const attrs = {};
  const re = /([\w:.-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

/**
 * Extract element data from Appium XML page source entirely in Node.js.
 * Returns only elements that carry at least one of: text, content-desc, resource-id.
 */
function extractElementsFromSource(xmlSource) {
  const elements = [];
  // Match any XML opening/self-closing tag with its attribute block.
  const tagRe = /<([\w.]+)(\s[^>]*?)(?:\s*\/?>)/g;
  let match;
  let index = 0;

  while ((match = tagRe.exec(xmlSource)) !== null) {
    const attrs = parseXmlAttrs(match[2]);
    const text = attrs.text || null;
    const contentDesc = attrs["content-desc"] || null;
    const resourceId = attrs["resource-id"] || null;

    if (!text && !contentDesc && !resourceId) continue;

    elements.push({
      index,
      className: match[1],
      text,
      contentDesc,
      resourceId,
      clickable: attrs.clickable || null,
      bounds: attrs.bounds || null,
    });

    index += 1;
  }

  return elements;
}

/**
 * Single-call debug bundle: one getPageSource() round trip, then all three
 * artifact files are derived from the same XML string in Node.js.
 */
async function captureDebugBundle(driver, label) {
  const debugDir = ensureDebugDir();
  const safe = sanitizeLabel(label);

  const xmlSource = await driver.getPageSource();

  // 1. Raw XML page source.
  const sourcePath = path.join(debugDir, `${safe}-source.xml`);
  fs.writeFileSync(sourcePath, xmlSource, "utf-8");

  // 2. Unique visible text values, sorted.
  const allElements = extractElementsFromSource(xmlSource);

  const uniqueTexts = [
    ...new Set(
      allElements
        .map((el) => el.text)
        .filter((t) => t && t.trim().length > 0)
        .map((t) => t.trim()),
    ),
  ].sort((a, b) => a.localeCompare(b, "da"));

  const textsPath = path.join(debugDir, `${safe}-visible-texts.json`);
  safeWriteJson(textsPath, uniqueTexts);

  // 3. Full selector inventory (all elements with at least one identifier).
  const selectorsPath = path.join(debugDir, `${safe}-selectors.json`);
  safeWriteJson(selectorsPath, allElements);

  return { sourcePath, textsPath, selectorsPath };
}

/**
 * Convenience wrappers kept for any callers that want individual artifacts.
 * These also use the single-source approach internally.
 */
async function capturePageSource(driver, label) {
  const debugDir = ensureDebugDir();
  const filePath = path.join(debugDir, `${sanitizeLabel(label)}-source.xml`);
  const source = await driver.getPageSource();
  fs.writeFileSync(filePath, source, "utf-8");
  return filePath;
}

async function captureVisibleTexts(driver, label) {
  const debugDir = ensureDebugDir();
  const filePath = path.join(debugDir, `${sanitizeLabel(label)}-visible-texts.json`);
  const xmlSource = await driver.getPageSource();
  const elements = extractElementsFromSource(xmlSource);
  const uniqueTexts = [
    ...new Set(
      elements
        .map((el) => el.text)
        .filter((t) => t && t.trim().length > 0)
        .map((t) => t.trim()),
    ),
  ].sort((a, b) => a.localeCompare(b, "da"));
  safeWriteJson(filePath, uniqueTexts);
  return filePath;
}

async function captureSelectorInventory(driver, label) {
  const debugDir = ensureDebugDir();
  const filePath = path.join(debugDir, `${sanitizeLabel(label)}-selectors.json`);
  const xmlSource = await driver.getPageSource();
  const elements = extractElementsFromSource(xmlSource);
  safeWriteJson(filePath, elements);
  return filePath;
}

module.exports = {
  capturePageSource,
  captureVisibleTexts,
  captureSelectorInventory,
  captureDebugBundle,
};
