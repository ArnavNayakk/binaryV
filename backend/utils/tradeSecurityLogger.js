export function logTradeSecurityEvent(event, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };

  console.warn("[trade-security]", JSON.stringify(payload));
}
