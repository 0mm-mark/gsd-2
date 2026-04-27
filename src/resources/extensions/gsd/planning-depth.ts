// gsd-2 / Phase 11 — Helper to set planning_depth in .gsd/PREFERENCES.md.
//
// Persists the user's deep-mode opt-in across sessions. Reads the existing
// preferences file (if any), parses its YAML frontmatter, sets/updates
// planning_depth, and writes the file back preserving body content and other
// frontmatter keys.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { getProjectGSDPreferencesPath } from "./preferences.js";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Set planning_depth in the project's .gsd/PREFERENCES.md.
 * Creates the file if it does not exist. Preserves existing frontmatter
 * keys and body content. Intended to be called when the user opts into
 * (or out of) deep mode via `/gsd new-project --deep` or similar.
 */
export function setPlanningDepth(
  basePath: string,
  depth: "light" | "deep",
): void {
  const path = getProjectGSDPreferencesPath(basePath);

  let frontmatter: Record<string, unknown> = {};
  let body = "";

  if (existsSync(path)) {
    const content = readFileSync(path, "utf-8");
    const match = content.match(FRONTMATTER_RE);
    if (match) {
      const parsed = parseYaml(match[1]);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        frontmatter = parsed as Record<string, unknown>;
      }
      body = match[2];
    } else {
      // No frontmatter delimiters — preserve existing content as body.
      body = content;
    }
  }

  frontmatter.planning_depth = depth;

  // yaml.stringify emits a trailing newline. Strip if present so we control framing.
  const yamlBlock = stringifyYaml(frontmatter).replace(/\n$/, "");
  const newContent = body
    ? `---\n${yamlBlock}\n---\n\n${body.replace(/^\n+/, "")}`
    : `---\n${yamlBlock}\n---\n`;

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, newContent, "utf-8");
}
