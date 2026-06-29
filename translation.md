# Voice AI Primer - Translation System

This translation system allows you to extract all text from the HTML website into JSON files with hash-based keys, making it easy to translate and manage multiple language versions.

## Setup

1. Install dependencies:
   ```bash
   npm install jsdom
   ```

## Usage Workflow

### Step 1: Extract Texts

Extract all texts from the original HTML file in to a specific language file(e.g. Japanese):

```bash
npm run extract:ja
```

This creates `translations/ja.json` with all extractable text content using hash-based keys.

### Step 2: Translate

Open `translations/ja.json` in your editor and replace the English text with translations:

```json
{
  "f6aa50b7334b8f9d": "Voice AI & Voice Agents",
  "b9d78a82b1d2f512": "An Illustrated Primer"
}
```

Becomes:

```json
{
  "f6aa50b7334b8f9d": "音声AI・音声エージェント",
  "b9d78a82b1d2f512": "絵解き入門"
}
```

### Step 3: Generate Translated HTML

Create the translated HTML file:

```bash
npm run replace:ja
```

This creates `ja/index.html` with all translated content and updated asset paths.

## Translation JSON Structure

Each translation file is a simple hash-to-text mapping:

```json
{
  "f6aa50b7334b8f9d": "Voice AI & Voice Agents",
  "b9d78a82b1d2f512": "An Illustrated Primer",
  "a9360e0212a4d173": "Table of Contents",
  "3047907dcb0176f3": "Audio capture pipelines for telephony and WebRTC almost always default to \"speech mode.\" Speech can be compressed much more than music, and noise reduction and echo cancellation algorithms are easier to implement for narrower band signals."
}
```

The hash keys are generated from the original text content using SHA-256 (first 16 characters) with normalized whitespace.
