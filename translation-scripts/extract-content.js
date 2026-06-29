#!/usr/bin/env node

/**
 * Content Extraction Script for Voice AI Primer
 * Systematically extracts all translatable content from HTML
 * and generates comprehensive translation JSON files
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");

class ContentExtractor {
  constructor() {
    this.translations = {};
    this.hashToText = new Map();
  }

  /**
   * Generate hash key for text content
   */
  generateHashKey(text) {
    // Normalize whitespace: replace multiple whitespace chars with single space
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return null;

    const hash = crypto
      .createHash("sha256")
      .update(cleanText)
      .digest("hex")
      .substring(0, 16);

    // Store the mapping for reference
    this.hashToText.set(hash, cleanText);

    return hash;
  }

  /**
   * Extract text content while preserving internal HTML structure
   */
  extractTextWithHtml(element) {
    // Clone to avoid modifying original
    const clone = element.cloneNode(true);

    return clone.innerHTML.trim();
  }

  /**
   * Extract plain text content
   */
  extractPlainText(element) {
    return element.textContent.trim();
  }

  /**
   * Add text to translations using hash key
   */
  addTranslation(text) {
    const hashKey = this.generateHashKey(text);
    if (hashKey) {
      this.translations[hashKey] = text;
    }
    return hashKey;
  }

  /**
   * Extract all text content from document
   */
  extractAllText(document) {
    const textElements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, li, th, td, .footnote p, .image-caption, .table-caption"
    );

    let extractedCount = 0;

    textElements.forEach((element) => {
      // Skip if element is empty or only whitespace
      const text = this.extractTextWithHtml(element);
      if (!text || text.trim().length === 0) return;

      // Skip if text is very short (likely not meaningful content)
      if (text.trim().length < 3) return;

      this.addTranslation(text);
      extractedCount++;
    });

    // Also extract meta content
    this.extractMetaContent(document);

    return extractedCount;
  }

  /**
   * Extract meta content from document
   */
  extractMetaContent(document) {
    // Extract title
    const title = document.title;
    if (title) this.addTranslation(title);

    // Extract meta descriptions
    const description = document.querySelector(
      'meta[name="description"]'
    )?.content;
    if (description) this.addTranslation(description);

    const ogTitle = document.querySelector(
      'meta[property="og:title"]'
    )?.content;
    if (ogTitle) this.addTranslation(ogTitle);

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    )?.content;
    if (ogDescription) this.addTranslation(ogDescription);

    const twitterTitle = document.querySelector(
      'meta[name="twitter:title"]'
    )?.content;
    if (twitterTitle) this.addTranslation(twitterTitle);

    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    )?.content;
    if (twitterDescription) this.addTranslation(twitterDescription);
  }

  /**
   * Main extraction process
   */
  async extractContent(htmlFilePath) {
    console.log("🔍 Extracting content from HTML...");

    const htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract all text content with hash keys
    const extractedCount = this.extractAllText(document);

    console.log(`✅ Extraction complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Text elements extracted: ${extractedCount}`);
    console.log(
      `   - Unique text items: ${Object.keys(this.translations).length}`
    );
    console.log(`   - Hash mappings: ${this.hashToText.size}`);

    return this.translations;
  }

  /**
   * Save translations to JSON files
   */
  async saveTranslations({ outputDir = "./translations", language = "en" }) {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save English translations with hash keys
    const enPath = path.join(outputDir, "en.json");
    fs.writeFileSync(enPath, JSON.stringify(this.translations, null, 2));
    console.log(`💾 Saved hash-based English translations to: ${enPath}`);

    // Create Japanese template (copy of English)
    const translatedPath = path.join(outputDir, `${language}.json`);
    fs.writeFileSync(
      translatedPath,
      JSON.stringify(this.translations, null, 2)
    );
    console.log(
      `💾 Created ${language} translation template at: ${translatedPath}`
    );

    return { enPath, translatedPath };
  }
}

// CLI usage
if (require.main === module) {
  const extractor = new ContentExtractor();
  const htmlPath = process.argv[2] || "./index.html";
  const language = process.argv[3] || "en";

  extractor
    .extractContent(htmlPath)
    .then(() => extractor.saveTranslations({ language }))
    .catch(console.error);
}

module.exports = ContentExtractor;
