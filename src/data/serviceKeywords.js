export const SERVICE_KEYWORDS = [
  "carpenter",
  "handyman",
  "plumber",
  "electrician",
  "gardener",
  "landscaper",
  "lawn care",
  "car cleaner",
  "house cleaning",
  "window cleaning",
  "pressure washing",
  "painting",
  "drywall",
  "tiling",
  "furniture assembly",
  "moving help",
  "snow removal",
  "junk removal",
  "dog walking",
  "babysitting",
  "tutoring",
];

export function suggestServices(input, limit = 8) {
  const q = (input || "").toLowerCase().trim();
  if (!q) return [];

  const starts = SERVICE_KEYWORDS.filter((k) =>
    k.startsWith(q)
  );
  const includes = SERVICE_KEYWORDS.filter(
    (k) => !k.startsWith(q) && k.includes(q)
  );

  return [...starts, ...includes].slice(0, limit);
}
