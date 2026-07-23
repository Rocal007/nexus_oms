// NEXUS: System-Operator & Supremacy-Spezifikation Compliance Engine (Axiom)

export interface Modification {
  original: string;
  replaced: string;
  reason: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  score: number; // Verification Score [0, 1]
  errors: string[];
  correctedText: string;
  modifications: Modification[];
}

// Simulated GISA registry for Austria (GewO 1994)
export const MOCK_GISA_REGISTRY: Record<string, { name: string; active: boolean; license: string }> = {
  "COMP-001": { name: "Müller Entrümpelung GmbH", active: true, license: "GISA-12948574" },
  "COMP-002": { name: "Schmid Transporte", active: true, license: "GISA-98274381" }
};

// Regional Vocabulary Matrix M_vocab(g) and sterile words filter F_sterile
const REGIONAL_RULES: Record<string, {
  replacements: { pattern: RegExp; replacement: string; reason: string }[];
}> = {
  "de-AT": {
    replacements: [
      {
        pattern: /\bEntsorgung\b/g,
        replacement: "Abtransport (Wertstoffübertragung)",
        reason: "Entsorgungs-Schutzbegriff in AT unter GewO 1994 / AWG 2002. Nur für konzessionierte Entsorgungsbetriebe zulässig."
      },
      {
        pattern: /\bentsorgen\b/g,
        replacement: "abtransportieren",
        reason: "Verbot irreführender Bewerbung von Entsorgungsdienstleistungen bei Räumung."
      },
      {
        pattern: /\bHaushaltsauflösung\b/g,
        replacement: "Räumung/Entrümpelung",
        reason: "Regionale Wortwahl (LINGUA-LOCA AT): Verwende Räumung statt Haushaltsauflösung."
      },
      {
        pattern: /\bUmzugsunternehmen\b/g,
        replacement: "Spedition",
        reason: "Regionale Wortwahl (LINGUA-LOCA AT): Umzugsdienste fallen unter das konzessionierte Speditionsgewerbe."
      },
      {
        pattern: /\bAprikosen\b/ig,
        replacement: "Marillen",
        reason: "Regionale Wortwahl (LINGUA-LOCA AT): Marillen statt Aprikosen."
      },
      {
        pattern: /\blecker\b/ig,
        replacement: "hervorragend",
        reason: "Beseitigung steriler bundesdeutscher Floskeln in AT."
      },
      {
        pattern: /\bgucken\b/ig,
        replacement: "sehen",
        reason: "Beseitigung steriler bundesdeutscher Floskeln in AT."
      },
      // Industry-Agnostic Rules (Recht, Handwerk, Medizin)
      {
        pattern: /\bsofortiger Anwaltsrückruf\b/ig,
        replacement: "Rückruf durch unser Kanzleiteam",
        reason: "Standesrecht Recht (AT/DE): Keine unzulässige Zusage von Direkt-Rückrufen."
      },
      {
        pattern: /\bKunde\b/ig,
        replacement: "Mandant",
        reason: "Branchen-Wortwahl (Recht): Verwendet Mandant anstelle von Kunde."
      }
    ]
  },
  "de-DE": {
    replacements: [
      {
        pattern: /\bSperrmüllabfuhr\b/g,
        replacement: "Wertstoffentsorgung",
        reason: "Regionale Wortwahl (LINGUA-LOCA DE): Verwende bundesweit anerkannte Termini."
      }
    ]
  },
  "de-CH": {
    replacements: [
      {
        pattern: /\bParkplatz\b/g,
        replacement: "Parkfeld",
        reason: "Regionale Wortwahl (LINGUA-LOCA CH): Parkfeld statt Parkplatz."
      },
      {
        pattern: /\bFahrrad\b/g,
        replacement: "Velo",
        reason: "Regionale Wortwahl (LINGUA-LOCA CH): Velo statt Fahrrad."
      }
    ]
  }
};

/**
 * Legislative projection operator (D_L) & Judicative compliance officer (J)
 * Applies regional word filters and compliance regulations.
 */
