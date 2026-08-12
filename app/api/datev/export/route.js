import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const invoice = await request.json();
    if (!invoice || !invoice.invoice_number) {
      return NextResponse.json({ error: 'Ungültige Rechnungsdaten.' }, { status: 400 });
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<invoice_export xmlns="http://xml.datev.de/bedi/tps/invoice/v010">
  <header>
    <generator_info>NEXUS-OMS-CraftCore-Backend</generator_info>
    <created_date>${new Date().toISOString()}</created_date>
  </header>
  <invoice>
    <invoice_number>${invoice.invoice_number}</invoice_number>
    <document_type>${invoice.document_type === 'invoice' ? 'Rechnung' : 'Gutschrift'}</document_type>
    <date>${invoice.date}</date>
    <client>
      <name>${invoice.client_name}</name>
      <email>${invoice.client_email}</email>
    </client>
    <totals>
      <subtotal>${invoice.subtotal ? Number(invoice.subtotal).toFixed(2) : '0.00'}</subtotal>
      <tax_amount>${invoice.tax_amount ? Number(invoice.tax_amount).toFixed(2) : '0.00'}</tax_amount>
      <total>${invoice.total_amount ? Number(invoice.total_amount).toFixed(2) : '0.00'}</total>
    </totals>
    <integrity_hash>${invoice.cryptographic_hash || ''}</integrity_hash>
  </invoice>
</invoice_export>`;

    return new Response(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="DATEV_Export_${invoice.invoice_number}.xml"`
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
