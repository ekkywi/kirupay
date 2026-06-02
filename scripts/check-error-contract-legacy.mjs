#!/usr/bin/env node
import { execSync } from "node:child_process";

const patterns = [
  "throw new Error(data.error",
  "throw new Error(resData.error",
  "data.error ||",
  "resData.error ||",
];

const filesScope = "src";
const violations = [];

for (const pattern of patterns) {
  try {
    const output = execSync(`rg -n --fixed-strings \"${pattern}\" ${filesScope}`, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf-8",
    });

    if (output.trim()) {
      violations.push({ pattern, output: output.trim() });
    }
  } catch (error) {
    const err = error;
    if (err && typeof err === "object" && "status" in err && err.status === 1) {
      continue;
    }
    throw error;
  }
}

if (violations.length > 0) {
  console.error("Legacy API error parsing patterns detected:");
  for (const violation of violations) {
    console.error(`\nPattern: ${violation.pattern}`);
    console.error(violation.output);
  }
  process.exit(1);
}

console.log("No legacy API error parsing patterns detected.");