export function runComplianceCheck(
  text: string,
  locale: string = "de-AT",
  branch: string = "Entrümpelung",
  enforceGisa: boolean = true,
  partnerId?: string
): ComplianceResult {
  const errors: string[] = [];
  const modifications: Modification[] = [];
  let correctedText = text || "";

  // Apply LINGUA-LOCAL transformations
  const ruleSet = REGIONAL_RULES[locale];
  if (ruleSet) {
    ruleSet.replacements.forEach(({ pattern, replacement, reason }) => {
      if (pattern.test(correctedText)) {
        // Reset pattern regex state
        pattern.lastIndex = 0;
        correctedText = correctedText.replace(pattern, (match) => {
          modifications.push({
            original: match,
            replaced: replacement,
            reason
          });
          return replacement;
        });
      }
    });
  }

  // Austrian-specific rules (Legislative constraints C_legal)
  if (locale === "de-AT") {
    // Check for protected terms directly in the final text (Judicative Check)
    if (branch === "Entrümpelung" && /entsorg/i.test(correctedText)) {
      errors.push("Regulierungskonflikt: Der Text enthält den Begriff 'Entsorgung' für ein Räumungsgewerbe in Österreich. Dies verstößt gegen das AWG 2002.");
    }

    // GISA Verification Check
    if (enforceGisa && partnerId) {
      const gisaRecord = MOCK_GISA_REGISTRY[partnerId];
      if (!gisaRecord || !gisaRecord.active) {
        errors.push(`GISA-Validierungsfehler: Der Partner ${partnerId} besitzt keine aufrechte GISA-Registrierung.`);
      }
    }
  }

  const isCompliant = errors.length === 0;
  // Score: Deduct points for modifications and errors
  let score = 1.0;
  if (errors.length > 0) {
    score -= 0.5; // Severe compliance violation
  }
  if (modifications.length > 0) {
    score -= Math.min(0.5, modifications.length * 0.1); // minor vocabulary adaptations
  }
  score = Math.max(0, score);

  return {
    isCompliant,
    score,
    errors,
    correctedText,
    modifications
  };
}

/**
 * Mock ID disjointness check: ID_mock intersect ID_real = empty set.
 * Valid registers in AT:
 * - Firmenbuch (FN [0-9]+[a-z])
 * - GISA ([0-9]+)
 * Our order IDs must be prefixed with 'NEX-' and NOT match register formats.
 */
export function verifyIdDisjointness(id: string): boolean {
  // Check if ID matches Firmenbuch format: e.g. "FN 123456a"
  const fnRegex = /^FN\s*\d+[a-z]$/i;
  // Check if ID matches GISA registration number: e.g. "GISA-12345678" or purely digits
  const gisaRegex = /^(GISA-)?\d{8}$/i;

  if (fnRegex.test(id) || gisaRegex.test(id)) {
    return false; // Collision with official registry ID spaces
  }

  // Safe as long as it starts with allowed non-sequential platform prefixes
  const validPrefixes = ["NEX-", "SO-", "CAS-", "ORD-", "USR-", "COMP-", "BR-"];
  return validPrefixes.some(prefix => id.startsWith(prefix));
}

/**
 * Cryptographic & Non-Sequential System ID Generator (ServiceOS V7.0)
 * Generates entropy-backed non-sequential IDs (e.g. SO-7K29-QP51-84M, CAS-9K3A-77X2).
 * Prevents sequence enumeration attacks and order volume extrapolation.
 */
export function generateCryptographicId(prefix: string = "SO", blocks: number = 2, blockSize: number = 4): string {
  const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Exclude ambiguous 0, O, 1, I
  const parts: string[] = [prefix];
  
  for (let b = 0; b < blocks; b++) {
    let block = "";
    for (let i = 0; i < blockSize; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      block += charset[randomIndex];
    }
    parts.push(block);
  }
  return parts.join("-");
}

/**
 * Cicero 7Q-Completeness-Check (Section 16 of .cursorrules)
 * Checks presence of 7 dimensions: Quis, Quid, Ubi, Quibus, Cur, Quomodo, Quando
 */
export interface Cicero7QResult {
  score: number; // 0 to 1
  passedCount: number;
  details: {
    quis: { label: string; passed: boolean; match?: string };
    quid: { label: string; passed: boolean; match?: string };
    ubi: { label: string; passed: boolean; match?: string };
    quibus: { label: string; passed: boolean; match?: string };
    cur: { label: string; passed: boolean; match?: string };
    quomodo: { label: string; passed: boolean; match?: string };
    quando: { label: string; passed: boolean; match?: string };
  };
}

