import tinyHTML from "@sardine/eleventy-plugin-tinyhtml";
import path from "path";
import fs from "fs";

export default function (eleventyConfig) {

  // Plugins
  eleventyConfig.addPlugin(tinyHTML);

  // Filters
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("striptags", (content) => {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().substring(0, 500);
  });

  eleventyConfig.addFilter("truncate", (str, len, end) => {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.substring(0, len).replace(/\s+\S*$/, "") + (end || "...");
  });

  // Filter array by key (supports nested keys like "data.phase")
  eleventyConfig.addFilter("where", (arr, key, value) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item) => {
      const val = key.split(".").reduce((o, k) => (o || {})[k], item);
      return val === value;
    });
  });

  // Pad number with leading zero
  eleventyConfig.addFilter("pad", (num, size) => {
    let s = String(num);
    while (s.length < (size || 2)) s = "0" + s;
    return s;
  });

  // String startsWith check (for sitemap)
  eleventyConfig.addFilter("startsWith", (str, prefix) => {
    if (!str) return false;
    return str.startsWith(prefix);
  });

  // ISO date string (for sitemap)
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toISOString();
  });

  // Dump (JSON stringify for template data injection)
  eleventyConfig.addFilter("dump", (obj) => {
    return JSON.stringify(obj);
  });

  // Range helper for Nunjucks (e.g., range(1, 101) → [1..100])
  eleventyConfig.addShortcode("range_options", (start, end) => {
    let html = "";
    for (let i = start; i < end; i++) {
      html += `<option value="${i}">Lesson ${i}</option>\n`;
    }
    return html;
  });

  // Concatenate all CSS into a single file (avoids @import waterfall)
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: function (inputContent, inputPath) {
      if (!inputPath.endsWith("global.css")) return;
      return function () {
        const cssDir = path.dirname(inputPath);
        const importOrder = [
          "reset.css",
          "tokens.css",
          "utilities.css",
          "components/header.css",
          "components/nav.css",
          "components/hamburger-panel.css",
          "components/footer.css",
          "components/buttons.css",
          "components/lesson-card.css",
          "components/pointer.css",
          "components/orthography.css",
          "pages/home.css",
          "pages/dashboard.css",
          "pages/parent-guide.css",
          "pages/about.css",
          "pages/contact.css",
          "pages/lesson.css",
          "pages/story.css",
        ];
        let combined = "";
        for (const file of importOrder) {
          const filePath = path.join(cssDir, file);
          try {
            combined += fs.readFileSync(filePath, "utf8") + "\n";
          } catch (e) {
            combined += `/* Missing: ${file} */\n`;
          }
        }
        return combined;
      };
    },
  });

  // Passthrough Copy
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });

  // Collections
  eleventyConfig.addCollection("stories", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/stories/**/*.md").sort((a, b) => {
      return (a.data.order || 0) - (b.data.order || 0);
    });
  });

  // Watch Targets
  eleventyConfig.addWatchTarget("src/assets/css/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
