#!/usr/bin/env node

/**
 * Content Replacement Script for Voice AI Primer
 * Generates localized HTML files by replacing content with translations
 * Usage: node replace-content.js [language]
 * Example: node replace-content.js ja
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { JSDOM } = require("jsdom");

class ContentReplacer {
  constructor() {
    this.englishTranslations = {};
    this.targetTranslations = {};
    this.textToHash = new Map();
  }

  /**
   * Generate hash key for text content (same algorithm as extractor)
   */
  generateHashKey(text) {
    // Normalize whitespace: replace multiple whitespace chars with single space
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return null;

    return crypto
      .createHash("sha256")
      .update(cleanText)
      .digest("hex")
      .substring(0, 16);
  }

  /**
   * Load translation files
   */
  loadTranslations(language) {
    const translationsDir = path.join(process.cwd(), "translations");
    
    // Load English translations as reference
    const enPath = path.join(translationsDir, "en.json");
    if (!fs.existsSync(enPath)) {
      throw new Error(`English translation file not found: ${enPath}`);
    }
    
    // Load target language translations
    const langPath = path.join(translationsDir, `${language}.json`);
    if (!fs.existsSync(langPath)) {
      throw new Error(`Translation file not found: ${langPath}`);
    }

    this.englishTranslations = JSON.parse(fs.readFileSync(enPath, "utf8"));
    this.targetTranslations = JSON.parse(fs.readFileSync(langPath, "utf8"));

    // Create reverse mapping from English text to hash
    for (const [hash, text] of Object.entries(this.englishTranslations)) {
      this.textToHash.set(text, hash);
    }

    console.log(`📖 Loaded ${Object.keys(this.englishTranslations).length} English translations`);
    console.log(`📖 Loaded ${Object.keys(this.targetTranslations).length} ${language} translations`);
  }

  /**
   * Find translation for text content
   */
  getTranslation(originalText) {
    const trimmedText = originalText.trim();
    
    // First try direct hash lookup
    let hash = this.textToHash.get(trimmedText);
    
    // If not found, try generating hash
    if (!hash) {
      hash = this.generateHashKey(trimmedText);
    }

    // Return translation if found, otherwise return original text
    if (hash && this.targetTranslations[hash]) {
      return this.targetTranslations[hash];
    }
    
    return originalText;
  }

  /**
   * Replace text content in element while preserving HTML structure
   */
  replaceElementContent(element) {
    // Get the innerHTML and try to find translation
    const originalContent = element.innerHTML.trim();
    const translation = this.getTranslation(originalContent);
    
    if (translation !== originalContent) {
      element.innerHTML = translation;
      return true;
    }
    
    return false;
  }

  /**
   * Replace meta content
   */
  replaceMetaContent(document) {
    let replacedCount = 0;

    // Replace title
    const title = document.title;
    const translatedTitle = this.getTranslation(title);
    if (translatedTitle !== title) {
      document.title = translatedTitle;
      replacedCount++;
    }

    // Replace meta descriptions
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]'
    ];

    metaSelectors.forEach(selector => {
      const meta = document.querySelector(selector);
      if (meta && meta.content) {
        const translated = this.getTranslation(meta.content);
        if (translated !== meta.content) {
          meta.content = translated;
          replacedCount++;
        }
      }
    });

    return replacedCount;
  }

  /**
   * Update relative paths for subdirectory
   */
  updateRelativePaths(document) {
    let updatedCount = 0;

    // Update CSS links
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
      if (link.href && !link.href.startsWith('http')) {
        // If it's a relative path, prepend ../
        if (!link.href.startsWith('../')) {
          link.href = '../' + link.href;
          updatedCount++;
        }
      }
    });

    // Update script sources
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (script.src && !script.src.startsWith('http')) {
        // If it's a relative path, prepend ../
        if (!script.src.startsWith('../')) {
          script.src = '../' + script.src;
          updatedCount++;
        }
      }
    });

    // Update image sources
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      if (img.src && !img.src.startsWith('http')) {
        // If it's a relative path, prepend ../
        if (!img.src.startsWith('../')) {
          img.src = '../' + img.src;
          updatedCount++;
        }
      }
    });

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && favicon.href && !favicon.href.startsWith('http')) {
      if (!favicon.href.startsWith('../')) {
        favicon.href = '../' + favicon.href;
        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Replace all text content in document
   */
  replaceAllContent(document) {
    const textElements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, li, th, td, .footnote p, .image-caption, .table-caption"
    );

    let replacedCount = 0;

    textElements.forEach((element) => {
      // Skip if element is empty or only whitespace
      const text = element.innerHTML.trim();
      if (!text || text.length === 0) return;

      // Skip if text is very short (likely not meaningful content)
      if (text.length < 3) return;

      if (this.replaceElementContent(element)) {
        replacedCount++;
      }
    });

    // Replace meta content
    const metaReplacedCount = this.replaceMetaContent(document);
    replacedCount += metaReplacedCount;

    return replacedCount;
  }

  /**
   * Generate localized HTML file
   */
  async generateLocalizedHtml(language, inputHtmlPath = "./index.html") {
    console.log(`🌐 Generating ${language} version of HTML...`);

    // Load translations
    this.loadTranslations(language);

    // Read source HTML
    const htmlContent = fs.readFileSync(inputHtmlPath, "utf8");
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Update html lang attribute
    document.documentElement.lang = language;

    // Replace all content
    const replacedCount = this.replaceAllContent(document);

    // Update relative paths for subdirectory
    const pathsUpdated = this.updateRelativePaths(document);

    // Create output directory
    const outputDir = path.join(process.cwd(), language);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write localized HTML
    const outputPath = path.join(outputDir, "index.html");
    const serialized = dom.serialize();
    fs.writeFileSync(outputPath, serialized);

    console.log(`✅ Generated localized HTML!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Elements replaced: ${replacedCount}`);
    console.log(`   - Paths updated: ${pathsUpdated}`);
    console.log(`   - Output file: ${outputPath}`);

    return outputPath;
  }
}

// CLI usage
if (require.main === module) {
  const language = process.argv[2];
  
  if (!language) {
    console.error("❌ Please specify a language code");
    console.log("Usage: node replace-content.js [language]");
    console.log("Example: node replace-content.js ja");
    process.exit(1);
  }

  const replacer = new ContentReplacer();
  replacer
    .generateLocalizedHtml(language)
    .catch(error => {
      console.error("❌ Error generating localized HTML:", error.message);
      process.exit(1);
    });
}

module.exports = ContentReplacer;