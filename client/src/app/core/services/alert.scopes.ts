// ALERT_SCOPES
// Create inline error not tost notification for login errors

export const ALERT_SCOPES = {
  login: "login",
} as const;

export type AlertScope = (typeof ALERT_SCOPES)[keyof typeof ALERT_SCOPES];
