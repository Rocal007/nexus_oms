const http = require('http');

function get(url) {
  return new Promise((res, rej) => {
    http.get(url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

async function main() {
  // Warte bis Poll fertig
  let health;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    health = await get('http://localhost:5100/api/health');
    if (health.lastPoll) break;
  }
  console.log('Health:', JSON.stringify(health));

  const emails = await get('http://localhost:5100/api/emails/pending');
  console.log(`\nGesamt: ${emails.length} Mails`);
  console.log('--- Telefonnummern ---');
  let found = 0;
  for (const e of emails) {
    if (e.customerPhone) {
      found++;
      console.log(`UID ${e.uid}: ${e.customerPhone} | ${e.customerEmail || e.from}`);
    }
  }
  console.log(`\n${found} von ${emails.length} Mails haben eine Telefonnummer.`);
}
main().catch(console.error);
