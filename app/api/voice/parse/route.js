import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text fehlt.' }, { status: 400 });
    }

    const items = [];
    const clientNameMatch = text.match(/(?:für\s+(?:Herrn?|Frau|Firma)\s+)([A-ZÄÖÜ][a-zäöüß]+)/i);
    const clientName = clientNameMatch ? clientNameMatch[1] : '';

    // Regex parsing matching quantity, unit and description
    const regex = /(\d+)\s*(qm|m2|quadratmeter|stk|stück|meter|m|std|stunden|stunde)\s*([a-zA-ZäöüßÄÖÜß\s\-]{4,30})/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const qty = Number(match[1]);
      let unit = match[2].toLowerCase();
      let title = match[3].trim();

      if (unit.startsWith('quadrat') || unit === 'm2') unit = 'm²';
      if (unit.startsWith('st') || unit === 'std') unit = 'Std';
      if (unit.startsWith('stü') || unit === 'stk') unit = 'Stk';
      if (unit === 'm') unit = 'Meter';

      let price = 50.0;
      if (title.includes('Fliesen')) price = 45.00;
      if (title.includes('Rohr') || title.includes('Kupfer')) price = 25.00;
      if (title.includes('Trockenbau')) price = 65.00;

      items.push({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        quantity: qty,
        unit: unit,
        price: price
      });
    }

    if (items.length === 0) {
      items.push({
        title: text.length > 50 ? text.slice(0, 50) + '...' : text,
        quantity: 1,
        unit: 'Stk',
        price: 150.0
      });
    }

    return NextResponse.json({ ok: true, clientName, items });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
