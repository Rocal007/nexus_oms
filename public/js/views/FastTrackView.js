/**
 * FastTrackView.js — Mobile-optimised field view for craftsmen.
 * Features Web Speech API voice capture, local/hybrid parsing, and touch signature canvas.
 * Strictest compliance with VFB-System-Modell (gehirngerecht, zero-friction).
 */
import { BaseView } from './BaseView.js';
import { ce } from '../utils/DOMHelper.js';
import { toast } from './ToastView.js';

export class FastTrackView extends BaseView {
  constructor(container) {
    super(container);
    this._onInvoiceCreated = null;
    this._recognition = null;
    this._isRecording = false;
    this._signaturePad = null;
    this._ctx = null;
    this._isDrawing = false;
    
    // Extracted items list
    this._items = [];
  }

  /**
   * @param {{ activeCompany: any, partners: any[] }} data
   */
  render({ activeCompany, partners }) {
    const wrapper = ce('div', {});

    // Header
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Fast-Track Baustelle' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'MOBILE::FIELD_FAST_INVOICE' }),
      ])
    ]);

    const containerGrid = ce('div', {
      className: 'fast-track-grid',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 1fr',
      'style.gap': 'var(--spacing-lg)',
      'style.marginTop': 'var(--spacing-md)'
    });

    // ── Spalte 1: Spracherfassung & Positionen ─────────────────────
    const leftPanel = ce('div', { className: 'panel', 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': 'var(--spacing-md)' }, [
      ce('h2', { className: 'panel__title', textContent: '🎙️ Sprachnotiz erfassen' }),
      ce('p', { 
        className: 'panel__desc', 
        textContent: 'Sprechen Sie den Text ein. Beispiel: "Neues Angebot für Herr Müller: 20 Quadratmeter Fliesen verlegen, 3 Stunden Arbeit"' 
      }),
      ce('div', { 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)' }, [
        ce('button', {
          className: 'btn btn--primary',
          type: 'button',
          id: 'btn-record',
          textContent: '🎤 Aufnahme starten',
          'style.background': 'var(--accent-red)'
        }),
        ce('button', {
          className: 'btn btn--secondary',
          type: 'button',
          id: 'btn-parse-text',
          textContent: '🤖 GAEB Strukturieren',
          'style.background': 'var(--accent-cyan)'
        })
      ]),
      ce('textarea', {
        id: 'voice-text-output',
        className: 'form__control',
        rows: '4',
        placeholder: 'Gesprochener Text erscheint hier...',
        'style.resize': 'vertical'
      }),
      ce('hr', { 'style.border': '0', 'style.borderTop': '1px solid rgba(255,255,255,0.05)' }),
      ce('h3', { className: 'panel__title', textContent: 'Generierte Leistungspositionen', 'style.fontSize': 'var(--font-md)' }),
      ce('div', { id: 'parsed-items-list', 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': 'var(--spacing-sm)' })
    ]);

    // ── Spalte 2: Unterschrift & Rechnung abschließen ───────────────
    const rightPanel = ce('div', { className: 'panel', 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': 'var(--spacing-md)' }, [
      ce('h2', { className: 'panel__title', textContent: '✍️ Digitale Signatur' }),
      ce('p', { className: 'panel__desc', textContent: 'Kunde unterschreibt direkt auf dem Touchscreen.' }),
      ce('div', { 
        'style.border': '1px solid rgba(255,255,255,0.1)', 
        'style.background': '#FFF', 
        'style.borderRadius': 'var(--border-radius)', 
        'style.overflow': 'hidden',
        'style.height': '180px',
        'style.position': 'relative'
      }, [
        ce('canvas', {
          id: 'signature-canvas',
          width: '450',
          height: '180',
          'style.width': '100%',
          'style.height': '100%',
          'style.cursor': 'crosshair'
        })
      ]),
      ce('div', { 'style.display': 'flex', 'style.justifyContent': 'flex-end' }, [
        ce('button', {
          className: 'btn btn--secondary btn--sm',
          type: 'button',
          id: 'btn-clear-sig',
          textContent: '🧹 Signatur löschen'
        })
      ]),
      ce('hr', { 'style.border': '0', 'style.borderTop': '1px solid rgba(255,255,255,0.05)' }),
      ce('h3', { className: 'panel__title', textContent: 'Kunden- & Zuweisungsdaten', 'style.fontSize': 'var(--font-md)' }),
      this._buildField('Kundenname', ce('input', {
        type: 'text',
        id: 'client-name',
        className: 'form__control',
        placeholder: 'Musterkunde'
      })),
      this._buildField('Zugeordneter Partner (optional)', ce('select', {
        id: 'assigned-partner',
        className: 'form__control'
      }, [
        ce('option', { value: '', textContent: '— Kein Partner (Eigenleistung) —' }),
        ...partners.map(p => ce('option', { value: String(p.id), textContent: p.name }))
      ])),
      ce('button', {
        className: 'btn btn--primary',
        type: 'button',
        id: 'btn-finalize-fast',
        textContent: '⛓️ Unterschreiben & GoBD-Rechnung erstellen',
        'style.background': 'var(--accent-teal)',
        'style.width': '100%',
        'style.marginTop': 'var(--spacing-sm)'
      })
    ]);

    containerGrid.append(leftPanel, rightPanel);
    wrapper.append(header, containerGrid);

    this.container.append(wrapper);
    this.el = wrapper;

    this._initSpeechRecognition();
    this._initCanvas();
    this._setupListeners(activeCompany);
    this._renderItems();

    return wrapper;
  }

  _buildField(label, input) {
    return ce('div', { className: 'form__group', 'style.marginBottom': '4px' }, [
      ce('label', { className: 'form__label', textContent: label, 'style.fontSize': '12px' }),
      input
    ]);
  }

  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.show('Spracherkennung in diesem Browser nicht unterstützt. Bitte tippen Sie den Text manuell ein.', 'warning');
      return;
    }

    this._recognition = new SpeechRecognition();
    this._recognition.lang = 'de-DE';
    this._recognition.continuous = false;
    this._recognition.interimResults = false;

    this._recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const output = this.el.querySelector('#voice-text-output');
      output.value = (output.value + ' ' + text).trim();
      toast.show('Sprachnotiz erfolgreich erfasst.', 'success');
      this._toggleRecordingState(false);
    };

    this._recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.show(`Spracherkennungsfehler: ${event.error}`, 'error');
      this._toggleRecordingState(false);
    };

    this._recognition.onend = () => {
      this._toggleRecordingState(false);
    };
  }

  _toggleRecordingState(isRec) {
    this._isRecording = isRec;
    const btn = this.el.querySelector('#btn-record');
    if (this._isRecording) {
      btn.textContent = '⏹️ Aufnahme stoppen';
      btn.style.background = '#4B5563'; // Gray
    } else {
      btn.textContent = '🎤 Aufnahme starten';
      btn.style.background = 'var(--accent-red)';
    }
  }

  _initCanvas() {
    const canvas = this.el.querySelector('#signature-canvas');
    this._ctx = canvas.getContext('2d');
    
    // Configure lines
    this._ctx.strokeStyle = '#000000';
    this._ctx.lineWidth = 2;
    this._ctx.lineCap = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      // Handle touch vs mouse
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const startDrawing = (e) => {
      e.preventDefault();
      this._isDrawing = true;
      const pos = getPos(e);
      this._ctx.beginPath();
      this._ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this._isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this._ctx.lineTo(pos.x, pos.y);
      this._ctx.stroke();
    };

    const stopDrawing = () => {
      this._isDrawing = false;
    };

    // Mouse listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch listeners
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
  }

  _setupListeners(activeCompany) {
    const btnRecord = this.el.querySelector('#btn-record');
    const btnParse = this.el.querySelector('#btn-parse-text');
    const btnClear = this.el.querySelector('#btn-clear-sig');
    const btnFinalize = this.el.querySelector('#btn-finalize-fast');

    btnRecord.addEventListener('click', () => {
      if (!this._recognition) {
        toast.show('Spracherkennung nicht initialisiert.', 'error');
        return;
      }
      if (this._isRecording) {
        this._recognition.stop();
      } else {
        this._recognition.start();
        this._toggleRecordingState(true);
      }
    });

    // Offline-capable NLP parser
    btnParse.addEventListener('click', async () => {
      const text = this.el.querySelector('#voice-text-output').value.trim();
      if (!text) {
        toast.show('Bitte sprechen oder tippen Sie zuerst einen Erfassungstext.', 'warning');
        return;
      }

      toast.show('Analysiere Erfassungstext...', 'info');

      // Local Regex Parser (Offline capability)
      const parsedItems = [];
      
      // Parse customer name if mentioned (e.g. "für Herr Müller", "für Firma Müller")
      const nameMatch = text.match(/(?:für\s+(?:Herrn?|Frau|Firma)\s+)([A-ZÄÖÜ][a-zäöüß]+)/i);
      if (nameMatch) {
        this.el.querySelector('#client-name').value = nameMatch[1];
      }

      // Regex matching combinations of numbers and German units
      // z.B. "20 Quadratmeter Fliesen verlegen" / "3 Stunden Arbeit" / "15 Meter Rohr"
      const itemRegex = /(\d+)\s*(qm|m2|quadratmeter|stk|stück|meter|m|std|stunden|stunde)\s*([a-zA-ZäöüßÄÖÜß\s\-]{4,30})/gi;
      let match;
      while ((match = itemRegex.exec(text)) !== null) {
        const qty = Number(match[1]);
        let unit = match[2].toLowerCase();
        let title = match[3].trim();

        // Standardize units
        if (unit.startsWith('quadrat') || unit === 'm2') unit = 'm²';
        if (unit.startsWith('st')) unit = 'Std';
        if (unit.startsWith('stü') || unit === 'stk') unit = 'Stk';
        if (unit === 'm') unit = 'Meter';

        // Estimate price based on keywords
        let price = 50.0; // default standard labor rate
        if (title.includes('Fliesen')) price = 45.0;
        if (title.includes('Rohr') || title.includes('Kupfer')) price = 25.0;

        parsedItems.push({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          quantity: qty,
          unit: unit,
          price: price
        });
      }

      // Fallback if no patterns matched
      if (parsedItems.length === 0) {
        parsedItems.push({
          title: text.length > 50 ? text.slice(0, 50) + '...' : text,
          quantity: 1,
          unit: 'Stk',
          price: 150.00
        });
      }

      this._items = parsedItems;
      this._renderItems();
      toast.show(`${this._items.length} Positionen erfolgreich strukturiert.`, 'success');
    });

    btnClear.addEventListener('click', () => {
      const canvas = this.el.querySelector('#signature-canvas');
      this._ctx.clearRect(0, 0, canvas.width, canvas.height);
      toast.show('Signatur gelöscht.', 'info');
    });

    btnFinalize.addEventListener('click', () => {
      const clientName = this.el.querySelector('#client-name').value.trim();
      const canvas = this.el.querySelector('#signature-canvas');
      
      if (!clientName) {
        toast.show('Bitte geben Sie einen Kundennamen ein.', 'warning');
        return;
      }
      if (this._items.length === 0) {
        toast.show('Bitte fügen Sie mindestens eine Leistungsposition hinzu.', 'warning');
        return;
      }

      // Check if signature canvas is blank (basic check)
      const buffer = new Uint32Array(this._ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      const isBlank = !buffer.some(color => color !== 0);
      if (isBlank) {
        toast.show('Bitte lassen Sie den Kunden auf dem Signatur-Widget unterschreiben.', 'warning');
        return;
      }

      const signatureData = canvas.toDataURL('image/png');
      const partnerVal = this.el.querySelector('#assigned-partner').value;
      const partnerId = partnerVal ? Number(partnerVal) : null;

      const invoiceData = {
        company_id: activeCompany.id,
        partner_id: partnerId,
        client_name: clientName,
        client_email: 'office@handwerker-portal.at', // Default placeholder
        items: this._items,
        signature_data: signatureData
      };

      this._onInvoiceCreated?.(invoiceData);
    });
  }

  _renderItems() {
    const listEl = this.el.querySelector('#parsed-items-list');
    listEl.innerHTML = '';

    if (this._items.length === 0) {
      listEl.innerHTML = '<div style="opacity:0.4; font-size:12px; padding:var(--spacing-sm); text-align:center;">Noch keine Positionen erfasst.</div>';
      return;
    }

    this._items.forEach((item, index) => {
      const row = ce('div', {
        className: 'pipeline-card',
        'style.display': 'grid',
        'style.gridTemplateColumns': '3fr 1fr 1.2fr 1fr 40px',
        'style.gap': 'var(--spacing-xs)',
        'style.alignItems': 'center',
        'style.padding': 'var(--spacing-xs)',
        'style.background': 'rgba(255,255,255,0.02)'
      }, [
        ce('input', {
          type: 'text',
          className: 'form__control',
          value: item.title,
          'style.fontSize': '12px',
          'style.padding': '4px'
        }, [], [
          row.addEventListener('change', (e) => {
            if (e.target.type === 'text') this._items[index].title = e.target.value;
          })
        ]),
        ce('input', {
          type: 'number',
          className: 'form__control',
          value: item.quantity,
          'style.fontSize': '12px',
          'style.padding': '4px'
        }, [], [
          row.addEventListener('change', (e) => {
            if (e.target.type === 'number' && e.target.placeholder === '') this._items[index].quantity = Number(e.target.value);
          })
        ]),
        ce('input', {
          type: 'text',
          className: 'form__control',
          value: item.unit,
          'style.fontSize': '12px',
          'style.padding': '4px'
        }, [], [
          row.addEventListener('change', (e) => {
            if (e.target.placeholder === 'std') this._items[index].unit = e.target.value;
          })
        ]),
        ce('input', {
          type: 'number',
          className: 'form__control',
          value: item.price,
          'style.fontSize': '12px',
          'style.padding': '4px'
        }, [], [
          row.addEventListener('change', (e) => {
            if (e.target.type === 'number') this._items[index].price = Number(e.target.value);
          })
        ]),
        ce('button', {
          className: 'btn btn--danger',
          type: 'button',
          textContent: '🗑️',
          'style.padding': '4px',
          'style.fontSize': '12px'
        }, [], [
          row.addEventListener('click', (e) => {
            if (e.target.textContent === '🗑️') {
              this._items.splice(index, 1);
              this._renderItems();
            }
          })
        ])
      ]);

      listEl.append(row);
    });
  }

  onInvoiceCreated(fn) { this._onInvoiceCreated = fn; }
}
