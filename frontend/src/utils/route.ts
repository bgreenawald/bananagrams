import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * Safely extracts a string parameter from route params
 */
export function getRouteParam(route: RouteLocationNormalizedLoaded, paramName: string): string {
  const param = route.params[paramName]
  return typeof param === 'string' ? param : ''
}

/**
 * Safely extracts a string query parameter from route query
 */
export function getRouteQuery(route: RouteLocationNormalizedLoaded, queryName: string): string {
  const query = route.query[queryName]
  return typeof query === 'string' ? query : ''
}

/**
 * Safely extracts a boolean query parameter from route query
 */
export function getRouteQueryBoolean(route: RouteLocationNormalizedLoaded, queryName: string): boolean {
  const query = route.query[queryName]
  return query === 'true'
}

/**
 * Validates that a route parameter exists and is not empty
 */
export function validateRouteParam(route: RouteLocationNormalizedLoaded, paramName: string): { valid: boolean; value: string; error?: string } {
  const value = getRouteParam(route, paramName)
  
  if (!value) {
    return {
      valid: false,
      value,
      error: `Missing required route parameter: ${paramName}`
    }
  }
  
  return { valid: true, value }
}