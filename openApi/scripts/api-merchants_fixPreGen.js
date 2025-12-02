// openApi/scripts/api-merchants_fixPreGen.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 1. read the original YAML
const yamlPath = path.join(__dirname, '../openapi.merchants.portal.yml');
const yamlContent = fs.readFileSync(yamlPath, 'utf8');
const openapi = yaml.load(yamlContent);

// 2. remove maxItems from the PUT /{merchantId}/point-of-sales
if (openapi.paths && openapi.paths['/{merchantId}/point-of-sales']) {
  const putOperation = openapi.paths['/{merchantId}/point-of-sales'].put;
  
  if (putOperation && 
      putOperation.requestBody && 
      putOperation.requestBody.content && 
      putOperation.requestBody.content['application/json']) {
    
    const schema = putOperation.requestBody.content['application/json'].schema;
    if (schema && schema.type === 'array' && schema.maxItems !== undefined) {
      delete schema.maxItems;
    }
  }
}

// save the modified YAML in a temporary file
const tempYamlPath = path.join(__dirname, '../generated/merchants-temp.yml');
fs.writeFileSync(tempYamlPath, yaml.dump(openapi, { lineWidth: -1 }));
