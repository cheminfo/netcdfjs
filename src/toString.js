export function toString() {
  let result = [];

  result.push("DIMENSIONS");
  for (let dimension of this.dimensions) {
    result.push(`  ${dimension.name.padEnd(30)} = size: ${dimension.size}`);
  }

  result.push("");
  result.push("GLOBAL ATTRIBUTES");
  for (let attribute of this.globalAttributes) {
    result.push(`  ${attribute.name.padEnd(30)} = ${attribute.value}`);
  }

  let variables = JSON.parse(JSON.stringify(this.variables));
  result.push("");
  result.push("VARIABLES:");
  for (let variable of variables) {
    variable.value = this.getDataVariable(variable);
    let stringify = JSON.stringify(variable.value);
    if (stringify.length > 50) stringify = stringify.substring(0, 50);
    if (!isNaN(variable.value.length)) {
      stringify += ` (length: ${variable.value.length})`;
    }
    result.push(`  ${variable.name.padEnd(30)} = ${stringify}`);
  }
  return result.join("\n");
}
