/**
 * Utility to safely build typed routes.
 * Automatically replaces dynamic parameters defined in the path.
 *
 * Example:
 * buildRoute("/:id/:pointOfSaleId/modifica/:trxId", {
 *   id: "123",
 *   pointOfSaleId: "456",
 *   trxId: "789"
 * })
 */
import { browserConsole } from './consoleLogger';

export function buildRoute(
  template: string,
  params: Record<string, string | number | undefined>
): string {
  let path = template;

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      browserConsole.warn(`[routeBuilder] Param "${key}" is ${value} for template "${template}"`);
      return;
    }
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  });

  const unresolvedParams = path.match(/:\w+/g);
  if (unresolvedParams) {
    browserConsole.warn(
      `[routeBuilder] Unresolved params ${unresolvedParams.join(
        ', '
      )} in generated path "${path}" from template "${template}"`
    );
  }

  return path;
}
