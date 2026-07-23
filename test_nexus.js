import { runComplianceCheck, verifyIdDisjointness, calculateLuposScore, SemanticCache, analyzeCicero7Q, calculateHaversineDistance, generateLinkSilo, generateCryptographicId, validateAtuNumber, validateGisaNumber, generateAuditHash, verifyAuditTrailIntegrity } from './axiom.ts';
import { calculatePartnerTrustScore } from './partners.js';
import { calculateCommissionAndPayout } from './finance.js';
import { evaluatePromptStack, runAiSelfCorrection } from './orchestrator.js';

function runTests() {
  console.log("=== RUNNING NEXUS V2 ENGINE TESTS ===");

  // Test 1: LINGUA-LOCAL replacements for Austria
  console.log("\n[Test 1] Testing LINGUA-LOCAL replacements (Austria)");
  const rawTextAT = "Wir bieten eine Haushaltsauflösung mit professioneller Entsorgung durch ein Umzugsunternehmen. Äpfel und Aprikosen.";
  const resultAT = runComplianceCheck(rawTextAT, "de-AT", "Entrümpelung", false);
  console.log("Original Text:", rawTextAT);
  console.log("Corrected Text:", resultAT.correctedText);
  console.log("Is Compliant:", resultAT.isCompliant);
  console.log("Score:", resultAT.score);
  console.log("Modifications:", resultAT.modifications.map(m => `${m.original} -> ${m.replaced} (${m.reason})`));

  if (!resultAT.correctedText.includes("Räumung/Entrümpelung") || resultAT.correctedText.includes("Entsorgung") || resultAT.correctedText.includes("Haushaltsauflösung")) {
    throw new Error("Test 1 Failed: Replacements were not correctly applied for de-AT.");
  }
  console.log("Test 1 Passed!");

  // Test 2: GISA Registry check
  console.log("\n[Test 2] Testing GISA Registry checks");
  const resultGisaValid = runComplianceCheck("Räumung in Wien", "de-AT", "Entrümpelung", true, "COMP-001");
  console.log("Valid Partner COMP-001 (Müller Entrümpelung GmbH):", resultGisaValid.isCompliant ? "COMPLIANT" : "FAIL", "Errors:", resultGisaValid.errors);
  
  const resultGisaInvalid = runComplianceCheck("Räumung in Wien", "de-AT", "Entrümpelung", true, "INVALID-PARTNER");
  console.log("Invalid Partner:", resultGisaInvalid.isCompliant ? "COMPLIANT" : "FAIL (Expected)", "Errors:", resultGisaInvalid.errors);

  if (!resultGisaValid.isCompliant || resultGisaInvalid.isCompliant) {
    throw new Error("Test 2 Failed: GISA registry check failed.");
  }
  console.log("Test 2 Passed!");

  // Test 3: ID Disjointness
  console.log("\n[Test 3] Testing ID Disjointness");
  const idMock = "NEX-2980";
  const idRealGisa = "GISA-12345678";
  const idRealFb = "FN 123456a";

  const isMockDisjoint = verifyIdDisjointness(idMock);
  const isRealGisaDisjoint = verifyIdDisjointness(idRealGisa);
  const isRealFbDisjoint = verifyIdDisjointness(idRealFb);

  console.log(`ID ${idMock} disjointness check:`, isMockDisjoint);
  console.log(`ID ${idRealGisa} disjointness check:`, isRealGisaDisjoint);
  console.log(`ID ${idRealFb} disjointness check:`, isRealFbDisjoint);

  if (!isMockDisjoint || isRealGisaDisjoint || isRealFbDisjoint) {
    throw new Error("Test 3 Failed: ID Disjointness check failed.");
  }
  console.log("Test 3 Passed!");

  // Test 4: Lupos Score (Flesch-Reading-Ease)
  console.log("\n[Test 4] Testing Lupos Score");
  const simpleText = "Das ist ein sehr einfaches und kurzes Beispiel für einen lesbaren Text.";
  const complexText = "Die thermodynamische Reibungskompensation im kybernetischen Regelraum erzwingt eine signifikante Dämpfung des stochastischen Operators.";
  const scoreSimple = calculateLuposScore(simpleText);
  const scoreComplex = calculateLuposScore(complexText);
  console.log(`Simple text Lupos Score: ${scoreSimple}`);
  console.log(`Complex text Lupos Score: ${scoreComplex}`);

  if (scoreSimple <= scoreComplex) {
    throw new Error("Test 4 Failed: Simple text should have a higher readability score than complex academic text.");
  }
  console.log("Test 4 Passed!");

  // Test 5: Cache Stability
  console.log("\n[Test 5] Testing Cache Stability (Idempotency)");
  const cache = new SemanticCache();
  const text1 = "Räumung in Wien und Abtransport von IT-Racks.";
  const text2 = "Räumung in Wien und Abtransport von IT-Racks"; // missing period
  const res1 = runComplianceCheck(text1, "de-AT", "Entrümpelung", false);
  cache.set(text1, res1);

  const cachedRes = cache.get(text2, 2);
  console.log("Text 1 Checked & Cached.");
  console.log("Text 2 (near duplicate) Cache Lookup:", cachedRes ? "HIT (Success)" : "MISS");

  if (!cachedRes) {
    throw new Error("Test 5 Failed: Cache stabilizer did not return hit within epsilon boundary.");
  }
  console.log("Test 5 Passed!");

  // Test 6: Cicero 7Q-Completeness-Check
  console.log("\n[Test 6] Testing Cicero 7Q-Completeness-Check");
  const richText = "Unser Meister-Team der Müller Entrümpelung GmbH bietet heute in Wien schnelle Räumung und Abtransport mit LKW und Festpreis-Garantie an. Besichtigung in 3 Schritten.";
  const ciceroRes = analyzeCicero7Q(richText);
  console.log(`Cicero 7Q Score: ${ciceroRes.score} (${ciceroRes.passedCount}/7 passed)`);
  if (ciceroRes.score < 0.8) {
    throw new Error("Test 6 Failed: Rich text should score >= 0.8 on Cicero 7Q.");
  }
  console.log("Test 6 Passed!");

  // Test 7: Haversine Geo-Distance & Link-Siloing
  console.log("\n[Test 7] Testing Haversine & Link-Siloing Engine");
  const dist = calculateHaversineDistance(48.2082, 16.3738, 48.2067, 16.1756); // Wien -> Purkersdorf
  console.log(`Distance Wien -> Purkersdorf: ${dist} km`);
  if (dist < 10 || dist > 20) {
    throw new Error("Test 7 Failed: Haversine distance between Vienna and Purkersdorf should be ~15km.");
  }
  console.log("Test 7 Passed!");

  // Test 8: Cryptographic Non-Sequential ID Generation (ServiceOS V7.0)
  console.log("\n[Test 8] Testing Cryptographic Non-Sequential ID Generation");
  const idCryptoSO = generateCryptographicId("SO");
  const idCryptoCAS = generateCryptographicId("CAS");
  const idCryptoORD = generateCryptographicId("ORD");

  console.log(`Generated Cryptographic Case Number: ${idCryptoSO}`);
  console.log(`Generated Cryptographic Case ID: ${idCryptoCAS}`);
  console.log(`Generated Cryptographic Order ID: ${idCryptoORD}`);

  if (!idCryptoSO.startsWith("SO-") || !idCryptoCAS.startsWith("CAS-") || !idCryptoORD.startsWith("ORD-")) {
    throw new Error("Test 8 Failed: Cryptographic IDs do not match expected prefix structures.");
  }

  const isDisjointSO = verifyIdDisjointness(idCryptoSO);
  const isDisjointCAS = verifyIdDisjointness(idCryptoCAS);
  const isDisjointORD = verifyIdDisjointness(idCryptoORD);

  if (!isDisjointSO || !isDisjointCAS || !isDisjointORD) {
    throw new Error("Test 8 Failed: Cryptographic IDs failed disjointness verification.");
  }
  console.log("Test 8 Passed!");

  // Test 9: Partner Trust Score & Risk Shield Engine (Etappe 2)
  console.log("\n[Test 9] Testing Partner Trust Score & Risk Shield Engine");
  const samplePartnerGold = {
    id: "COMP-001",
    name: "Müller Entrümpelung GmbH",
    gisa: "GISA-12345678",
    active: true,
    insuranceExpiry: "2027-12-31",
    subcontractors: [{ id: "SUB-001", name: "Sub-Reinigung OG", gisa: "GISA-998877", active: true }]
  };
  const trustGold = calculatePartnerTrustScore(samplePartnerGold);
  console.log(`Gold Partner Score: ${trustGold.score}/100, Level: ${trustGold.level}, Ampel: ${trustGold.trafficLight}`);
  if (trustGold.score < 80 || trustGold.level !== "Premium" && trustGold.level !== "Gold") {
    throw new Error("Test 9 Failed: Fully compliant partner should score >= 80 (Gold/Premium).");
  }

  const samplePartnerLocked = {
    id: "COMP-999",
    name: "Problematic Sub",
    active: false,
    trustOverride: "GESPERRT"
  };
  const trustLocked = calculatePartnerTrustScore(samplePartnerLocked);
  console.log(`Locked Partner Score: ${trustLocked.score}/100, Level: ${trustLocked.level}, Ampel: ${trustLocked.trafficLight}`);
  if (trustLocked.score !== 0 || !trustLocked.trafficLight.includes("Gesperrt")) {
    throw new Error("Test 9 Failed: Locked partner should have score 0 and traffic light 'Gesperrt'.");
  }
  console.log("Test 9 Passed!");

  // Test 10: ATU/UID & GISA Verification Engine (§ 11 UStG Dokumenten-Engine)
  console.log("\n[Test 10] Testing ATU & GISA Verification Engine");
  const validAtu = "ATU12345678";
  const invalidAtu = "DE123456789"; // Not ATU format
  const validGisa = "GISA-12948574";
  const invalidGisa = "XYZ-123";

  const isAtuOk = validateAtuNumber(validAtu);
  const isAtuFail = validateAtuNumber(invalidAtu);
  const isGisaOk = validateGisaNumber(validGisa);
  const isGisaFail = validateGisaNumber(invalidGisa);

  console.log(`Valid ATU ${validAtu}: ${isAtuOk}`);
  console.log(`Invalid ATU ${invalidAtu}: ${!isAtuFail}`);
  console.log(`Valid GISA ${validGisa}: ${isGisaOk}`);
  console.log(`Invalid GISA ${invalidGisa}: ${!isGisaFail}`);

  if (!isAtuOk || isAtuFail || !isGisaOk || isGisaFail) {
    throw new Error("Test 10 Failed: ATU / GISA verification logic failed.");
  }
  console.log("Test 10 Passed!");

  // Test 11: Billing & Provisions-Berechnung (15% Commission Split)
  console.log("\n[Test 11] Testing Billing & Provisions-Berechnung");
  const grossTest = 1000.00;
  const calcRes = calculateCommissionAndPayout(grossTest, 15);
  console.log(`Gross: € ${calcRes.gross}, Commission (15%): € ${calcRes.commission}, Partner Payout: € ${calcRes.partnerPayout}`);

  if (calcRes.commission !== 150.00 || calcRes.partnerPayout !== 850.00) {
    throw new Error("Test 11 Failed: Commission split logic incorrect.");
  }
  console.log("Test 11 Passed!");

  // Test 12: Audit Cryptographic Hash Chain & Tamper Verification (Etappe 5)
  console.log("\n[Test 12] Testing Audit Cryptographic Hash Chain & Tamper Verification");
  const t1 = "2026-07-23T01:00:00Z";
  const t2 = "2026-07-23T01:05:00Z";
  const h1 = generateAuditHash("GENESIS", t1, "Admin", "ORDER_CREATED", "Order ORD-123");
  const h2 = generateAuditHash(h1, t2, "Superadmin", "PARTNER_UPDATED", "Partner COMP-001");

  const validAuditChain = [
    { timestamp: t2, user: "Superadmin", role: "Superadmin", action: "PARTNER_UPDATED", details: "Partner COMP-001", previousHash: h1, hash: h2 },
    { timestamp: t1, user: "Admin", role: "Admin", action: "ORDER_CREATED", details: "Order ORD-123", previousHash: "GENESIS", hash: h1 }
  ];

  const integrityValid = verifyAuditTrailIntegrity(validAuditChain);
  console.log("Valid Audit Chain Integrity Check:", integrityValid.isValid ? "VALID ✓" : "CORRUPTED ✕");

  const tamperedAuditChain = [
    { timestamp: t2, user: "Superadmin", role: "Superadmin", action: "PARTNER_UPDATED", details: "Tampered details!", previousHash: h1, hash: h2 },
    { timestamp: t1, user: "Admin", role: "Admin", action: "ORDER_CREATED", details: "Order ORD-123", previousHash: "GENESIS", hash: h1 }
  ];

  const integrityTampered = verifyAuditTrailIntegrity(tamperedAuditChain);
  console.log("Tampered Audit Chain Integrity Check:", integrityTampered.isValid ? "VALID ✕" : "CORRUPTED (Expected) ✓");

  if (!integrityValid.isValid || integrityTampered.isValid) {
    throw new Error("Test 12 Failed: Cryptographic audit integrity verification failed.");
  }
  console.log("Test 12 Passed!");

  // Test 13: KI-Orchestrator Agent Dispatching & Prompt-Hierarchie Stack (Stufe 4)
  console.log("\n[Test 13] Testing KI-Orchestrator Agent Dispatching & Prompt-Hierarchie Stack");
  const promptStack = evaluatePromptStack();
  console.log(`Prompt-Hierarchie Stack valid: ${promptStack.valid}, Ebenen: ${promptStack.levelsCount}`);

  const selfCorrRes = runAiSelfCorrection();
  console.log(`AI Self-Correction executed successfully. Agenten verifiziert: ${selfCorrRes.agentsCount}`);

  if (!promptStack.valid || promptStack.levelsCount !== 7 || !selfCorrRes.success || selfCorrRes.agentsCount < 5) {
    throw new Error("Test 13 Failed: KI-Orchestrator evaluation failed.");
  }
  console.log("Test 13 Passed!");

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests();
