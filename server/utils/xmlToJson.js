const xml2js = require("xml2js");

async function xmlToJson(xmlData) {
  try {
    // Some feeds contain invalid XML characters or malformed HTML tags
    const cleaned = xmlData
      .replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, "&amp;") // fix unescaped &
      .replace(/<br\s*\/?>/gi, " ") // remove <br> tags
      .replace(/<[^>]*onerror=.*?>/gi, ""); // remove any malicious tags

    const parser = new xml2js.Parser({
      explicitArray: true,
      strict: false, // allow slightly malformed XML
      mergeAttrs: true,
      trim: true,
      normalizeTags: true,
    });

    const result = await parser.parseStringPromise(cleaned);
    return result?.rss?.channel?.[0]?.item || [];
  } catch (err) {
    console.error("XML parse error:", err.message);
    throw new Error("Invalid or malformed XML feed");
  }
}

module.exports = xmlToJson;
