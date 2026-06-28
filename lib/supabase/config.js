export function normalizeSupabaseUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value.trim());
    const dashboardMatch = parsed.pathname.match(/\/dashboard\/project\/([^/]+)/);
    if (parsed.hostname === "supabase.com" && dashboardMatch) return `https://${dashboardMatch[1]}.supabase.co`;
    if (parsed.hostname.endsWith(".supabase.co")) return parsed.origin;
    return null;
  } catch {
    return null;
  }
}
