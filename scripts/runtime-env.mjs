import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const KEY_PATTERN = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

function stripInlineComment(value) {
  let quote = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];

    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote ?? char;
      continue;
    }

    if (char === "#" && quote === null && (index === 0 || /\s/.test(previous))) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value.trimEnd();
}

function unquote(value) {
  const trimmed = stripInlineComment(value).trim();
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    const body = trimmed.slice(1, -1);

    if (first === '"') {
      return body
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }

    return body.replace(/\\'/g, "'");
  }

  return trimmed;
}

export function parseRuntimeEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = rawLine.match(KEY_PATTERN);

    if (!match) {
      continue;
    }

    values[match[1]] = unquote(match[2] ?? "");
  }

  return values;
}

export function runtimeEnvFiles(root, nodeEnv = "production") {
  return [".env", `.env.${nodeEnv}`, ".env.local", `.env.${nodeEnv}.local`].map((file) => path.join(root, file));
}

export function loadRuntimeEnv({ root = process.cwd(), nodeEnv = process.env.NODE_ENV || "production", target = process.env } = {}) {
  const loadedFiles = [];
  const fileValues = {};

  for (const file of runtimeEnvFiles(root, nodeEnv)) {
    if (!existsSync(file)) {
      continue;
    }

    Object.assign(fileValues, parseRuntimeEnv(readFileSync(file, "utf8")));
    loadedFiles.push(file);
  }

  const appliedKeys = [];

  for (const [key, value] of Object.entries(fileValues)) {
    if (target[key] === undefined) {
      target[key] = value;
      appliedKeys.push(key);
    }
  }

  return {
    loadedFiles,
    appliedKeys
  };
}
