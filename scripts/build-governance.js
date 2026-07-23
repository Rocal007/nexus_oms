const fs = require('fs');
const path = require('path');

function parseFrontmatter(fileContent) {
  const parts = fileContent.split('---');
  if (parts.length < 3) return { frontmatter: {}, body: fileContent };
  const yamlText = parts[1];
  const body = parts.slice(2).join('---').trim();
  const frontmatter = {};
  
  const lines = yamlText.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    // Check if it's an array item under active array
    if (line.startsWith('-') && currentKey) {
      const val = line.substring(1).trim().replace(/^['"]|['"]$/g, '');
      if (currentArray) {
        currentArray.push(val);
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.substring(0, colonIdx).trim();
    let val = line.substring(colonIdx + 1).trim();

    if (val.startsWith('[') && val.endsWith(']')) {
      // In-line array: [ "A", "B" ]
      frontmatter[key] = val.substring(1, val.length - 1)
        .split(',')
        .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(v => v);
      currentKey = null;
      currentArray = null;
    } else if (val === '') {
      // Start of multi-line array or object list
      frontmatter[key] = [];
      currentKey = key;
      currentArray = frontmatter[key];
    } else {
      // Simple value
      frontmatter[key] = val.replace(/^['"]|['"]$/g, '');
      currentKey = null;
      currentArray = null;
    }
  }

  return { frontmatter, body };
}

function compile() {
  console.log('Compiling Governance Knowledge Objects...');
  const govDir = path.join(__dirname, '..', 'governance');
  const compiledDir = path.join(govDir, 'compiled');
  if (!fs.existsSync(compiledDir)) {
    fs.mkdirSync(compiledDir, { recursive: true });
  }

  const db = {
    version: '3.0.0',
    principles: [],
    rules: [],
    workflows: [],
    checklists: [],
    decision_models: [],
    glossary: []
  };

  // 1. Principles
  const principlesDir = path.join(govDir, 'principles');
  if (fs.existsSync(principlesDir)) {
    fs.readdirSync(principlesDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(principlesDir, file), 'utf8');
        db.principles.push({
          filename: file,
          content: content
        });
      }
    });
  }

  // 2. Rules
  const rulesDir = path.join(govDir, 'rules');
  if (fs.existsSync(rulesDir)) {
    fs.readdirSync(rulesDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
        const { frontmatter } = parseFrontmatter(content);
        db.rules.push({
          id: frontmatter.id,
          name: frontmatter.name,
          version: frontmatter.version,
          status: frontmatter.status,
          normative_level: frontmatter.normative_level,
          priority: frontmatter.priority,
          owner: frontmatter.owner,
          purpose: frontmatter.purpose,
          statement: frontmatter.statement,
          rationale: frontmatter.rationale,
          scope: frontmatter.scope,
          validation: frontmatter.validation,
          violations: frontmatter.violations,
          dependencies: frontmatter.dependencies || []
        });
      }
    });
    // Sort rules by ID
    db.rules.sort((a, b) => a.id.localeCompare(b.id));
  }

  // 3. Workflows
  const workflowsDir = path.join(govDir, 'workflows');
  if (fs.existsSync(workflowsDir)) {
    fs.readdirSync(workflowsDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
        const { frontmatter } = parseFrontmatter(content);
        db.workflows.push({
          id: frontmatter.id,
          name: frontmatter.name,
          version: frontmatter.version,
          status: frontmatter.status,
          steps: frontmatter.steps || [],
          inputs: frontmatter.inputs || [],
          outputs: frontmatter.outputs || [],
          rules_used: frontmatter.rules_used || []
        });
      }
    });
    db.workflows.sort((a, b) => a.id.localeCompare(b.id));
  }

  // 4. Checklists
  const checklistsDir = path.join(govDir, 'checklists');
  if (fs.existsSync(checklistsDir)) {
    fs.readdirSync(checklistsDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(checklistsDir, file), 'utf8');
        const { frontmatter } = parseFrontmatter(content);
        db.checklists.push({
          id: frontmatter.id,
          name: frontmatter.name,
          version: frontmatter.version,
          status: frontmatter.status,
          items: frontmatter.items || []
        });
      }
    });
    db.checklists.sort((a, b) => a.id.localeCompare(b.id));
  }

  // 5. Decision Models
  const decisionDir = path.join(govDir, 'decision_models');
  if (fs.existsSync(decisionDir)) {
    fs.readdirSync(decisionDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(decisionDir, file), 'utf8');
        const { frontmatter, body } = parseFrontmatter(content);
        db.decision_models.push({
          id: frontmatter.id,
          name: frontmatter.name,
          version: frontmatter.version,
          status: frontmatter.status,
          description: frontmatter.description || body,
          inputs: frontmatter.inputs || [],
          outputs: frontmatter.outputs || []
        });
      }
    });
    db.decision_models.sort((a, b) => a.id.localeCompare(b.id));
  }

  // 6. Glossary
  const glossaryDir = path.join(govDir, 'glossary');
  if (fs.existsSync(glossaryDir)) {
    fs.readdirSync(glossaryDir).forEach(file => {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(glossaryDir, file), 'utf8');
        const { frontmatter } = parseFrontmatter(content);
        if (frontmatter.terms) {
          db.glossary.push({
            terms: frontmatter.terms
          });
        }
      }
    });
  }

  // If glossary is empty, fallback to basic terms mapping
  if (db.glossary.length === 0) {
    db.glossary.push({
      terms: [
        { term: 'DECORUM', definition: 'Radikaler Sachlichkeits- und Legalitätsfilter.' },
        { term: 'LINGUA-LOCA', definition: 'Geozentrische Sprach- und Vokabeladaption.' },
        { term: 'LUDUS', definition: 'Emotionsbasiertes UX-Routing und Gamification.' },
        { term: 'FACTORIUM', definition: 'Dienst zur deterministischen statischen Generierung von Zero-JS HTML.' },
        { term: 'VISIUM', definition: 'Styling- und Asset-Composition-Engine nach 60-30-10 Regel.' },
        { term: 'AXIOM', definition: 'Lokale Daten-Engine mit SQLite-Anbindung.' }
      ]
    });
  }

  const outPath = path.join(compiledDir, 'aod.json');
  fs.writeFileSync(outPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Successfully compiled to ${outPath}`);
}

compile();