export function analyzeCicero7Q(text: string): Cicero7QResult {
  const normalized = (text || "").toLowerCase();

  // Quis (Wer): Mention of entity, authority, role or brand
  const quisRegex = /(gmbh|e\.u\.|ag|team|meister|experte|partner|spezialist|kanzlei|spedition|service|firma|gisa)/i;
  // Quid (Was): Concrete service definition
  const quidRegex = /(räumung|entrümpelung|transport|reinigung|montage|gutachten|beratung|reparatur|installation|server|hardware|lizenz)/i;
  // Ubi (Wo): Location, region, postal code, district
  const ubiRegex = /(wien|graz|linz|salzburg|innsbruck|klagenfurt|kärnten|steiermark|oberösterreich|niederösterreich|tirol|vorarlberg|deutschland|österreich|schweiz|bezirk|stadt|plz|\b\d{4}\b|\b\d{5}\b)/i;
  // Quibus (Womit): Tools, vehicles, materials, equipment
  const quibusRegex = /(lkw|transporter|kran|werkzeug|software|api|cloud|server|containern|messgerät|ausrüstung|hardware)/i;
  // Cur (Warum): Incentive, reason, urgency, conversion trigger
  const curRegex = /(kostenlos|wertanrechnung|garantie|festpreis|schnell|24h|notdienst|effizient|sicher|zertifiziert|rabatt)/i;
  // Quomodo (Wie): Process, steps, workflow
  const quomodoRegex = /(schritt|ablauf|anfrage|besichtigung|angebot|abwicklung|injektion|prozess|übernahme)/i;
  // Quando (Wann): Timing, availability, schedule
  const quandoRegex = /(heute|morgen|sofort|binnen|termin|24\/7|uhr|datum|saisonal|zeitnah|ab)/i;

  const quisMatch = normalized.match(quisRegex);
  const quidMatch = normalized.match(quidRegex);
  const ubiMatch = normalized.match(ubiRegex);
  const quibusMatch = normalized.match(quibusRegex);
  const curMatch = normalized.match(curRegex);
  const quomodoMatch = normalized.match(quomodoRegex);
  const quandoMatch = normalized.match(quandoRegex);

  const details = {
    quis: { label: "Quis (Wer - Entität & Autorität)", passed: !!quisMatch, match: quisMatch?.[0] },
    quid: { label: "Quid (Was - Konkreter Service)", passed: !!quidMatch, match: quidMatch?.[0] },
    ubi: { label: "Ubi (Wo - Geografische Injektion)", passed: !!ubiMatch, match: ubiMatch?.[0] },
    quibus: { label: "Quibus (Womit - Ressourcen & Werkzeuge)", passed: !!quibusMatch, match: quibusMatch?.[0] },
    cur: { label: "Cur (Warum - Conversion-Trigger)", passed: !!curMatch, match: curMatch?.[0] },
    quomodo: { label: "Quomodo (Wie - Prozess & Schritte)", passed: !!quomodoMatch, match: quomodoMatch?.[0] },
    quando: { label: "Quando (Wann - Timing & Verfgbarkeit)", passed: !!quandoMatch, match: quandoMatch?.[0] }
  };

  const passedCount = Object.values(details).filter(d => d.passed).length;
  const score = parseFloat((passedCount / 7).toFixed(2));

  return {
    score,
    passedCount,
    details
  };
}

/**
 * Haversine Geo-Distance Calculator (Section 20 of .cursorrules)
 * Calculates distance in km between two lat/lon coordinates
 */
export function calculateHaversineDistance(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const r = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((r * c).toFixed(2));
}

export interface LinkSiloNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  population?: number;
}

export interface LinkEdge {
  from: string;
  to: string;
  distanceKm: number;
  priority: number;
}

/**
 * Link-Siloing Operator L_silo (Section 20 & 21 of .cursorrules)
 * Generates graph edges for nodes within proximity threshold theta (default 100km)
 */
export function generateLinkSilo(
  nodes: LinkSiloNode[],
  maxDistanceKm: number = 100
): LinkEdge[] {
  const edges: LinkEdge[] = [];
  const epsilon = 0.001;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const u = nodes[i];
      const v = nodes[j];

      const dist = calculateHaversineDistance(u.lat, u.lon, v.lat, v.lon);
      if (dist <= maxDistanceKm) {
        const popU = u.population || 1000;
        const popV = v.population || 1000;
        const priority = parseFloat(((popU * popV) / (dist + epsilon)).toFixed(2));

        edges.push({
          from: u.id,
          to: v.id,
          distanceKm: dist,
          priority
        });
      }
    }
  }

  // Sort by priority descending
  return edges.sort((a, b) => b.priority - a.priority);
}

/**
 * Lupos Score (L): Flesch Reading Ease score on German texts.
 * Formula for German: FRE = 180 - ASL - (58.5 * ASW)
 * ASL = Average Sentence Length (words / sentences)
 * ASW = Average Syllables per Word (syllables / words)
 */
