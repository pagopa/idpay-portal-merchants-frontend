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

// 3. Automatically mark as nullable all non-required properties in every schema.
//    This ensures the generated io-ts codecs handle null values returned by the API
//    without validation errors (t.partial only accepts undefined, not null;
//    by adding nullable: true here, api-spec-converter converts it to x-nullable: true
//    in Swagger 2, and gen-api-models then generates t.union([type, t.null])).
function markOptionalPropsNullable(schemaObj) {
  if (!schemaObj || typeof schemaObj !== 'object') return;

  if (schemaObj.type === 'object' && schemaObj.properties) {
    const required = Array.isArray(schemaObj.required) ? schemaObj.required : [];
    for (const propName of Object.keys(schemaObj.properties)) {
      const prop = schemaObj.properties[propName];
      // skip $ref properties: in OpenAPI 3, nullable cannot be combined directly
      // with $ref. Only add nullable to leaf (scalar) properties.
      if (!required.includes(propName) && !prop.$ref) {
        prop.nullable = true;
      }
      // recurse into nested objects
      markOptionalPropsNullable(prop);
    }
  }

  // handle allOf / anyOf / oneOf compositions
  for (const compositionKey of ['allOf', 'anyOf', 'oneOf']) {
    if (Array.isArray(schemaObj[compositionKey])) {
      for (const subSchema of schemaObj[compositionKey]) {
        markOptionalPropsNullable(subSchema);
      }
    }
  }
}

if (openapi.components && openapi.components.schemas) {
  for (const schemaName of Object.keys(openapi.components.schemas)) {
    markOptionalPropsNullable(openapi.components.schemas[schemaName]);
  }
}

// save the modified YAML in a temporary file
const tempYamlPath = path.join(__dirname, '../generated/merchants-temp.yml');
fs.writeFileSync(tempYamlPath, yaml.dump(openapi, { lineWidth: -1 }));
