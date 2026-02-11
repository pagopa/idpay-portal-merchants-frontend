/**
 * Post generation fix for merchants client
 *
 * This script fixes incorrect multipart generation for:
 * updateInvoiceTransaction
 *
 * It replaces the broken body mapper:
 *   body: ({ ["docNumber"]: docNumber }) => docNumber_.uri
 *
 * With proper FormData handling.
 */

const fs = require("fs");
const path = require("path");

const clientPath = path.resolve(
  __dirname,
  "../../src/api/generated/merchants/client.ts"
);

if (!fs.existsSync(clientPath)) {
  console.log("Merchants client not found, skipping fixPostGen.");
  process.exit(0);
}

let content = fs.readFileSync(clientPath, "utf8");

// Fix broken multipart body mapping
content = content.replace(
  /body:\s*\(\{\s*\["docNumber"\]:\s*docNumber\s*\}\)\s*=>\s*docNumber_\.uri,/g,
  `body: (bodyParams) => {
      const formData = new FormData();
      if (bodyParams?.file) {
        formData.append("file", bodyParams.file);
      }
      if (bodyParams?.docNumber) {
        formData.append("docNumber", bodyParams.docNumber);
      }
      return formData;
    },`
);

// Remove unused destructuring if present
content = content.replace(
  /\(\{\s*\["docNumber"\]:\s*docNumber\s*\}\)/g,
  "(bodyParams)"
);

fs.writeFileSync(clientPath, content);

console.log("✅ Merchants client multipart fix applied.");