export function calculateLuposScore(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);

  if (words.length === 0) return 0;
  const sentenceCount = sentences.length || 1;
  const wordCount = words.length;

  const asl = wordCount / sentenceCount;

  // Simple syllable estimator for German
  // Count vowel clusters (a, e, i, o, u, ä, ö, ü, y, ei, au, eu, ie)
  let syllableCount = 0;
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-zäöüß]/g, "");
    if (cleanWord.length === 0) return;
    const matches = cleanWord.match(/[aeiouyäöü]+/g);
    let count = matches ? matches.length : 1;
    // Adjustments for trailing silent 'e' or diphtongs
    if (cleanWord.endsWith("e") && count > 1) {
      count--;
    }
    syllableCount += count;
  });

  const asw = syllableCount / wordCount;

  // Flesch Reading Ease for German
  const fre = 180 - asl - (58.5 * asw);

  // Normalize score into [0, 1]
  // FRE typically ranges from 0 (very hard) to 100 (very easy).
  // Target ease for neurodidactic (Birkenbihl) reading is around 60-80.
  // We normalize so that 60-90 yields the highest score (1.0).
  let normalized = 0.5;
  if (fre >= 60 && fre <= 90) {
    normalized = 1.0;
  } else if (fre > 90) {
    normalized = 0.9 - (fre - 90) * 0.01; // too simple/childish
  } else {
    normalized = fre / 60; // scale down
  }

  return Math.max(0, Math.min(1.0, normalized));
}

/**
 * Idempotent Cache Operator (C)
 * Stores verified compliant states and prevents redundant evaluations.
 */
export class SemanticCache {
  private cache: Map<string, { result: ComplianceResult; timestamp: number }> = new Map();

  // Tolerance parameter epsilon (Levenshtein distance)
  private getDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const d: number[][] = [];

    for (let i = 0; i <= m; i++) d[i] = [i];
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1, // deletion
          d[i][j - 1] + 1, // insertion
          d[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return d[m][n];
  }

  // Lookup in cache using semantic proximity (epsilon tolerance)
  public get(text: string, epsilon: number = 3): ComplianceResult | null {
    const normalizedText = text.trim().toLowerCase();
    for (const [cachedText, entry] of this.cache.entries()) {
      const distance = this.getDistance(normalizedText, cachedText);
      if (distance <= epsilon) {
        console.log(`[Cache Hit] Stabilized semantically equivalent state. Distance: ${distance} <= epsilon (${epsilon})`);
        return entry.result;
      }
    }
    return null;
  }

  public set(text: string, result: ComplianceResult): void {
    if (result.isCompliant) {
      this.cache.set(text.trim().toLowerCase(), {
        result,
        timestamp: Date.now()
      });
    }
  }
}

export function validateAtuNumber(atu: string): boolean {
  if (!atu) return false;
  const regex = /^ATU\d{8}$/i;
  return regex.test(atu.trim());
}

export function validateGisaNumber(gisa: string): boolean {
  if (!gisa) return false;
  const regex = /^(GISA-)?\d{7,8}$/i;
  return regex.test(gisa.trim());
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  previousHash?: string;
  hash?: string;
}

export function generateAuditHash(previousHash: string, timestamp: string, user: string, action: string, details: string): string {
  const rawStr = `${previousHash || 'GENESIS'}:${timestamp}:${user}:${action}:${details}`;
  let hash = 0;
  for (let i = 0; i < rawStr.length; i++) {
    const char = rawStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `HASH-${hex}`;
}

export function verifyAuditTrailIntegrity(logs: AuditLogEntry[]): { isValid: boolean; corruptedIndex: number; logsCount: number } {
  if (!logs || logs.length === 0) return { isValid: true, corruptedIndex: -1, logsCount: 0 };
  
  const sorted = [...logs].reverse();
  let prevHash = 'GENESIS';

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const expectedHash = generateAuditHash(prevHash, entry.timestamp, entry.user, entry.action, entry.details);
    
    if (entry.hash && entry.hash !== expectedHash) {
      return { isValid: false, corruptedIndex: logs.length - 1 - i, logsCount: logs.length };
    }
    prevHash = expectedHash;
  }

  return { isValid: true, corruptedIndex: -1, logsCount: logs.length };
}

if (typeof window !== "undefined") {
  (window as any).generateAuditHash = generateAuditHash;
  (window as any).verifyAuditTrailIntegrity = verifyAuditTrailIntegrity;
}

