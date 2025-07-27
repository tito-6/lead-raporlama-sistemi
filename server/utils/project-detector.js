/**
 * Utility functions to detect project names from WebForm Notu field in lead data
 */

/**
 * Extract project name from WebForm Notu field
 * @param {string} webFormNotu The content of the WebForm Notu field
 * @returns {string|null} Detected project name or null if no project is detected
 */
export function detectProjectFromWebFormNotu(webFormNotu) {
  if (!webFormNotu) return null;

  // Normalize the text for case-insensitive matching
  // Remove diacritics (Turkish special characters) and convert to lowercase
  const normalizedText = webFormNotu
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Project patterns to check
  const projectPatterns = [
    // Common project patterns
    /\/\s*(Model\s+Sanayi\s+Merkezi)\s*$/i,
    /\/\s*([A-Za-zÇĞIŞÖÜİçğışöüi]+\s+Sanayi\s+Merkezi)\s*$/i,
    /\/\s*([A-Za-zÇĞIŞÖÜİçğışöüi][A-Za-zÇĞIŞÖÜİçğışöüi\s]*(?:Merkezi|Center|Residence|Plaza|Tower|City|Park|Proje|Konut|Sitesi|Complex|Mall|AVM))\s*$/i,
    /\/\s*([A-Za-zÇĞIŞÖÜİçğışöüi][A-Za-zÇĞIŞÖÜİçğışöüi\s]{2,40})\s*$/i,
  ];

  // Check each pattern
  for (const pattern of projectPatterns) {
    const match = webFormNotu.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

// Add normalization helper
function normalizeProjectName(name) {
  return (name || "").toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

/**
 * Filter leads by project name
 * @param {Array} leads Array of lead records with WebForm Notu field
 * @param {string} projectName Name of the project to filter by (or 'all' for all projects)
 * @returns {Array} Filtered array of leads
 */
export function filterLeadsByProject(leads, projectName) {
  if (projectName === "all") {
    return leads;
  }
  const normalizedProject = normalizeProjectName(projectName);

  return leads.filter((lead) => {
    // Check both projectName and detected project from WebForm Notu
    const projectField = normalizeProjectName(
      lead.projectName || lead["Proje"] || ""
    );
    const webFormNotu = lead.webFormNote || lead["WebForm Notu"] || "";
    const detectedProject = normalizeProjectName(
      detectProjectFromWebFormNotu(webFormNotu) || ""
    );

    return (
      projectField === normalizedProject ||
      detectedProject === normalizedProject
    );
  });
}
