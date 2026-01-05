import fs from "node:fs";
import path from "node:path";

const filePath = path.join(
  process.cwd(),
  "src",
  "app",
  "vision",
  "VisionWorkspace.tsx"
);

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

let src = fs.readFileSync(filePath, "utf8");
const original = src;

function addUseMemoImportIfMissing() {
  const reactNamedImport =
    /import\s+(?:React\s*,\s*)?{\s*([^}]+)\s*}\s*from\s*["']react["'];/m;

  const m = src.match(reactNamedImport);
  if (!m) return;

  const names = m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (names.includes("useMemo")) return;

  names.push("useMemo");

  const hasReactDefault = /^import\s+React\s*,\s*{/m.test(m[0]);
  const rebuilt = hasReactDefault
    ? `import React, { ${names.join(", ")} } from "react";`
    : `import { ${names.join(", ")} } from "react";`;

  src = src.replace(reactNamedImport, rebuilt);
}

function addOrganisationIdToThreadType() {
  const threadTypeRegex = /type\s+Thread\s*=\s*{\s*([\s\S]*?)\n};/m;
  const m = src.match(threadTypeRegex);
  if (!m) return;

  const fullMatch = m[0];
  const body = m[1];

  if (body.includes("organisation_id")) return;

  let newBody = body;

  const chatTypeLineRegex = /\n\s*chatType\s*:\s*ChatType\s*;\s*\n/;
  if (chatTypeLineRegex.test(newBody)) {
    newBody = newBody.replace(
      chatTypeLineRegex,
      (x) => `${x}  organisation_id?: string | null;\n`
    );
  } else {
    newBody = `${newBody}\n  organisation_id?: string | null;\n`;
  }

  src = src.replace(fullMatch, fullMatch.replace(body, newBody));
}

function addOrgResolverHelpers() {
  if (src.includes("const organisationIdFromQuery")) return;
  if (src.includes("const resolveOrganisationId")) return;

  const anchor = "const searchParams = useSearchParams();";
  const idx = src.indexOf(anchor);
  if (idx === -1) return;

  const insertBlock = `

  const organisationIdFromQuery = useMemo(() => {
    const v =
      searchParams?.get("organisation_id") ||
      searchParams?.get("organisationId") ||
      searchParams?.get("org") ||
      null;

    const clean = typeof v === "string" ? v.trim() : "";
    return clean ? clean : null;
  }, [searchParams]);

  const resolveOrganisationId = (thread?: Thread | null) => {
    return thread?.organisation_id ?? organisationIdFromQuery ?? null;
  };
`;

  src = src.replace(anchor, anchor + insertBlock);
}

function patchOrganisationIdPayloadUsage() {
  src = src.replace(
    /organisation_id\s*:\s*currentThread\.\s*organisation_id/g,
    "organisation_id: resolveOrganisationId(currentThread)"
  );

  src = src.replace(
    /organisation_id\s*:\s*currentThread\?\.\s*organisation_id/g,
    "organisation_id: resolveOrganisationId(currentThread)"
  );
}

addUseMemoImportIfMissing();
addOrganisationIdToThreadType();
addOrgResolverHelpers();
patchOrganisationIdPayloadUsage();

if (src === original) {
  console.log("No changes needed, patch already applied.");
  process.exit(0);
}

fs.writeFileSync(filePath, src, "utf8");
console.log("Patched:", filePath);
