/**
 * Utility functions to detect project names from WebForm Notu field in lead data
 */

/**
 * Extract project name from WebForm Notu field
 * @param webFormNotu The content of the WebForm Notu field
 * @returns Detected project name or null if no project is detected
 */
export function detectProjectFromWebFormNotu(
  webFormNotu: string
): string | null {
  if (!webFormNotu) return null;

  // Normalize the text for case-insensitive matching
  // Remove diacritics (Turkish special characters) and convert to lowercase
  const normalizedText = webFormNotu
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // More robust pattern matching for "Model Sanayi Merkezi"
  // Check for variations and partial matches
  const sanayiPatterns = [
    "sanayi",
    "sanay",
    "model sanayi",
    "sanay merk",
    "sanayi merkezi",
  ];

  for (const pattern of sanayiPatterns) {
    if (normalizedText.includes(pattern)) {
      return "Model Sanayi Merkezi";
    }
  }

  // More robust pattern matching for "Model Kuyum Merkezi"
  // Check for variations and partial matches
  const kuyumPatterns = [
    "kuyum",
    "kıyum", // Possible typo
    "kuyüm", // Possible typo
    "kuym", // Possible typo or abbreviation
    "kuyumcu",
    "kuyum proje",
    "model kuyum",
    "kuyum merkez",
  ];

  for (const pattern of kuyumPatterns) {
    if (normalizedText.includes(pattern)) {
      console.log(
        `Detected Kuyum project from pattern: "${pattern}" in text: "${webFormNotu.substring(
          0,
          50
        )}..."`
      );
      return "Model Kuyum Merkezi";
    }
  }

  // Check for project name in text format with variations
  if (
    normalizedText.includes("projemiz") &&
    normalizedText.includes("ikitelli")
  ) {
    console.log(
      `Detected Kuyum project from Ikitelli reference in: "${webFormNotu.substring(
        0,
        50
      )}..."`
    );
    return "Model Kuyum Merkezi";
  }

  // Check for other common project patterns
  if (normalizedText.includes("vadi istanbul")) {
    return "Vadi İstanbul";
  }

  // No recognized project pattern
  return null;
}

/**
 * Process an array of lead records to extract all unique project names
 * @param leads Array of lead records with WebForm Notu field
 * @returns Array of unique project names found in the data
 */
export function extractProjectsFromLeads(leads: any[]): string[] {
  const projects = new Set<string>();

  // Add our standard project names first to ensure they are always available
  projects.add("Model Kuyum Merkezi");
  projects.add("Model Sanayi Merkezi");

  let kuyumDetectionCount = 0;
  let sanayiDetectionCount = 0;

  leads.forEach((lead) => {
    // Try multiple field variations for WebForm Notu
    const webFormNotuOptions = [
      lead["WebForm Notu"],
      lead["webFormNotu"],
      lead["WebFormNotu"],
      lead["webFormNote"],
      lead["WebFormNote"],
    ];

    // Find the first non-empty value
    const webFormNotu = webFormNotuOptions.find(
      (value) => value && typeof value === "string"
    );

    if (webFormNotu) {
      const project = detectProjectFromWebFormNotu(webFormNotu);
      if (project) {
        if (project === "Model Kuyum Merkezi") kuyumDetectionCount++;
        if (project === "Model Sanayi Merkezi") sanayiDetectionCount++;
        projects.add(project);
      }
    }

    // Also check other fields that might contain project info
    const notesOptions = [
      lead["Notlar"],
      lead["Notes"],
      lead["lastMeetingNote"],
      lead["SON GORUSME NOTU"],
      lead["SON GÖRÜŞME NOTU"],
    ];

    const notes = notesOptions.find(
      (value) => value && typeof value === "string"
    );

    if (notes && !webFormNotu) {
      const projectFromNotes = detectProjectFromWebFormNotu(notes);
      if (projectFromNotes) {
        if (projectFromNotes === "Model Kuyum Merkezi") kuyumDetectionCount++;
        if (projectFromNotes === "Model Sanayi Merkezi") sanayiDetectionCount++;
        projects.add(projectFromNotes);
      }
    }
  });

  console.log(
    `Project detection stats - Kuyum: ${kuyumDetectionCount}, Sanayi: ${sanayiDetectionCount}`
  );

  return Array.from(projects);
}

// Add normalization helper
function normalizeProjectName(name: string): string {
  return (name || "").toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

/**
 * Filter leads by project name
 * @param leads Array of lead records with WebForm Notu field
 * @param projectName Name of the project to filter by (or 'all' for all projects)
 * @returns Filtered array of leads
 */
export function filterLeadsByProject(leads: any[], projectName: string): any[] {
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
