/**
 * CompanyView.js — Multi-Firm context manager UI.
 * 
 * **Felder & Layout:** Zu jedem Standort-Eintrag wurden die direkten Kommunikationswege hinzugefügt und strukturiert:
 * - **Eigene Zeile für Standort-Kontakte:** Ein zweispaltiges Grid für Telefon (Standort) (`loc_phone`) und E-Mail (Standort) (`loc_email`).
 * - **Verschachtelte Liste von Ansprechpartnern:** Ein Bereich `👥 Ansprechpartner (Kontakte)` mit einer unbegrenzten Anzahl an Ansprechpartnern. Zu jedem Ansprechpartner können erfasst werden:
 *   - **Name** (`loc_contact_name`)
 *   - **Position** (`loc_contact_position`, z.B. Leiter, Werkstattleiter)
 *   - **Telefon** (`loc_contact_phone`)
 *   - **E-Mail** (`loc_contact_email`)
 * - **Automatischer Live-Sync mit "Kontaktkanäle":**
 *   - Sobald ein Standort-Telefon, Standort-E-Mail oder ein Ansprechpartner erfasst oder editiert wird, synchronisiert das UI diese Daten in Echtzeit in den Reiter **"Kontaktkanäle"** (`📞 Kontaktkanäle`).
 *   - Synchronisierte Kontakte werden dort als schreibgeschützte Felder mit einem Kettenglied-Symbol (`🔗`) und spezifischer Beschriftung (z.B. `Max Muster (Leiter - Lager Wien)`) dargestellt, um Doppeleingaben zu vermeiden.
 *   - Die Datenkonsistenz bleibt gewahrt, da die synchronisierten Datensätze beim Speichern aus der Hauptliste gefiltert werden und rein über die `locations`-Struktur in der Datenbank persistiert werden.
 *
 * Handles company switching, editing, and creating new companies in a modal overlay.
 * Uses tab-based navigation inside the Modal to minimize visual clutter.
 * Supports all national registers for AT, DE, CH and International Kennzeichen.
 * Registers are collapsible to ensure optimal visual order and reduce cognitive overhead.
 * Supports multiple representatives with role/position selection (GF, Prokura, Vorstand, etc.).
 * Supports multiple certifications & licences with regional directory links (WKO, Handwerkskammer, Zefix).
 * Supports Founded date/year, and a dedicated Mitarbeiter tab managing dynamic Employees & Helpers lists.
 * Imports complete list of Trades / Industries for AT, DE, and CH from data module.
 */
import { BaseView } from './BaseView.js';
import { ce } from '../utils/DOMHelper.js';
import { toast } from './ToastView.js';
import { TRADES_DB } from '../data/trades_db.js?v=49';
import { PartnerModel } from '../models/PartnerModel.js';
import { OrderModel } from '../models/OrderModel.js';
import { InvoiceModel } from '../models/InvoiceModel.js';
import { CustomerModel } from '../models/CustomerModel.js';
import { OtherContactModel } from '../models/OtherContactModel.js';

export class CompanyView extends BaseView {
  constructor(container) {
    super(container);
    this._onSwitch = null;
    this._onSave = null;
    this._onDelete = null;
    this._modal = null;
    this._resetTabs = null;
    this._expanders = [];
    this._addressBookSearchQuery = '';
    this._addressBookActiveTab = 'own';

    // State for interactive trades picker
    this._selectedTrades = new Set();
    this._typedQualifications = new Map();
    this._activeTradesCountry = 'AT';
    this._tradesSearchInput = null;
    this._selectedTagsContainer = null;
    this._tradesContainer = null;
    this._subTabBtns = {};
  }

  /**
   * @param {{ companies: import('../models/CompanyModel.js').Company[], activeId: number }} data
   */
  render({ companies, activeId }) {
    const wrapper = ce('div', {});

    // Header
    const newBtn = ce('button', {
      className: 'btn btn--primary',
      type: 'button',
      textContent: '＋ Neuen Betrieb anlegen'
    });

    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Betriebsverwaltung' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'HOLDING::MULTITENANCY_ROUTING' }),
      ]),
      ce('div', { className: 'page-header__actions' }, [newBtn])
    ]);

    // ── Spalte 1: Firmenliste (Vertikale Liste - Untereinander) ───────
    const listPanel = ce('div', { 
      className: 'panel',
      'style.marginTop': '32px'
    }, [
      ce('h2', { className: 'panel__title', textContent: 'Registrierte Betriebe (Multi-Firm)' }),
      ce('p', { 
        className: 'panel__desc', 
        textContent: 'Wählen Sie einen Betrieb aus, um den Arbeitskontext zu wechseln, oder bearbeiten Sie die Firmendetails.',
        'style.marginBottom': '48px'
      })
    ]);

    const listEl = ce('div', { 
      className: 'company-list', 
      'style.display': 'flex', 
      'style.flexDirection': 'column',
      'style.gap': '28px',
      'style.maxHeight': 'calc(100vh - 280px)',
      'style.overflowY': 'auto',
      'style.padding': '4px 8px 16px 4px'
    });
    
    companies.forEach(company => {
      const isActive = company.id === activeId;
      const card = ce('div', {
        className: `pipeline-card${isActive ? ' pipeline-card--active' : ''}`,
        'style.borderColor': isActive ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.05)',
        'style.borderWidth': '2px',
        'style.borderStyle': 'solid',
        'style.padding': 'var(--spacing-md)',
        'style.borderRadius': 'var(--border-radius)',
        'style.background': isActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': 'var(--spacing-md)'
      });

      // Find main location
      const mainLoc = (company.locations || []).find(l => l.type === 'main') || (company.locations || [])[0] || null;
      const secondaryLocs = (company.locations || []).filter(l => l !== mainLoc);

      // Top Row (Name & Rechtsform & Status & Actions)
      const topRow = ce('div', { 
        'style.display': 'flex', 
        'style.justifyContent': 'space-between',
        'style.alignItems': 'center',
        'style.borderBottom': '1px solid rgba(255,255,255,0.05)',
        'style.paddingBottom': '12px'
      }, [
        ce('div', {}, [
          ce('div', { 
            'style.display': 'flex', 
            'style.alignItems': 'center', 
            'style.gap': '12px'
          }, [
            ce('div', { 
              className: 'pipeline-card__title', 
              textContent: company.name,
              'style.fontWeight': '700',
              'style.fontSize': 'var(--font-lg)'
            }),
            company.legal_form ? ce('span', {
              className: 'badge',
              textContent: company.legal_form,
              'style.background': 'rgba(255, 255, 255, 0.08)',
              'style.color': 'var(--text-dim)',
              'style.padding': '3px 8px',
              'style.fontSize': '11px',
              'style.borderRadius': '4px',
              'style.border': '1px solid rgba(255, 255, 255, 0.1)',
              'style.fontWeight': '600'
            }) : null
          ]),
          ce('div', { 
            textContent: `${(company.industries || []).join(', ') || 'Kein Gewerk'}`,
            'style.opacity': '0.9',
            'style.color': 'var(--accent-cyan)',
            'style.fontSize': 'var(--font-sm)',
            'style.marginTop': '4px',
            'style.fontWeight': '500'
          })
        ]),
        ce('div', { 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)', 'style.alignItems': 'center' }, [
          isActive ? ce('span', {
            className: 'badge badge--active',
            textContent: 'Aktiv',
            'style.padding': '6px 12px',
            'style.marginRight': '8px'
          }) : ce('button', {
            className: 'btn btn--primary btn--sm',
            type: 'button',
            textContent: '🔌 Aktivieren',
            'style.background': 'var(--accent-teal)'
          }),
          ce('button', {
            className: 'btn btn--secondary btn--sm',
            type: 'button',
            textContent: '✏️ Bearbeiten'
          })
        ])
      ]);

      // Wire topRow click events
      const actBtn = topRow.querySelector('.btn--primary');
      if (actBtn) {
        actBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._onSwitch?.(company.id);
        });
      }
      const edBtn = topRow.querySelector('.btn--secondary');
      if (edBtn) {
        edBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._fillForm(company);
        });
      }

      // Gather populated register items to display on company card
      const regItems = [];
      if (company.at_fn) regItems.push(`FN: ${company.at_fn}`);
      if (company.at_gisa) regItems.push(`GISA: ${company.at_gisa}`);
      if (company.at_tax_number) regItems.push(`St.-Nr. (AT): ${company.at_tax_number}`);
      if (company.at_gln) regItems.push(`GLN: ${company.at_gln}`);
      if (company.at_ersb) regItems.push(`ERsB: ${company.at_ersb}`);
      if (company.de_hr) regItems.push(`HR: ${company.de_hr}`);
      if (company.de_tax_number) regItems.push(`St.-Nr. (DE): ${company.de_tax_number}`);
      if (company.de_widnr) regItems.push(`W-IdNr. (DE): ${company.de_widnr}`);
      if (company.ch_che) regItems.push(`CHE-UID: ${company.ch_che}`);
      if (company.ch_mwst) regItems.push(`MWST-Nr. (CH): ${company.ch_mwst}`);
      if (company.vat_id) regItems.push(`UID/USt-IdNr.: ${company.vat_id}`);
      if (company.intl_eori) regItems.push(`EORI: ${company.intl_eori}`);
      if (company.intl_lei) regItems.push(`LEI: ${company.intl_lei}`);
      if (company.intl_oss_ioss) regItems.push(`OSS/IOSS: ${company.intl_oss_ioss}`);

      // Details Columns Grid
      const detailsGrid = ce('div', {
        'style.display': 'grid',
        'style.gridTemplateColumns': 'repeat(auto-fit, minmax(280px, 1fr))',
        'style.gap': '20px',
        'style.fontSize': '12px',
        'style.opacity': '0.85'
      }, [
        // Spalte A: Stammdaten & Standorte
        ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '4px' }, [
          ce('div', { 'style.fontWeight': '600', 'style.color': 'var(--text-dim)', 'style.marginBottom': '4px', textContent: '📍 Standorte & Register:' }),
          ce('div', { 
            textContent: mainLoc 
              ? `🏠 Hauptsitz: ${mainLoc.name} (${mainLoc.street}, ${mainLoc.zip} ${mainLoc.city}, ${mainLoc.country})`
              : '❌ Kein Hauptstandort hinterlegt'
          }),
          secondaryLocs.length > 0 ? ce('div', { 
            textContent: `🏢 Nebenstandorte: ${secondaryLocs.map(l => `${l.name} (${l.city})`).join(', ')}`,
            'style.fontSize': '11px',
            'style.opacity': '0.8',
            'style.marginTop': '2px'
          }) : null,
          ce('div', { textContent: `👤 Geschäftsführer: ${company.managing_director || 'Nicht angegeben'}`, 'style.marginTop': '4px' }),
          
          // Founded & Staff info (Clickable names link to employees view)
          ce('div', { 
            'style.marginTop': '8px', 
            'style.fontSize': '11px', 
            'style.background': 'rgba(255,255,255,0.02)',
            'style.padding': '8px 12px',
            'style.borderRadius': 'var(--border-radius)',
            'style.border': '1px solid rgba(255,255,255,0.04)',
            'style.lineHeight': '1.5'
          }, [
            ce('div', { textContent: `📅 Gegründet: ${company.founded || 'Nicht angegeben'}` }),
             ce('div', {}, [
              ce('span', { textContent: `👥 Mitarbeiter: ${company.employee_names ? company.employee_names.length : 0}` }),
              company.employee_names && company.employee_names.length > 0 ? ce('span', { 'style.marginLeft': '6px', 'style.fontSize': '10px' }, [
                ce('span', { textContent: ' (' }),
                ...company.employee_names.map((emp, index) => {
                  const empObj = typeof emp === 'object' ? emp : { name: emp, phone: '', email: '' };
                  const displayName = empObj.name + (empObj.phone || empObj.email ? ` (${[empObj.phone, empObj.email].filter(Boolean).join(', ')})` : '');
                  const link = ce('a', {
                    href: `#/users?search=${encodeURIComponent(empObj.name)}`,
                    textContent: displayName,
                    'style.color': 'var(--accent-cyan)',
                    'style.textDecoration': 'underline',
                    'style.cursor': 'pointer'
                  });
                  return index === 0 ? link : [ce('span', { textContent: ', ' }), link];
                }).flat(),
                ce('span', { textContent: ')' })
              ]) : null
            ]),
            ce('div', {}, [
              ce('span', { textContent: `🤝 Aushilfen: ${company.helper_names ? company.helper_names.length : 0}` }),
              company.helper_names && company.helper_names.length > 0 ? ce('span', { 'style.marginLeft': '6px', 'style.fontSize': '10px' }, [
                ce('span', { textContent: ' (' }),
                ...company.helper_names.map((emp, index) => {
                  const empObj = typeof emp === 'object' ? emp : { name: emp, phone: '', email: '' };
                  const displayName = empObj.name + (empObj.phone || empObj.email ? ` (${[empObj.phone, empObj.email].filter(Boolean).join(', ')})` : '');
                  const link = ce('a', {
                    href: `#/users?search=${encodeURIComponent(empObj.name)}`,
                    textContent: displayName,
                    'style.color': 'var(--accent-cyan)',
                    'style.textDecoration': 'underline',
                    'style.cursor': 'pointer'
                  });
                  return index === 0 ? link : [ce('span', { textContent: ', ' }), link];
                }).flat(),
                ce('span', { textContent: ')' })
              ]) : null
            ])
          ]),

          // Render register info
          ce('div', { 'style.marginTop': '6px', 'style.lineHeight': '1.4' }, 
            regItems.map(item => ce('div', { textContent: `📜 ${item}` }))
          )
        ]),
        // Spalte B: Kontakt & Bank
        ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '4px' }, [
          ce('div', { 'style.fontWeight': '600', 'style.color': 'var(--text-dim)', 'style.marginBottom': '4px', textContent: '📞 Kontakt & Bank:' }),
          
          // Render multiple phones
          ce('div', {}, (company.phones || []).map(p => 
            ce('div', { textContent: `📞 ${p.label}: ${p.number}` })
          ).concat((company.phones || []).length === 0 ? [ce('div', { textContent: '📞 Keine Telefonnummern', 'style.opacity': '0.5' })] : [])),
          
          // Render multiple emails
          ce('div', { 'style.marginTop': '2px' }, (company.emails || []).map(e => 
            ce('div', { textContent: `✉️ ${e.label}: ${e.address}` })
          ).concat((company.emails || []).length === 0 ? [ce('div', { textContent: '✉️ Keine E-Mail-Adressen', 'style.opacity': '0.5' })] : [])),

          // Render multiple websites
          ce('div', { 'style.marginTop': '2px' }, (company.websites || []).map(w => 
            ce('div', { textContent: `🌐 ${w.label}: ${w.url}` })
          ).concat((company.websites || []).length === 0 ? [ce('div', { textContent: '🌐 Keine Webseiten', 'style.opacity': '0.5' })] : [])),

          ce('div', { textContent: `🏦 IBAN: ${company.bank_iban || 'Nicht angegeben'}`, 'style.marginTop': '6px' }),
          ce('div', { textContent: `🔑 BIC: ${company.bank_bic || 'Nicht angegeben'}` })
        ]),
        // Spalte C: Versicherungsschutz & Gewerbeberechtigungen
        ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '4px' }, [
          ce('div', { 'style.fontWeight': '600', 'style.color': 'var(--text-dim)', 'style.marginBottom': '4px', textContent: 'Zulassung & Schutz:' }),
          ce('div', {}, [
            ce('span', { textContent: '🛡️ Versicherungsschutz: ' }),
            ce('span', { 
              textContent: company.insurance_active ? 'AKTIV' : 'INAKTIV / FEHLT',
              'style.fontWeight': '700',
              'style.color': company.insurance_active ? 'var(--accent-emerald, #10B981)' : 'var(--accent-red, #EF4444)'
            })
          ]),
          company.insurance_details ? ce('div', { 
            textContent: `Details: ${company.insurance_details}`,
            'style.fontSize': '11px',
            'style.opacity': '0.7',
            'style.fontStyle': 'italic'
          }) : null,
          ce('div', { 
            textContent: `📜 Berechtigungen: ${company.licences || 'Keine Angaben'}`,
            'style.marginTop': '4px',
            'style.fontSize': '11px',
            'style.lineHeight': '1.3'
          })
        ])
      ]);

      card.append(topRow, detailsGrid);
      listEl.append(card);
    });

    listPanel.append(listEl);

    // ── Popup / Modal Overlay ──────────────────────────────────────
    const form = ce('form', { className: 'form' });
    
    // Hidden ID field
    const idInput = ce('input', { type: 'hidden', name: 'id', value: '' });

    // Close Button (top-right X)
    const closeBtn = ce('button', {
      type: 'button',
      textContent: '✕',
      'style.background': 'none',
      'style.border': 'none',
      'style.color': 'var(--text-dim)',
      'style.fontSize': '22px',
      'style.cursor': 'pointer',
      'style.padding': '4px',
      'style.lineHeight': '1'
    });

    const modalHeader = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center',
      'style.borderBottom': '1px solid rgba(255, 255, 255, 0.05)',
      'style.paddingBottom': 'var(--spacing-md)',
      'style.marginBottom': 'var(--spacing-md)'
    }, [
      ce('h2', { 
        className: 'panel__title', 
        id: 'form-title', 
        textContent: 'Neuen Betrieb hinzufügen',
        'style.margin': '0'
      }),
      closeBtn
    ]);

    // ── TAB HEADERS SYSTEM
    const tabHeaders = ce('div', {
      className: 'tab-headers',
      'style.display': 'flex',
      'style.gap': '8px',
      'style.borderBottom': '1px solid rgba(255,255,255,0.05)',
      'style.marginBottom': '20px',
      'style.paddingBottom': '4px'
    });

    const tabsConfig = [
      { id: 'general', label: '🏢 Allgemeine Daten' },
      { id: 'locations', label: '📍 Standorte' },
      { id: 'contacts', label: '📞 Kontaktkanäle' },
      { id: 'staff', label: '👥 Mitarbeiter' },
      { id: 'finances', label: '🛡️ Finanzen & Schutz' }
    ];

    const tabPanes = {};

    tabsConfig.forEach(t => {
      const btn = ce('button', {
        type: 'button',
        className: 'btn',
        textContent: t.label,
        'style.background': 'none',
        'style.border': 'none',
        'style.padding': '8px 16px',
        'style.cursor': 'pointer',
        'style.fontWeight': '600',
        'style.color': 'var(--text-dim)',
        'style.borderBottom': '3px solid transparent',
        'style.borderRadius': '0'
      });
      
      btn.addEventListener('click', () => {
        tabsConfig.forEach(cfg => {
          cfg.btn.style.color = 'var(--text-dim)';
          cfg.btn.style.borderBottomColor = 'transparent';
          tabPanes[cfg.id].style.display = 'none';
        });
        btn.style.color = 'var(--accent-cyan)';
        btn.style.borderBottomColor = 'var(--accent-cyan)';
        tabPanes[t.id].style.display = 'block';
      });

      t.btn = btn;
      tabHeaders.append(btn);
    });

    // Helper to reset active tab back to general
    this._resetTabs = () => {
      tabsConfig.forEach((cfg, idx) => {
        cfg.btn.style.color = idx === 0 ? 'var(--accent-cyan)' : 'var(--text-dim)';
        cfg.btn.style.borderBottomColor = idx === 0 ? 'var(--accent-cyan)' : 'transparent';
        tabPanes[cfg.id].style.display = idx === 0 ? 'block' : 'none';
      });
    };

    // Helper to create a Collapsible Accordion Group for register inputs
    const createCollapsibleGroup = (title, fieldsArray) => {
      const contentContainer = ce('div', {
        'style.display': 'none', // Default collapsed
        'style.flexDirection': 'column',
        'style.gap': '14px',
        'style.marginTop': '10px',
        'style.padding': '16px',
        'style.background': 'rgba(255, 255, 255, 0.01)',
        'style.borderRadius': 'var(--border-radius)',
        'style.border': '1px solid rgba(255, 255, 255, 0.04)'
      }, fieldsArray);

      const toggleIcon = ce('span', { 
        textContent: '▶', 
        'style.fontSize': '10px', 
        'style.marginRight': '10px', 
        'style.transition': 'transform 0.2s',
        'style.display': 'inline-block'
      });

      const header = ce('div', {
        className: 'accordion-header',
        'style.display': 'flex',
        'style.alignItems': 'center',
        'style.cursor': 'pointer',
        'style.padding': '12px 6px',
        'style.borderBottom': '1px solid rgba(255,255,255,0.06)',
        'style.marginTop': '16px',
        'style.userSelect': 'none'
      }, [
        toggleIcon,
        ce('span', {
          textContent: title,
          'style.fontSize': '12px',
          'style.fontWeight': '700',
          'style.color': 'var(--accent-cyan)',
          'style.textTransform': 'uppercase',
          'style.letterSpacing': '0.05em'
        })
      ]);

      header.addEventListener('click', () => {
        const isCollapsed = contentContainer.style.display === 'none';
        contentContainer.style.display = isCollapsed ? 'flex' : 'none';
        toggleIcon.textContent = isCollapsed ? '▼' : '▶';
      });

      const expandIfPopulated = () => {
        const hasValue = fieldsArray.some(fieldContainer => {
          const input = fieldContainer.querySelector('input');
          return input && input.value.trim() !== '';
        });
        if (hasValue) {
          contentContainer.style.display = 'flex';
          toggleIcon.textContent = '▼';
        } else {
          contentContainer.style.display = 'none';
          toggleIcon.textContent = '▶';
        }
      };

      return { header, contentContainer, toggleIcon, expandIfPopulated };
    };

    // ── TAB 1: ALLGEMEINE DATEN
    const nameInput = ce('input', {
      type: 'text',
      name: 'name',
      className: 'form-input',
      required: 'true',
      placeholder: 'z.B. Müller Spedition AG',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const foundedInput = ce('input', {
      type: 'text',
      name: 'founded',
      className: 'form-input',
      placeholder: 'z.B. 2010',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    
    const legalSelect = ce('select', {
      name: 'legal_form',
      className: 'form-select',
      required: 'true',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    }, [
      ce('option', { value: 'GmbH', textContent: 'GmbH (Ges.m.b.H. / GmbH)' }),
      ce('option', { value: 'EPU', textContent: 'EPU / Einzelfirma / Einzelunternehmen' }),
      ce('option', { value: 'KG', textContent: 'KG (Kommanditgesellschaft)' }),
      ce('option', { value: 'OG/OHG', textContent: 'OG / OHG (Offene Handelsgesellschaft)' }),
      ce('option', { value: 'AG', textContent: 'AG (Aktiengesellschaft)' }),
      ce('option', { value: 'UG', textContent: 'UG (haftungsbeschränkt)' }),
      ce('option', { value: 'GbR', textContent: 'GbR / GesbR (Gesellschaft bürgerl. Rechts)' }),
      ce('option', { value: 'GmbH & Co. KG', textContent: 'GmbH & Co. KG' }),
      ce('option', { value: 'Kollektivgesellschaft', textContent: 'Kollektivgesellschaft (KlG - CH)' }),
      ce('option', { value: 'Verein', textContent: 'Verein (e.V. / Verein)' }),
      ce('option', { value: 'Stiftung', textContent: 'Stiftung' }),
      ce('option', { value: 'Genossenschaft', textContent: 'Genossenschaft (eG / eGen / Gen.)' }),
      ce('option', { value: 'Sonstige', textContent: 'Sonstige Rechtsform' })
    ]);

    const directorsContainer = ce('div', { id: 'directors-container' });
    const addDirectorBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Geschäftsführer hinzufügen',
      'style.marginTop': '4px'
    });
    addDirectorBtn.addEventListener('click', () => this._renderDirectorRow(directorsContainer));

    const directorFieldGroup = this._buildField('Geschäftsführer / Vertretungsberechtigte', ce('div', {}, [
      directorsContainer,
      addDirectorBtn
    ]));

    // Dynamic licences list (synced with selected trades)
    const licencesContainer = ce('div', { id: 'licences-container' });
    this._licencesContainer = licencesContainer;

    const licencesFieldGroup = this._buildField('Gewerbeberechtigungen & Lizenzen', ce('div', {}, [
      licencesContainer
    ]));

    // National registers (Austria)
    const atFnInput = ce('input', { type: 'text', name: 'at_fn', className: 'form-input', placeholder: 'z.B. FN 123456 y', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const atGisaInput = ce('input', { type: 'text', name: 'at_gisa', className: 'form-input', placeholder: 'z.B. 12345678', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const atTaxInput = ce('input', { type: 'text', name: 'at_tax_number', className: 'form-input', placeholder: 'z.B. 68-123/4567', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const atVatInput = ce('input', { type: 'text', name: 'at_vat_id', className: 'form-input', placeholder: 'z.B. ATU12345678', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const atGlnInput = ce('input', { type: 'text', name: 'at_gln', className: 'form-input', placeholder: 'z.B. 9001234567890 (13-stellig)', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const atErsbInput = ce('input', { type: 'text', name: 'at_ersb', className: 'form-input', placeholder: 'Ergänzungsregister Ordnungszahl', 'style.width': '100%', 'style.boxSizing': 'border-box' });

    // National registers (Germany)
    const deHrInput = ce('input', { type: 'text', name: 'de_hr', className: 'form-input', placeholder: 'z.B. HRB 12345 / HRA 54321', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const deTaxInput = ce('input', { type: 'text', name: 'de_tax_number', className: 'form-input', placeholder: 'Klassische Steuernummer', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const deVatInput = ce('input', { type: 'text', name: 'de_vat_id', className: 'form-input', placeholder: 'z.B. DE123456789', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const deWidnrInput = ce('input', { type: 'text', name: 'de_widnr', className: 'form-input', placeholder: 'Wirtschafts-Identifikationsnummer', 'style.width': '100%', 'style.boxSizing': 'border-box' });

    // National registers (Switzerland)
    const chCheInput = ce('input', { type: 'text', name: 'ch_che', className: 'form-input', placeholder: 'z.B. CHE-123.456.789', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const chMwstInput = ce('input', { type: 'text', name: 'ch_mwst', className: 'form-input', placeholder: 'z.B. CHE-123.456.789 MWST', 'style.width': '100%', 'style.boxSizing': 'border-box' });

    // International & European
    const intlEoriInput = ce('input', { type: 'text', name: 'intl_eori', className: 'form-input', placeholder: 'z.B. ATEOS1000012345', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const intlLeiInput = ce('input', { type: 'text', name: 'intl_lei', className: 'form-input', placeholder: '20-stellige LEI-Nummer', 'style.width': '100%', 'style.boxSizing': 'border-box' });
    const intlOssInput = ce('input', { type: 'text', name: 'intl_oss_ioss', className: 'form-input', placeholder: 'z.B. IM0401234567 (OSS / IOSS)', 'style.width': '100%', 'style.boxSizing': 'border-box' });

    // Setup Collapsible Accordion Groups
    const groupAT = createCollapsibleGroup('🇦🇹 Nationale Kennzeichen (Österreich)', [
      this._buildField('FN (Firmenbuchnummer)', atFnInput),
      this._buildField('GISA-Zahl (Gewerbeinformationssystem)', atGisaInput),
      this._buildField('Steuernummer (Finanzamt)', atTaxInput),
      this._buildField('ATU-Nummer (UID)', atVatInput),
      this._buildField('GLN (Global Location Number)', atGlnInput),
      this._buildField('ERsB-Ordnungszahl', atErsbInput)
    ]);

    const groupDE = createCollapsibleGroup('🇩🇪 Nationale Kennzeichen (Deutschland)', [
      this._buildField('HRB / HRA (Handelsregister-Nummer)', deHrInput),
      this._buildField('Steuernummer', deTaxInput),
      this._buildField('USt-IdNr. (Umsatzsteuer-Identifikationsnummer)', deVatInput),
      this._buildField('W-IdNr. (Wirtschafts-Identifikationsnummer)', deWidnrInput)
    ]);

    const groupCH = createCollapsibleGroup('🇨🇭 Nationale Kennzeichen (Schweiz)', [
      this._buildField('CHE-Nummer (UID Schweiz)', chCheInput),
      this._buildField('MWST-Nr. (Schweiz)', chMwstInput)
    ]);

    const groupINT = createCollapsibleGroup('🌍 Internationale & EU-Kennzeichen', [
      this._buildField('EORI-Nummer (Economic Operators)', intlEoriInput),
      this._buildField('LEI (Legal Entity Identifier)', intlLeiInput),
      this._buildField('OSS / IOSS-Nummern', intlOssInput)
    ]);

    this._expanders = [groupAT, groupDE, groupCH, groupINT];

    // ── HIGH-FIDELITY TRADES SELECTOR WITH SEARCH & TABS
    this._tradesSearchInput = ce('input', {
      type: 'text',
      placeholder: '🔍 Gewerk/Branche filtern...',
      className: 'form-input',
      'style.marginBottom': '12px',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    this._tradesSearchInput.addEventListener('input', () => this._updateTradesUI());

    this._selectedTagsContainer = ce('div', {
      'style.display': 'flex',
      'style.flexWrap': 'wrap',
      'style.gap': '8px',
      'style.marginBottom': '14px'
    });

    const subTabAT = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: 'Österreich 🇦🇹',
      'style.flex': '1',
      'style.padding': '8px',
      'style.background': 'rgba(255, 255, 255, 0.08)',
      'style.color': 'var(--accent-cyan)',
      'style.borderColor': 'var(--accent-cyan)'
    });
    const subTabDE = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: 'Deutschland 🇩🇪',
      'style.flex': '1',
      'style.padding': '8px',
      'style.background': 'none',
      'style.color': 'var(--text-dim)',
      'style.borderColor': 'rgba(255, 255, 255, 0.08)'
    });
    const subTabCH = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: 'Schweiz 🇨🇭',
      'style.flex': '1',
      'style.padding': '8px',
      'style.background': 'none',
      'style.color': 'var(--text-dim)',
      'style.borderColor': 'rgba(255, 255, 255, 0.08)'
    });

    this._subTabBtns = { AT: subTabAT, DE: subTabDE, CH: subTabCH };

    const subTabsContainer = ce('div', {
      'style.display': 'flex',
      'style.gap': '8px',
      'style.marginBottom': '14px'
    }, [subTabAT, subTabDE, subTabCH]);

    const subTabs = [
      { id: 'AT', btn: subTabAT },
      { id: 'DE', btn: subTabDE },
      { id: 'CH', btn: subTabCH }
    ];

    subTabs.forEach(tab => {
      tab.btn.addEventListener('click', () => {
        this._activeTradesCountry = tab.id;
        subTabs.forEach(t => {
          t.btn.style.background = t.id === tab.id ? 'rgba(255,255,255,0.08)' : 'none';
          t.btn.style.borderColor = t.id === tab.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)';
          t.btn.style.color = t.id === tab.id ? 'var(--accent-cyan)' : 'var(--text-dim)';
        });
        this._updateTradesUI();
      });
    });

    this._tradesContainer = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '8px',
      'style.maxHeight': '320px',
      'style.overflowY': 'auto',
      'style.background': 'rgba(255,255,255,0.02)',
      'style.padding': '14px',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255,255,255,0.05)'
    });

    const selectorWrapper = ce('div', {
      'style.background': 'rgba(255, 255, 255, 0.01)',
      'style.padding': '16px',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.03)'
    }, [
      this._tradesSearchInput,
      this._selectedTagsContainer,
      subTabsContainer,
      this._tradesContainer
    ]);

    const tradesGroup = this._buildField('Gewerke / Branchen (Mehrfachauswahl)', selectorWrapper);

    // First row: Name and Founded side-by-side
    const nameRow = ce('div', {
      'style.display': 'grid',
      'style.gridTemplateColumns': '3.5fr 1fr',
      'style.gap': '14px',
      'style.width': '100%'
    }, [
      this._buildField('Firma Name *', nameInput),
      this._buildField('Gegründet', foundedInput)
    ]);

    // Left Column: Text & Select fields stacked in a single vertical column
    const leftCol = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '14px'
    }, [
      nameRow,
      this._buildField('Rechtsform (DACH) *', legalSelect),
      directorFieldGroup,
      licencesFieldGroup,

      // Collapsible register sections
      groupAT.header,
      groupAT.contentContainer,

      groupDE.header,
      groupDE.contentContainer,

      groupCH.header,
      groupCH.contentContainer,

      groupINT.header,
      groupINT.contentContainer
    ]);

    // Right Column: Trades Selector
    const rightCol = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column'
    }, [
      tradesGroup
    ]);

    // Horizontal split container with generous separation
    const generalGrid = ce('div', { 
      'style.display': 'grid', 
      'style.gridTemplateColumns': '1.3fr 1fr', 
      'style.gap': '40px',
      'style.alignItems': 'start'
    }, [
      leftCol,
      rightCol
    ]);

    tabPanes.general = ce('div', { 'style.display': 'block' }, [
      generalGrid
    ]);

    // ── TAB 2: STANDORTE
    const locationsContainer = ce('div', { id: 'locations-container' });
    const addLocBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Standort hinzufügen',
      'style.marginTop': '6px'
    });
    addLocBtn.addEventListener('click', () => this._renderLocationRow(locationsContainer));

    tabPanes.locations = ce('div', { 'style.display': 'none' }, [
      locationsContainer,
      addLocBtn
    ]);

    // ── TAB 3: KONTAKTKANÄLE
    const phonesContainer = ce('div', { id: 'phones-container' });
    const addPhoneBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Telefonnummer hinzufügen',
      'style.marginTop': '4px'
    });
    addPhoneBtn.addEventListener('click', () => this._renderPhoneRow(phonesContainer));

    const emailsContainer = ce('div', { id: 'emails-container' });
    const addEmailBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ E-Mail-Adresse hinzufügen',
      'style.marginTop': '4px'
    });
    addEmailBtn.addEventListener('click', () => this._renderEmailRow(emailsContainer));

    const websitesContainer = ce('div', { id: 'websites-container' });
    const addWebsiteBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Webseite hinzufügen',
      'style.marginTop': '4px'
    });
    addWebsiteBtn.addEventListener('click', () => this._renderWebsiteRow(websitesContainer));

    const socialsContainer = ce('div', { id: 'socials-container' });
    const addSocialBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Social Media hinzufügen',
      'style.marginTop': '4px'
    });
    addSocialBtn.addEventListener('click', () => this._renderSocialRow(socialsContainer));

    const addressBookContainer = ce('div', {
      id: 'address-book-container',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '20px'
    });

    const rightColumn = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '20px'
    }, [
      ce('h3', { textContent: '✏️ Sonstige / Allgemeine Kanäle', 'style.fontSize': '14px', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)', 'style.marginBottom': '8px' }),
      ce('div', {
        'style.background': 'rgba(255,255,255,0.01)',
        'style.padding': '16px',
        'style.borderRadius': 'var(--border-radius)',
        'style.border': '1px solid rgba(255,255,255,0.03)',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '16px'
      }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Telefonnummern', 'style.marginBottom': '8px', 'style.display': 'block' }),
          phonesContainer,
          addPhoneBtn
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'E-Mail-Adressen', 'style.marginBottom': '8px', 'style.display': 'block' }),
          emailsContainer,
          addEmailBtn
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Webseiten', 'style.marginBottom': '8px', 'style.display': 'block' }),
          websitesContainer,
          addWebsiteBtn
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Social Media Kanäle', 'style.marginBottom': '8px', 'style.display': 'block' }),
          socialsContainer,
          addSocialBtn
        ])
      ])
    ]);

    const contactGrid = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '32px'
    }, [
      addressBookContainer,
      rightColumn
    ]);

    tabPanes.contacts = ce('div', { 'style.display': 'none' }, [
      contactGrid
    ]);

    // ── TAB 4: MITARBEITER
    const employeeCountInput = ce('input', {
      type: 'text',
      name: 'employee_count',
      className: 'form-input',
      readOnly: 'true',
      value: '0',
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255, 255, 255, 0.02)',
      'style.border': '1px solid rgba(255, 255, 255, 0.08)',
      'style.color': 'var(--text-dim)'
    });

    const employeeListContainer = ce('div', {
      id: 'employee-names-container',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '6px',
      'style.marginTop': '8px',
      'style.padding': '12px',
      'style.background': 'rgba(255, 255, 255, 0.02)',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.05)'
    });

    const addEmployeeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Mitarbeiter hinzufügen',
      'style.marginTop': '6px',
      'style.padding': '4px 8px',
      'style.fontSize': '11px'
    });
    addEmployeeBtn.addEventListener('click', () => this._renderNameRow(employeeListContainer, employeeCountInput));

    const helperCountInput = ce('input', {
      type: 'text',
      name: 'helper_count',
      className: 'form-input',
      readOnly: 'true',
      value: '0',
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255, 255, 255, 0.02)',
      'style.border': '1px solid rgba(255, 255, 255, 0.08)',
      'style.color': 'var(--text-dim)'
    });

    const helperListContainer = ce('div', {
      id: 'helper-names-container',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '6px',
      'style.marginTop': '8px',
      'style.padding': '12px',
      'style.background': 'rgba(255, 255, 255, 0.02)',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.05)'
    });

    const addHelperBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Aushilfe hinzufügen',
      'style.marginTop': '6px',
      'style.padding': '4px 8px',
      'style.fontSize': '11px'
    });
    addHelperBtn.addEventListener('click', () => this._renderNameRow(helperListContainer, helperCountInput));

    const staffGridContainer = ce('div', {
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 1fr',
      'style.gap': '40px',
      'style.background': 'rgba(255,255,255,0.01)',
      'style.padding': '20px',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255,255,255,0.03)'
    }, [
      ce('div', {}, [
        this._buildField('Mitarbeiter (Festangestellt) - Anzahl', employeeCountInput),
        employeeListContainer,
        ce('div', { 'style.marginTop': '8px' }, [addEmployeeBtn])
      ]),
      ce('div', {}, [
        this._buildField('Aushilfen & Externe - Anzahl', helperCountInput),
        helperListContainer,
        ce('div', { 'style.marginTop': '8px' }, [addHelperBtn])
      ])
    ]);

    tabPanes.staff = ce('div', { 'style.display': 'none' }, [
      staffGridContainer
    ]);

    // ── TAB 5: FINANZEN & SCHUTZ
    const insActiveInput = ce('input', {
      type: 'checkbox',
      name: 'insurance_active',
      'style.cursor': 'pointer'
    });
    const insDetailsInput = ce('input', {
      type: 'text',
      name: 'insurance_details',
      className: 'form-input',
      placeholder: 'z.B. Allianz Haftpflicht, Polizze-Nr: AL-99, Summe: € 5M',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const row8 = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '100px 1fr', 'style.gap': 'var(--spacing-sm)', 'style.alignItems': 'center' }, [
      this._buildField('Aktiv?', insActiveInput),
      this._buildField('Versicherungsdetails (Gesellschaft, Polizze, Summe)', insDetailsInput)
    ]);

    const ibanInput = ce('input', {
      type: 'text',
      name: 'bank_iban',
      className: 'form-input',
      placeholder: 'z.B. AT89 3000 0000 1234 5678, CH89...',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const bicInput = ce('input', {
      type: 'text',
      name: 'bank_bic',
      className: 'form-input',
      placeholder: 'z.B. BICXAT2WXXXX',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const colorInput = ce('input', {
      type: 'color',
      name: 'branding_color',
      className: 'form-input',
      value: '#2563EB',
      'style.height': '40px',
      'style.padding': '2px',
      'style.cursor': 'pointer',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const row9 = ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '2fr 1fr 1fr', 'style.gap': 'var(--spacing-sm)' }, [
      this._buildField('Bankverbindung IBAN', ibanInput),
      this._buildField('BIC', bicInput),
      this._buildField('Branding Farbe', colorInput)
    ]);

    tabPanes.finances = ce('div', { 'style.display': 'none' }, [
      row8,
      row9
    ]);

    // Modal Action Buttons
    const cancelBtn = ce('button', { 
      className: 'btn btn--secondary', 
      type: 'button', 
      textContent: '❌ Abbrechen' 
    });

    const saveBtn = ce('button', { 
      className: 'btn btn--primary', 
      type: 'submit', 
      textContent: '💾 Speichern' 
    });

    const deleteBtn = ce('button', { 
      className: 'btn btn--danger', 
      type: 'button', 
      textContent: '🗑️ Löschen',
      id: 'btn-delete-company',
      'style.display': 'none'
    });

    const btnRow = ce('div', { 
      className: 'form-actions', 
      'style.display': 'flex', 
      'style.justifyContent': 'space-between',
      'style.marginTop': 'var(--spacing-lg)'
    }, [
      ce('div', { 'style.display': 'flex', 'style.gap': 'var(--spacing-sm)' }, [
        saveBtn,
        cancelBtn
      ]),
      deleteBtn
    ]);

    // Append ID input, Tab navigation, the panes, and footer button row
    form.append(
      idInput,
      tabHeaders,
      tabPanes.general,
      tabPanes.locations,
      tabPanes.contacts,
      tabPanes.staff,
      tabPanes.finances,
      btnRow
    );

    // Modal Content Panel
    const modalContent = ce('div', {
      className: 'panel',
      'style.width': '95vw',
      'style.maxWidth': '950px',
      'style.minHeight': '580px',
      'style.background': '#161F30',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.05)',
      'style.boxShadow': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      'style.padding': 'var(--spacing-lg)',
      'style.maxHeight': '92vh',
      'style.overflowY': 'auto',
      'style.position': 'relative',
      'style.margin': 'auto'
    }, [
      modalHeader,
      form
    ]);

    // Modal Overlay Wrapper
    const modalOverlay = ce('div', {
      className: 'modal-overlay',
      'style.display': 'none',
      'style.position': 'fixed',
      'style.top': '0',
      'style.left': '0',
      'style.width': '100vw',
      'style.height': '100vh',
      'style.background': 'rgba(11, 15, 25, 0.8)',
      'style.backdropFilter': 'blur(4px)',
      'style.zIndex': '9999',
      'style.alignItems': 'flex-start',
      'style.justifyContent': 'center',
      'style.overflowY': 'auto',
      'style.padding': 'var(--spacing-lg)'
    }, [
      modalContent
    ]);

    this._modal = modalOverlay;

    // Connect trigger events
    newBtn.addEventListener('click', () => {
      this._resetForm(form);
      this._modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
      this._resetForm(form);
    });

    cancelBtn.addEventListener('click', () => {
      this._resetForm(form);
    });

    // Form Submit Event
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Selected Trades collected from search-selector Set source-of-truth (mapping composite keys to names)
      const selectedTrades = Array.from(new Set(Array.from(this._selectedTrades).map(key => key.split(':')[1])));

      // Collect locations
      const locations = [];
      form.querySelectorAll('.location-row').forEach(row => {
        const contacts = [];
        row.querySelectorAll('.location-contact-row').forEach(cRow => {
          contacts.push({
            name: cRow.querySelector('[name="loc_contact_name"]').value || '',
            position: cRow.querySelector('[name="loc_contact_position"]').value || '',
            phone: cRow.querySelector('[name="loc_contact_phone"]').value || '',
            email: cRow.querySelector('[name="loc_contact_email"]').value || ''
          });
        });

        locations.push({
          type: row.querySelector('[name="loc_type"]').value,
          name: row.querySelector('[name="loc_name"]').value,
          street: row.querySelector('[name="loc_street"]').value,
          zip: row.querySelector('[name="loc_zip"]').value,
          city: row.querySelector('[name="loc_city"]').value,
          country: row.querySelector('[name="loc_country"]').value,
          phone: row.querySelector('[name="loc_phone"]')?.value || '',
          email: row.querySelector('[name="loc_email"]')?.value || '',
          contacts: contacts
        });
      });

      if (locations.length > 0 && !locations.some(l => l.type === 'main')) {
        locations[0].type = 'main';
      }

      // Collect phones
      const phones = [];
      form.querySelectorAll('.phone-row').forEach(row => {
        if (!row.classList.contains('is-synced')) {
          phones.push({
            label: row.querySelector('[name="phone_label"]').value,
            number: row.querySelector('[name="phone_number"]').value
          });
        }
      });

      // Collect emails
      const emails = [];
      form.querySelectorAll('.email-row').forEach(row => {
        if (!row.classList.contains('is-synced')) {
          emails.push({
            label: row.querySelector('[name="email_label"]').value,
            address: row.querySelector('[name="email_address"]').value
          });
        }
      });

      // Collect websites
      const websites = [];
      form.querySelectorAll('.website-row').forEach(row => {
        websites.push({
          label: row.querySelector('[name="website_label"]').value,
          url: row.querySelector('[name="website_url"]').value
        });
      });

      // Collect socials
      const socials = [];
      form.querySelectorAll('.social-row').forEach(row => {
        const platform = row.querySelector('[name="social_platform"]').value;
        const value = row.querySelector('[name="social_value"]').value;
        if (value.trim()) {
          socials.push({ platform, value });
        }
      });

      // Collect managing directors with roles
      const managing_directors = [];
      form.querySelectorAll('.director-row').forEach(row => {
        const nameVal = row.querySelector('[name="director_name"]').value.trim();
        const posVal = row.querySelector('[name="director_position"]').value;
        if (nameVal) {
          managing_directors.push({
            position: posVal,
            name: nameVal
          });
        }
      });

      // Collect licences list (including qualification)
      const licences_list = [];
      form.querySelectorAll('.licence-row').forEach(row => {
        const nameVal = row.querySelector('[name="licence_name"]').value.trim();
        const qualVal = row.querySelector('[name="licence_qualification"]').value.trim();
        const countryVal = row.querySelector('[name="licence_country"]').value;
        if (nameVal) {
          licences_list.push({
            name: nameVal,
            qualification: qualVal,
            country: countryVal
          });
        }
      });

      // Collect employees list
      const employeeNames = [];
      employeeListContainer.querySelectorAll('.name-row').forEach(row => {
        const val = row.querySelector('[name="person_name"]').value.trim();
        if (val) employeeNames.push(val);
      });

      // Collect helpers list
      const helperNames = [];
      helperListContainer.querySelectorAll('.name-row').forEach(row => {
        const val = row.querySelector('[name="person_name"]').value.trim();
        if (val) helperNames.push(val);
      });

      const data = {
        name: formData.get('name'),
        industries: selectedTrades,
        vat_id: formData.get('at_vat_id') || formData.get('de_vat_id') || formData.get('ch_mwst') || '',
        legal_form: formData.get('legal_form'),
        managing_directors: managing_directors,
        licences_list: licences_list,
        insurance_active: form.querySelector('[name="insurance_active"]').checked,
        insurance_details: formData.get('insurance_details'),
        bank_iban: formData.get('bank_iban'),
        bank_bic: formData.get('bank_bic'),
        locations: locations,
        phones: phones,
        emails: emails,
        websites: websites,
        socials: socials,
        branding_color: formData.get('branding_color'),
        // Founded & Staff
        founded: formData.get('founded'),
        employee_names: employeeNames,
        helper_names: helperNames,
        // Dynamic registers
        at_fn: formData.get('at_fn'),
        at_gisa: formData.get('at_gisa'),
        at_tax_number: formData.get('at_tax_number'),
        at_gln: formData.get('at_gln'),
        at_ersb: formData.get('at_ersb'),
        de_hr: formData.get('de_hr'),
        de_tax_number: formData.get('de_tax_number'),
        de_widnr: formData.get('de_widnr'),
        ch_che: formData.get('ch_che'),
        ch_mwst: formData.get('ch_mwst'),
        intl_eori: formData.get('intl_eori'),
        intl_lei: formData.get('intl_lei'),
        intl_oss_ioss: formData.get('intl_oss_ioss')
      };
      
      const id = formData.get('id');
      if (id) data.id = Number(id);

      this._onSave?.(data);
      this._resetForm(form);
    });

    // Delete company event
    deleteBtn.addEventListener('click', () => {
      const id = Number(form.querySelector('[name="id"]').value);
      if (confirm('Möchten Sie diesen Betrieb wirklich löschen?')) {
        this._onDelete?.(id);
        this._resetForm(form);
      }
    });

    wrapper.append(header, listPanel, modalOverlay);

    this.container.append(wrapper);
    this.el = wrapper;
    return wrapper;
  }

  _buildField(label, input) {
    return ce('div', { className: 'form-group', 'style.marginBottom': '16px' }, [
      ce('label', { 
        className: 'form-label', 
        textContent: label,
        'style.marginBottom': '8px',
        'style.display': 'block'
      }),
      input
    ]);
  }

  _fillForm(company) {
    const form = this.el.querySelector('form');
    if (!form) return;

    form.querySelector('[name="id"]').value = company.id;
    form.querySelector('[name="name"]').value = company.name;
    
    // Set selected trades & render in selector (storing country:name keys)
    this._selectedTrades.clear();
    this._typedQualifications.clear();
    if (company.licences_list && company.licences_list.length > 0) {
      company.licences_list.forEach(lic => {
        const key = `${lic.country}:${lic.name}`;
        this._selectedTrades.add(key);
        this._typedQualifications.set(key, lic.qualification || '');
      });
    } else if (company.industries) {
      const defaultCountry = company.locations?.[0]?.country || 'AT';
      company.industries.forEach(name => {
        let country = defaultCountry;
        if (TRADES_DB.DE.some(t => t.name === name)) country = 'DE';
        else if (TRADES_DB.CH.some(t => t.name === name)) country = 'CH';
        else if (TRADES_DB.AT.some(t => t.name === name)) country = 'AT';
        const key = `${country}:${name}`;
        this._selectedTrades.add(key);
        this._typedQualifications.set(key, '');
      });
    }
    if (this._tradesSearchInput) this._tradesSearchInput.value = '';
    this._activeTradesCountry = 'AT';
    
    // Reset country subtabs styling to AT active
    const subtabs = ['AT', 'DE', 'CH'];
    subtabs.forEach(c => {
      const btn = this._subTabBtns[c];
      if (btn) {
        btn.style.background = c === 'AT' ? 'rgba(255,255,255,0.08)' : 'none';
        btn.style.borderColor = c === 'AT' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)';
        btn.style.color = c === 'AT' ? 'var(--accent-cyan)' : 'var(--text-dim)';
      }
    });
    this._updateTradesUI();

    form.querySelector('[name="legal_form"]').value = company.legal_form || 'GmbH';
    form.querySelector('[name="insurance_active"]').checked = !!company.insurance_active;
    form.querySelector('[name="insurance_details"]').value = company.insurance_details || '';
    form.querySelector('[name="bank_iban"]').value = company.bank_iban || '';
    form.querySelector('[name="bank_bic"]').value = company.bank_bic || '';
    form.querySelector('[name="branding_color"]').value = company.branding_color || '#2563EB';

    // Founded & Staff
    form.querySelector('[name="founded"]').value = company.founded || '';

    const empContainer = form.querySelector('#employee-names-container');
    const empCountInput = form.querySelector('[name="employee_count"]');
    empContainer.innerHTML = '';
    if (company.employee_names && company.employee_names.length > 0) {
      company.employee_names.forEach(name => this._renderNameRow(empContainer, empCountInput, name));
    } else {
      empCountInput.value = '0';
    }

    const hlpContainer = form.querySelector('#helper-names-container');
    const hlpCountInput = form.querySelector('[name="helper_count"]');
    hlpContainer.innerHTML = '';
    if (company.helper_names && company.helper_names.length > 0) {
      company.helper_names.forEach(name => this._renderNameRow(hlpContainer, hlpCountInput, name));
    } else {
      hlpCountInput.value = '0';
    }

    // Populate registers
    form.querySelector('[name="at_fn"]').value = company.at_fn || '';
    form.querySelector('[name="at_gisa"]').value = company.at_gisa || '';
    form.querySelector('[name="at_tax_number"]').value = company.at_tax_number || '';
    form.querySelector('[name="at_vat_id"]').value = company.vat_id && company.vat_id.startsWith('AT') ? company.vat_id : '';
    form.querySelector('[name="at_gln"]').value = company.at_gln || '';
    form.querySelector('[name="at_ersb"]').value = company.at_ersb || '';
    form.querySelector('[name="de_hr"]').value = company.de_hr || '';
    form.querySelector('[name="de_tax_number"]').value = company.de_tax_number || '';
    form.querySelector('[name="de_vat_id"]').value = company.vat_id && company.vat_id.startsWith('DE') ? company.vat_id : '';
    form.querySelector('[name="de_widnr"]').value = company.de_widnr || '';
    form.querySelector('[name="ch_che"]').value = company.ch_che || '';
    form.querySelector('[name="ch_mwst"]').value = company.ch_mwst || '';
    form.querySelector('[name="intl_eori"]').value = company.intl_eori || '';
    form.querySelector('[name="intl_lei"]').value = company.intl_lei || '';
    form.querySelector('[name="intl_oss_ioss"]').value = company.intl_oss_ioss || '';

    // All register accordions are collapsed by default
    if (this._expanders) {
      this._expanders.forEach(exp => {
        exp.contentContainer.style.display = 'none';
        exp.toggleIcon.textContent = '▶';
      });
    }

    // Clear and build dynamic directors
    const directorsContainer = form.querySelector('#directors-container');
    directorsContainer.innerHTML = '';
    if (company.managing_directors && company.managing_directors.length > 0) {
      company.managing_directors.forEach(dir => this._renderDirectorRow(directorsContainer, dir));
    } else if (company.managing_director) {
      this._renderDirectorRow(directorsContainer, { position: 'GF', name: company.managing_director });
    } else {
      this._renderDirectorRow(directorsContainer);
    }


    // Clear and build dynamic locations
    const locContainer = form.querySelector('#locations-container');
    locContainer.innerHTML = '';
    if (company.locations && company.locations.length > 0) {
      company.locations.forEach(loc => this._renderLocationRow(locContainer, loc));
    } else {
      this._renderLocationRow(locContainer);
    }

    const phoneContainer = form.querySelector('#phones-container');
    phoneContainer.innerHTML = '';
    if (company.phones && company.phones.length > 0) {
      company.phones.forEach(ph => this._renderPhoneRow(phoneContainer, ph));
    }

    const emailContainer = form.querySelector('#emails-container');
    emailContainer.innerHTML = '';
    if (company.emails && company.emails.length > 0) {
      company.emails.forEach(em => this._renderEmailRow(emailContainer, em));
    }

    const websiteContainer = form.querySelector('#websites-container');
    websiteContainer.innerHTML = '';
    if (company.websites && company.websites.length > 0) {
      company.websites.forEach(web => this._renderWebsiteRow(websiteContainer, web));
    }

    const socialContainer = form.querySelector('#socials-container');
    socialContainer.innerHTML = '';
    if (company.socials && company.socials.length > 0) {
      company.socials.forEach(soc => this._renderSocialRow(socialContainer, soc));
    }

    this.el.querySelector('#form-title').textContent = 'Betrieb bearbeiten';
    this.el.querySelector('#btn-delete-company').style.display = 'block';

    this._syncLocationsToContacts();

    if (this._resetTabs) this._resetTabs();

    if (this._modal) {
      this._modal.style.display = 'flex';
    }
  }

  _resetForm(form) {
    form.reset();
    form.querySelector('[name="id"]').value = '';
    form.querySelector('[name="insurance_active"]').checked = false;

    // Reset trades
    this._selectedTrades.clear();
    this._typedQualifications.clear();
    if (this._tradesSearchInput) this._tradesSearchInput.value = '';
    this._activeTradesCountry = 'AT';
    
    const subtabs = ['AT', 'DE', 'CH'];
    subtabs.forEach(c => {
      const btn = this._subTabBtns[c];
      if (btn) {
        btn.style.background = c === 'AT' ? 'rgba(255,255,255,0.08)' : 'none';
        btn.style.borderColor = c === 'AT' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)';
        btn.style.color = c === 'AT' ? 'var(--accent-cyan)' : 'var(--text-dim)';
      }
    });
    this._updateTradesUI();
    
    const locContainer = form.querySelector('#locations-container');
    if (locContainer) {
      locContainer.innerHTML = '';
      this._renderLocationRow(locContainer);
    }
    const directorsContainer = form.querySelector('#directors-container');
    if (directorsContainer) {
      directorsContainer.innerHTML = '';
      this._renderDirectorRow(directorsContainer);
    }

    const phoneContainer = form.querySelector('#phones-container');
    if (phoneContainer) phoneContainer.innerHTML = '';
    const emailContainer = form.querySelector('#emails-container');
    if (emailContainer) emailContainer.innerHTML = '';
    const websiteContainer = form.querySelector('#websites-container');
    if (websiteContainer) websiteContainer.innerHTML = '';

    // Reset Staff
    form.querySelector('[name="founded"]').value = '';
    const empContainer = form.querySelector('#employee-names-container');
    if (empContainer) {
      empContainer.innerHTML = '';
      form.querySelector('[name="employee_count"]').value = '0';
    }
    const hlpContainer = form.querySelector('#helper-names-container');
    if (hlpContainer) {
      hlpContainer.innerHTML = '';
      form.querySelector('[name="helper_count"]').value = '0';
    }

    // Collapse all register accordions
    if (this._expanders) {
      this._expanders.forEach(exp => {
        exp.contentContainer.style.display = 'none';
        exp.toggleIcon.textContent = '▶';
      });
    }

    this.el.querySelector('#form-title').textContent = 'Neuen Betrieb hinzufügen';
    this.el.querySelector('#btn-delete-company').style.display = 'none';
    
    if (this._resetTabs) this._resetTabs();

    if (this._modal) {
      this._modal.style.display = 'none';
    }
  }

  // Interactive Trades selector updater
  _updateTradesUI() {
    if (!this._tradesContainer || !this._selectedTagsContainer) return;

    // 1. Render active tags
    this._selectedTagsContainer.innerHTML = '';
    if (this._selectedTrades.size === 0) {
      this._selectedTagsContainer.append(ce('span', {
        textContent: 'Keine Gewerke ausgewählt',
        'style.fontSize': '11px',
        'style.opacity': '0.5',
        'style.fontStyle': 'italic'
      }));
    } else {
      Array.from(this._selectedTrades).forEach(key => {
        const [country, tradeName] = key.split(':');
        const flag = country === 'AT' ? '🇦🇹' : country === 'DE' ? '🇩🇪' : '🇨🇭';

        const removeBtn = ce('span', {
          textContent: '✕',
          'style.cursor': 'pointer',
          'style.fontWeight': 'bold',
          'style.marginLeft': '6px',
          'style.color': 'var(--accent-red)'
        });
        removeBtn.addEventListener('click', () => {
          this._selectedTrades.delete(key);
          this._updateTradesUI();
        });

        const chip = ce('div', {
          className: 'badge',
          'style.background': 'rgba(16, 185, 129, 0.1)',
          'style.color': 'var(--accent-emerald)',
          'style.border': '1px solid rgba(16, 185, 129, 0.2)',
          'style.padding': '4px 8px',
          'style.borderRadius': '4px',
          'style.display': 'inline-flex',
          'style.alignItems': 'center',
          'style.fontSize': '11px',
          'style.fontWeight': '600'
        }, [
          ce('span', { textContent: `${flag} ${tradeName}` }),
          removeBtn
        ]);
        this._selectedTagsContainer.append(chip);
      });
    }

    // 2. Render checkbox list
    this._tradesContainer.innerHTML = '';
    const query = (this._tradesSearchInput?.value || '').toLowerCase().trim();
    const activeList = TRADES_DB[this._activeTradesCountry] || [];

    // Levenshtein helper
    const getEditDistance = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              Math.min(
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
              )
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const normalizeStr = (str) => {
      return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9\s]/g, '');
    };

    const cleanQuery = normalizeStr(query);
    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    const filtered = activeList.filter(item => {
      if (!cleanQuery) return true;
      const cleanName = normalizeStr(item.name);
      if (cleanName.includes(cleanQuery)) return true;

      const nameWords = cleanName.split(/\s+/).filter(Boolean);
      return queryWords.every(qw => {
        if (qw.length <= 3) {
          return nameWords.some(nw => nw.includes(qw));
        }
        return nameWords.some(nw => {
          if (nw.includes(qw) || qw.includes(nw)) return true;
          const maxDist = qw.length <= 5 ? 1 : 2;
          return getEditDistance(nw, qw) <= maxDist;
        });
      });
    });

    if (filtered.length === 0) {
      this._tradesContainer.append(ce('div', {
        textContent: 'Keine Gewerke gefunden',
        'style.fontSize': '12px',
        'style.opacity': '0.5',
        'style.textAlign': 'center',
        'style.padding': '20px'
      }));
      return;
    }

    filtered.forEach(item => {
      const key = `${this._activeTradesCountry}:${item.name}`;
      const isChecked = this._selectedTrades.has(key);

      const checkbox = ce('input', {
        type: 'checkbox',
        value: item.name,
        'style.cursor': 'pointer'
      });
      checkbox.checked = isChecked;

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this._selectedTrades.add(key);
        } else {
          this._selectedTrades.delete(key);
        }
        this._updateTradesUI();
      });

      const label = ce('label', {
        'style.display': 'grid',
        'style.gridTemplateColumns': 'auto 1fr',
        'style.gap': '10px',
        'style.alignItems': 'center',
        'style.fontSize': '13px',
        'style.cursor': 'pointer',
        'style.userSelect': 'none',
        'style.padding': '6px 8px',
        'style.borderRadius': '4px',
        'style.background': isChecked ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
        'style.transition': 'background 0.2s',
        'style.width': '100%',
        'style.boxSizing': 'border-box'
      }, [
        checkbox,
        ce('div', { 'style.width': '100%' }, [
          ce('div', { 
            'style.display': 'flex', 
            'style.justifyContent': 'space-between', 
            'style.alignItems': 'center',
            'style.width': '100%'
          }, [
            ce('div', { 
              textContent: item.name, 
              'style.fontWeight': '600',
              'style.color': isChecked ? 'var(--accent-cyan)' : 'var(--text-main)',
              'style.lineHeight': '1.3'
            }),
            (() => {
              const categoryLower = (item.category || '').toLowerCase();
              const isRegulated = categoryLower.includes('reglementiert') || categoryLower.includes('zulassungspflichtig');
              return ce('span', {
                textContent: isRegulated ? '✓ Reglementiert' : '✓ Frei',
                'style.fontSize': '9px',
                'style.fontWeight': '700',
                'style.padding': '2px 8px',
                'style.borderRadius': '12px',
                'style.border': isRegulated ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                'style.background': isRegulated ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                'style.color': isRegulated ? '#F87171' : '#34D399',
                'style.textShadow': isRegulated ? '0 0 6px rgba(239, 68, 68, 0.4)' : '0 0 6px rgba(16, 185, 129, 0.4)',
                'style.whiteSpace': 'nowrap',
                'style.marginLeft': '12px'
              });
            })()
          ]),
          ce('div', { 
            textContent: item.category, 
            'style.fontSize': '10px', 
            'style.color': 'var(--text-dim)', 
            'style.opacity': '0.7',
            'style.marginTop': '2px'
          })
        ])
      ]);

      this._tradesContainer.append(label);
    });

    this._updateLicencesUI();
  }

  // Helper row builders
  _renderNameRow(container, countInput, personVal = '') {
    const person = typeof personVal === 'object' ? personVal : { name: personVal, phone: '', email: '' };

    const row = ce('div', {
      className: 'name-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '2fr 1.5fr 1.5fr auto',
      'style.gap': '8px',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });

    const nameInput = ce('input', {
      type: 'text',
      name: 'person_name',
      className: 'form-input',
      placeholder: 'Name der Person',
      value: person.name || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const phoneInput = ce('input', {
      type: 'text',
      name: 'person_phone',
      className: 'form-input',
      placeholder: 'Telefon',
      value: person.phone || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const emailInput = ce('input', {
      type: 'text',
      name: 'person_email',
      className: 'form-input',
      placeholder: 'E-Mail',
      value: person.email || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });

    const updateCount = () => {
      const rows = container.querySelectorAll('.name-row');
      let filledCount = 0;
      rows.forEach(r => {
        if (r.querySelector('[name="person_name"]').value.trim()) {
          filledCount++;
        }
      });
      countInput.value = String(filledCount);
    };

    nameInput.addEventListener('input', updateCount);
    removeBtn.addEventListener('click', () => {
      row.remove();
      updateCount();
    });

    row.append(nameInput, phoneInput, emailInput, removeBtn);
    container.append(row);
    updateCount();
  }

  _updateLicencesUI() {
    if (!this._licencesContainer) return;
    this._licencesContainer.innerHTML = '';

    if (this._selectedTrades.size === 0) {
      this._licencesContainer.append(ce('div', {
        textContent: 'Keine Lizenzen (bitte wählen Sie Gewerke / Branchen aus)',
        'style.fontSize': '12px',
        'style.opacity': '0.5',
        'style.fontStyle': 'italic',
        'style.padding': '8px 4px'
      }));
      return;
    }

    Array.from(this._selectedTrades).forEach(key => {
      const [country, tradeName] = key.split(':');

      const card = ce('div', {
        className: 'licence-row',
        'style.background': 'rgba(255, 255, 255, 0.01)',
        'style.border': '1px solid rgba(255, 255, 255, 0.05)',
        'style.borderRadius': '6px',
        'style.padding': '12px',
        'style.marginBottom': '10px'
      });

      // Line 1: Header (Trade Name on Left, Country Badge & Register Button on Right)
      const line1 = ce('div', {
        'style.display': 'flex',
        'style.justifyContent': 'space-between',
        'style.alignItems': 'center',
        'style.marginBottom': '8px'
      });

      // Left: Name & Hidden Input
      const flag = country === 'AT' ? '🇦🇹' : country === 'DE' ? '🇩🇪' : '🇨🇭';
      const leftCol = ce('div', {
        'style.display': 'flex',
        'style.alignItems': 'center',
        'style.gap': '8px'
      }, [
        ce('span', {
          textContent: `${flag} ${tradeName}`,
          'style.fontWeight': '600',
          'style.fontSize': '13px',
          'style.color': 'var(--text-main)'
        }),
        ce('input', {
          type: 'hidden',
          name: 'licence_name',
          value: tradeName
        })
      ]);

      // Right: Country & Link
      const registerLabel = country === 'AT' ? 'AT (WKO)' : country === 'DE' ? 'DE (HWK)' : 'CH (Zefix)';
      
      const linkBtn = ce('button', {
        type: 'button',
        className: 'btn btn--secondary btn--sm',
        textContent: '🌐 Register',
        'style.padding': '4px 8px',
        'style.fontSize': '11px'
      });
      linkBtn.addEventListener('click', () => {
        let url = 'https://firmen.wko.at';
        if (country === 'DE') {
          url = 'https://www.handwerkskammer.de';
        } else if (country === 'CH') {
          url = 'https://www.zefix.ch';
        }
        window.open(url, '_blank');
      });

      const rightCol = ce('div', {
        'style.display': 'flex',
        'style.alignItems': 'center',
        'style.gap': '8px'
      }, [
        ce('span', {
          className: 'badge',
          textContent: registerLabel,
          'style.fontSize': '10px',
          'style.background': 'rgba(255, 255, 255, 0.05)',
          'style.color': 'var(--text-dim)',
          'style.padding': '2px 6px',
          'style.borderRadius': '4px',
          'style.fontWeight': '600'
        }),
        ce('input', {
          type: 'hidden',
          name: 'licence_country',
          value: country
        }),
        linkBtn
      ]);

      line1.append(leftCol, rightCol);

      // Line 2: Qualifications Input
      const line2 = ce('div', {});
      const qualInput = ce('input', {
        type: 'text',
        name: 'licence_qualification',
        className: 'form-input',
        placeholder: 'Qualifikationen & Nachweise eintragen (z.B. Meisterprüfung, FH, Zertifikate...)',
        value: this._typedQualifications.get(key) || '',
        'style.width': '100%',
        'style.boxSizing': 'border-box',
        'style.fontSize': '12px',
        'style.padding': '8px 12px'
      });
      qualInput.addEventListener('input', (e) => {
        this._typedQualifications.set(key, e.target.value);
      });
      line2.append(qualInput);

      card.append(line1, line2);
      this._licencesContainer.append(card);
    });
  }

  _renderDirectorRow(container, data = {}) {
    const row = ce('div', {
      className: 'director-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '140px 1fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });

    const positionSelect = ce('select', {
      name: 'director_position',
      className: 'form-select',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    }, [
      ce('option', { value: 'GF', textContent: 'GF' }),
      ce('option', { value: 'Prokurist', textContent: 'Prokura' }),
      ce('option', { value: 'Vorstand', textContent: 'Vorstand' }),
      ce('option', { value: 'Inhaber', textContent: 'Inhaber' }),
      ce('option', { value: 'Partner', textContent: 'Partner' }),
      ce('option', { value: 'Liquidator', textContent: 'Liquidator' }),
      ce('option', { value: 'Bevollmächtigter', textContent: 'Bevollmächtigt' })
    ]);
    positionSelect.value = data.position || 'GF';

    const nameInput = ce('input', {
      type: 'text',
      name: 'director_name',
      className: 'form-input',
      placeholder: 'Name des Vertreters',
      value: data.name || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });
    removeBtn.addEventListener('click', () => {
      row.remove();
    });
    row.append(positionSelect, nameInput, removeBtn);
    container.append(row);
  }

  _renderPhoneRow(container, data = {}) {
    const row = ce('div', { 
      className: 'phone-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 2fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });
    const labelInput = ce('input', {
      type: 'text',
      name: 'phone_label',
      className: 'form-input',
      placeholder: 'z.B. Büro, Hotline',
      value: data.label || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const numberInput = ce('input', {
      type: 'tel',
      name: 'phone_number',
      className: 'form-input',
      placeholder: 'z.B. +43 1 123456',
      value: data.number || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });
    removeBtn.addEventListener('click', () => row.remove());
    row.append(labelInput, numberInput, removeBtn);
    container.append(row);
  }

  _renderEmailRow(container, data = {}) {
    const row = ce('div', { 
      className: 'email-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 2fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });
    const labelInput = ce('input', {
      type: 'text',
      name: 'email_label',
      className: 'form-input',
      placeholder: 'z.B. Büro, Support',
      value: data.label || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const addressInput = ce('input', {
      type: 'email',
      name: 'email_address',
      className: 'form-input',
      placeholder: 'z.B. office@firma.at',
      value: data.address || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });
    removeBtn.addEventListener('click', () => row.remove());
    row.append(labelInput, addressInput, removeBtn);
    container.append(row);
  }

  _renderWebsiteRow(container, data = {}) {
    const row = ce('div', { 
      className: 'website-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 2fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });
    const labelInput = ce('input', {
      type: 'text',
      name: 'website_label',
      className: 'form-input',
      placeholder: 'z.B. Web, Shop',
      value: data.label || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const urlInput = ce('input', {
      type: 'text',
      name: 'website_url',
      className: 'form-input',
      placeholder: 'z.B. www.firma.at',
      value: data.url || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });
    removeBtn.addEventListener('click', () => row.remove());
    row.append(labelInput, urlInput, removeBtn);
    container.append(row);
  }

  _renderSocialRow(container, data = {}) {
    const row = ce('div', { 
      className: 'social-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 2fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center'
    });

    const platformSelect = ce('select', {
      name: 'social_platform',
      className: 'form-select',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    }, [
      ce('option', { value: 'facebook', textContent: 'Facebook' }),
      ce('option', { value: 'instagram', textContent: 'Instagram' }),
      ce('option', { value: 'linkedin', textContent: 'LinkedIn' }),
      ce('option', { value: 'youtube', textContent: 'YouTube' }),
      ce('option', { value: 'tiktok', textContent: 'TikTok' }),
      ce('option', { value: 'x', textContent: 'X / Twitter' }),
      ce('option', { value: 'pinterest', textContent: 'Pinterest' }),
      ce('option', { value: 'other', textContent: 'Sonstige' })
    ]);
    platformSelect.value = data.platform || 'facebook';

    const valueInput = ce('input', {
      type: 'text',
      name: 'social_value',
      className: 'form-input',
      placeholder: 'z.B. facebook.com/meinbetrieb',
      value: data.value || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '8px',
      'style.lineHeight': '1'
    });
    removeBtn.addEventListener('click', () => row.remove());

    row.append(platformSelect, valueInput, removeBtn);
    container.append(row);
  }

  _renderLocationRow(container, data = {}) {
    const row = ce('div', {
      className: 'location-row',
      'style.background': 'rgba(255, 255, 255, 0.01)',
      'style.padding': '16px',
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.05)',
      'style.marginBottom': '16px',
      'style.position': 'relative'
    });

    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️ Standort entfernen',
      'style.position': 'absolute',
      'style.top': '16px',
      'style.right': '16px',
      'style.padding': '4px 8px',
      'style.fontSize': '11px'
    });
    removeBtn.addEventListener('click', () => row.remove());

    const typeSelect = ce('select', {
      name: 'loc_type',
      className: 'form-select',
      'style.width': '180px',
      'style.boxSizing': 'border-box'
    }, [
      ce('option', { value: 'main', textContent: 'Hauptstandort' }),
      ce('option', { value: 'secondary', textContent: 'Nebenstandort' }),
      ce('option', { value: 'office', textContent: 'Büro' }),
      ce('option', { value: 'warehouse', textContent: 'Lager' }),
      ce('option', { value: 'workshop', textContent: 'Werkstatt' }),
      ce('option', { value: 'branch', textContent: 'Filiale' }),
      ce('option', { value: 'factory', textContent: 'Fabrik' }),
      ce('option', { value: 'other', textContent: 'Sonstiges' })
    ]);
    typeSelect.value = data.type || 'main';

    const nameInput = ce('input', {
      type: 'text',
      name: 'loc_name',
      className: 'form-input',
      placeholder: 'z.B. Zentrale Graz, Zweigstelle Linz',
      value: data.name || '',
      required: 'true',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const streetInput = ce('input', {
      type: 'text',
      name: 'loc_street',
      className: 'form-input',
      placeholder: 'Straße & Hausnummer',
      value: data.street || '',
      required: 'true',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const zipInput = ce('input', {
      type: 'text',
      name: 'loc_zip',
      className: 'form-input',
      placeholder: 'PLZ',
      value: data.zip || '',
      required: 'true',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const cityInput = ce('input', {
      type: 'text',
      name: 'loc_city',
      className: 'form-input',
      placeholder: 'Stadt',
      value: data.city || '',
      required: 'true',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });

    const countrySelect = ce('select', {
      name: 'loc_country',
      className: 'form-select',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    }, [
      ce('option', { value: 'AT', textContent: 'AT' }),
      ce('option', { value: 'DE', textContent: 'DE' }),
      ce('option', { value: 'CH', textContent: 'CH' })
    ]);
    countrySelect.value = data.country || 'AT';

    typeSelect.addEventListener('change', () => this._syncLocationsToContacts());
    nameInput.addEventListener('input', () => this._syncLocationsToContacts());

    const phoneInput = ce('input', {
      type: 'text',
      name: 'loc_phone',
      className: 'form-input',
      placeholder: 'Telefonnummer',
      value: data.phone || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    phoneInput.addEventListener('input', () => this._syncLocationsToContacts());

    const emailInput = ce('input', {
      type: 'email',
      name: 'loc_email',
      className: 'form-input',
      placeholder: 'E-Mail-Adresse',
      value: data.email || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    emailInput.addEventListener('input', () => this._syncLocationsToContacts());

    const addressGrid = ce('div', {
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 2fr 1fr',
      'style.gap': 'var(--spacing-xs)',
      'style.marginTop': '8px'
    }, [
      this._buildField('PLZ *', zipInput),
      this._buildField('Stadt *', cityInput),
      this._buildField('Land *', countrySelect)
    ]);

    const contactGrid = ce('div', {
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 1fr',
      'style.gap': 'var(--spacing-xs)',
      'style.marginTop': '8px'
    }, [
      this._buildField('Telefon (Standort)', phoneInput),
      this._buildField('E-Mail (Standort)', emailInput)
    ]);

    // Ansprechpartner (Contacts list)
    const contactsContainer = ce('div', {
      className: 'loc-contacts-container',
      'style.marginTop': '12px',
      'style.borderTop': '1px dashed rgba(255, 255, 255, 0.08)',
      'style.paddingTop': '12px'
    });

    const addContactBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Ansprechpartner hinzufügen',
      'style.fontSize': '11px',
      'style.marginTop': '8px'
    });
    addContactBtn.addEventListener('click', () => this._renderLocationContactRow(contactsContainer));

    if (data.contacts && data.contacts.length > 0) {
      data.contacts.forEach(c => this._renderLocationContactRow(contactsContainer, c));
    }

    row.append(
      removeBtn,
      ce('div', { 'style.display': 'flex', 'style.gap': '12px', 'style.width': '75%', 'style.marginBottom': '8px' }, [
        this._buildField('Typ *', typeSelect),
        this._buildField('Bezeichnung *', nameInput)
      ]),
      this._buildField('Straße & Hausnummer *', streetInput),
      addressGrid,
      contactGrid,
      ce('div', { 'style.marginTop': '12px' }, [
        ce('div', { textContent: '👥 Ansprechpartner (Kontakte)', 'style.fontSize': '11px', 'style.fontWeight': '600', 'style.color': 'var(--text-dim)' }),
        contactsContainer,
        addContactBtn
      ])
    );

    container.append(row);
    this._syncLocationsToContacts();
  }

  _renderLocationContactRow(container, data = {}) {
    const row = ce('div', {
      className: 'location-contact-row',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1fr 1fr 1fr 1fr auto',
      'style.gap': '8px',
      'style.alignItems': 'flex-end',
      'style.marginTop': '8px',
      'style.background': 'rgba(255,255,255,0.01)',
      'style.padding': '8px',
      'style.borderRadius': '4px',
      'style.position': 'relative'
    });

    const nameInput = ce('input', {
      type: 'text',
      name: 'loc_contact_name',
      className: 'form-input form-input--sm',
      placeholder: 'Name',
      value: data.name || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    nameInput.addEventListener('input', () => this._syncLocationsToContacts());

    const posInput = ce('input', {
      type: 'text',
      name: 'loc_contact_position',
      className: 'form-input form-input--sm',
      placeholder: 'z.B. Leiter',
      value: data.position || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    posInput.addEventListener('input', () => this._syncLocationsToContacts());

    const phoneInput = ce('input', {
      type: 'text',
      name: 'loc_contact_phone',
      className: 'form-input form-input--sm',
      placeholder: 'Telefon',
      value: data.phone || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    phoneInput.addEventListener('input', () => this._syncLocationsToContacts());

    const emailInput = ce('input', {
      type: 'email',
      name: 'loc_contact_email',
      className: 'form-input form-input--sm',
      placeholder: 'E-Mail',
      value: data.email || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box'
    });
    emailInput.addEventListener('input', () => this._syncLocationsToContacts());

    const removeBtn = ce('button', {
      type: 'button',
      className: 'btn btn--danger btn--sm',
      textContent: '🗑️',
      'style.padding': '6px 10px',
      'style.lineHeight': '1',
      'style.height': '35px'
    });
    removeBtn.addEventListener('click', () => {
      row.remove();
      this._syncLocationsToContacts();
    });

    row.append(
      this._buildField('Name', nameInput),
      this._buildField('Position', posInput),
      this._buildField('Telefon', phoneInput),
      this._buildField('E-Mail', emailInput),
      removeBtn
    );

    container.append(row);
  }

  _syncLocationsToContacts() {
    const root = this.el || document;
    const phonesContainer = root.querySelector('#phones-container');
    const emailsContainer = root.querySelector('#emails-container');
    if (!phonesContainer || !emailsContainer) return;

    // Remove all previous synced rows
    phonesContainer.querySelectorAll('.is-synced').forEach(r => r.remove());
    emailsContainer.querySelectorAll('.is-synced').forEach(r => r.remove());

    // Loop through location rows
    root.querySelectorAll('.location-row').forEach(locRow => {
      const typeSelect = locRow.querySelector('[name="loc_type"]');
      const nameInput = locRow.querySelector('[name="loc_name"]');
      if (!typeSelect || !nameInput) return;

      const typeLabel = typeSelect.options[typeSelect.selectedIndex]?.textContent || typeSelect.value;
      const locName = nameInput.value || '';
      const locLabel = `${typeLabel} ${locName}`.trim();

      // Location Phone
      const locPhoneInput = locRow.querySelector('[name="loc_phone"]');
      if (locPhoneInput && locPhoneInput.value.trim()) {
        this._renderSyncedPhoneRow(phonesContainer, {
          label: locLabel,
          number: locPhoneInput.value.trim()
        });
      }

      // Location Email
      const locEmailInput = locRow.querySelector('[name="loc_email"]');
      if (locEmailInput && locEmailInput.value.trim()) {
        this._renderSyncedEmailRow(emailsContainer, {
          label: locLabel,
          address: locEmailInput.value.trim()
        });
      }

      // Location Contacts
      locRow.querySelectorAll('.location-contact-row').forEach(cRow => {
        const cName = cRow.querySelector('[name="loc_contact_name"]')?.value || '';
        const cPos = cRow.querySelector('[name="loc_contact_position"]')?.value || '';
        const cPhone = cRow.querySelector('[name="loc_contact_phone"]')?.value || '';
        const cEmail = cRow.querySelector('[name="loc_contact_email"]')?.value || '';

        const contactLabelParts = [];
        if (cName) contactLabelParts.push(cName);
        if (cPos) contactLabelParts.push(`(${cPos})`);
        contactLabelParts.push(`- ${locLabel}`);
        const contactLabel = contactLabelParts.join(' ').replace(/\s+/g, ' ').trim();

        if (cPhone.trim()) {
          this._renderSyncedPhoneRow(phonesContainer, {
            label: contactLabel,
            number: cPhone.trim()
          });
        }

        if (cEmail.trim()) {
          this._renderSyncedEmailRow(emailsContainer, {
            label: contactLabel,
            address: cEmail.trim()
          });
        }
      });
    });
    this._renderAddressBook();
  }

  _renderSyncedPhoneRow(container, data = {}) {
    const row = ce('div', { 
      className: 'phone-row is-synced',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1.2fr 1.8fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center',
      'style.opacity': '0.9'
    });
    const labelInput = ce('input', {
      type: 'text',
      className: 'form-input',
      value: data.label || '',
      readOnly: true,
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255,255,255,0.02)',
      'style.color': 'var(--accent-cyan)',
      'style.fontWeight': '600'
    });
    const numberInput = ce('input', {
      type: 'tel',
      className: 'form-input',
      value: data.number || '',
      readOnly: true,
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255,255,255,0.02)'
    });
    const removeBtn = ce('span', {
      textContent: '🔗',
      'style.padding': '8px',
      'style.fontSize': '12px',
      'style.cursor': 'help',
      title: 'Standort-Kontakt (wird automatisch synchronisiert)'
    });
    row.append(labelInput, numberInput, removeBtn);
    container.append(row);
  }

  _renderSyncedEmailRow(container, data = {}) {
    const row = ce('div', { 
      className: 'email-row is-synced',
      'style.display': 'grid',
      'style.gridTemplateColumns': '1.2fr 1.8fr auto',
      'style.gap': 'var(--spacing-xs)',
      'style.marginBottom': '8px',
      'style.alignItems': 'center',
      'style.opacity': '0.9'
    });
    const labelInput = ce('input', {
      type: 'text',
      className: 'form-input',
      value: data.label || '',
      readOnly: true,
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255,255,255,0.02)',
      'style.color': 'var(--accent-cyan)',
      'style.fontWeight': '600'
    });
    const addressInput = ce('input', {
      type: 'email',
      className: 'form-input',
      value: data.address || '',
      readOnly: true,
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.background': 'rgba(255,255,255,0.02)'
    });
    const removeBtn = ce('span', {
      textContent: '🔗',
      'style.padding': '8px',
      'style.fontSize': '12px',
      'style.cursor': 'help',
      title: 'Standort-Kontakt (wird automatisch synchronisiert)'
    });
    row.append(labelInput, addressInput, removeBtn);
    container.append(row);
  }

  _collectCurrentCompanyFromForm() {
    const root = this.el || document;
    
    // Collect locations & contacts
    const locations = [];
    root.querySelectorAll('.location-row').forEach(row => {
      const typeSelect = row.querySelector('[name="loc_type"]');
      const nameInput = row.querySelector('[name="loc_name"]');
      const phoneInput = row.querySelector('[name="loc_phone"]');
      const emailInput = row.querySelector('[name="loc_email"]');
      const streetInput = row.querySelector('[name="loc_street"]');
      const zipInput = row.querySelector('[name="loc_zip"]');
      const cityInput = row.querySelector('[name="loc_city"]');
      const countrySelect = row.querySelector('[name="loc_country"]');
      
      const contacts = [];
      row.querySelectorAll('.location-contact-row').forEach(cRow => {
        contacts.push({
          name: cRow.querySelector('[name="loc_contact_name"]')?.value || '',
          position: cRow.querySelector('[name="loc_contact_position"]')?.value || '',
          phone: cRow.querySelector('[name="loc_contact_phone"]')?.value || '',
          email: cRow.querySelector('[name="loc_contact_email"]')?.value || ''
        });
      });

      locations.push({
        type: typeSelect?.value || 'main',
        name: nameInput?.value || '',
        phone: phoneInput?.value || '',
        email: emailInput?.value || '',
        street: streetInput?.value || '',
        zip: zipInput?.value || '',
        city: cityInput?.value || '',
        country: countrySelect?.value || 'AT',
        contacts: contacts
      });
    });

    // Collect employees (Mitarbeiter)
    const employee_names = [];
    root.querySelectorAll('#employee-names-container .name-row').forEach(row => {
      const name = row.querySelector('[name="person_name"]')?.value?.trim() || '';
      const phone = row.querySelector('[name="person_phone"]')?.value?.trim() || '';
      const email = row.querySelector('[name="person_email"]')?.value?.trim() || '';
      if (name) {
        employee_names.push({ name, phone, email });
      }
    });

    // Collect helpers (Aushilfen)
    const helper_names = [];
    root.querySelectorAll('#helper-names-container .name-row').forEach(row => {
      const name = row.querySelector('[name="person_name"]')?.value?.trim() || '';
      const phone = row.querySelector('[name="person_phone"]')?.value?.trim() || '';
      const email = row.querySelector('[name="person_email"]')?.value?.trim() || '';
      if (name) {
        helper_names.push({ name, phone, email });
      }
    });

    // Collect general phones & emails (excluding synced ones)
    const phones = [];
    root.querySelectorAll('.phone-row').forEach(row => {
      if (!row.classList.contains('is-synced')) {
        const label = row.querySelector('[name="phone_label"]')?.value || '';
        const number = row.querySelector('[name="phone_number"]')?.value || '';
        if (number.trim()) phones.push({ label, number });
      }
    });

    const emails = [];
    root.querySelectorAll('.email-row').forEach(row => {
      if (!row.classList.contains('is-synced')) {
        const label = row.querySelector('[name="email_label"]')?.value || '';
        const address = row.querySelector('[name="email_address"]')?.value || '';
        if (address.trim()) emails.push({ label, address });
      }
    });

    const socials = [];
    root.querySelectorAll('.social-row').forEach(row => {
      const platform = row.querySelector('[name="social_platform"]')?.value || 'facebook';
      const value = row.querySelector('[name="social_value"]')?.value || '';
      if (value.trim()) socials.push({ platform, value });
    });

    return {
      locations,
      employee_names,
      helper_names,
      phones,
      emails,
      socials
    };
  }

  _renderAddressBook() {
    const root = this.el || document;
    const container = root.querySelector('#address-book-container');
    if (!container) return;

    container.innerHTML = '';

    const companyData = this._collectCurrentCompanyFromForm();
    const partners = PartnerModel.getAll() || [];

    // Header Title
    container.append(ce('h3', { 
      textContent: '📖 Strukturiertes Adressverzeichnis', 
      'style.fontSize': '14px', 
      'style.fontWeight': '700', 
      'style.color': 'var(--accent-cyan)',
      'style.marginBottom': '8px'
    }));

    // Search Input Bar
    const searchInput = ce('input', {
      type: 'text',
      className: 'form-input',
      placeholder: '🔍 Kontakte durchsuchen (Name, Ort, Tel, E-Mail, Social, etc.)...',
      value: this._addressBookSearchQuery || '',
      'style.width': '100%',
      'style.boxSizing': 'border-box',
      'style.marginBottom': '16px'
    });
    searchInput.addEventListener('input', (e) => {
      this._addressBookSearchQuery = e.target.value.toLowerCase();
      this._filterAddressBookDOM();
    });
    container.append(searchInput);

    // Sub-Tabs below Search Input
    const tabsContainer = ce('div', {
      className: 'address-book-subtabs',
      'style.display': 'flex',
      'style.gap': '8px',
      'style.marginBottom': '16px',
      'style.flexWrap': 'wrap'
    });

    const subTabConfigs = [
      { id: 'own', label: '🏢 Eigene Firma' },
      { id: 'partners', label: '🤝 Partnerfirmen' },
      { id: 'customers', label: '👤 Kunden' },
      { id: 'other', label: '📁 Sonstige Kontakte' },
      { id: 'all', label: '📇 Alle Kontakte' }
    ];

    const activeSubTab = this._addressBookActiveTab || 'own';

    subTabConfigs.forEach(config => {
      const isActive = config.id === activeSubTab;
      const btn = ce('button', {
        type: 'button',
        className: `btn btn--sm ${isActive ? 'btn--primary' : 'btn--secondary'}`,
        textContent: config.label,
        'style.flex': '1',
        'style.fontSize': '11px',
        'style.padding': '6px 12px'
      });
      
      btn.addEventListener('click', () => {
        this._addressBookActiveTab = config.id;
        // Update active class on buttons
        tabsContainer.querySelectorAll('button').forEach((b, idx) => {
          const cid = subTabConfigs[idx].id;
          if (cid === config.id) {
            b.className = 'btn btn--sm btn--primary';
          } else {
            b.className = 'btn btn--sm btn--secondary';
          }
        });
        this._filterAddressBookDOM();
      });
      
      tabsContainer.append(btn);
    });

    container.append(tabsContainer);

    // Action Button: Add Contact
    const actionBtn = ce('button', {
      type: 'button',
      className: 'btn btn--primary btn--sm',
      textContent: '＋ Kontakt hinzufügen',
      'style.marginBottom': '16px',
      'style.width': '100%',
      'style.fontWeight': '600'
    });
    actionBtn.addEventListener('click', () => {
      const activeTab = this._addressBookActiveTab || 'all';
      this._handleQuickAdd(activeTab);
    });
    container.append(actionBtn);

    const scrollContainer = ce('div', {
      'style.maxHeight': '560px',
      'style.overflowY': 'auto',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '24px',
      'style.paddingRight': '8px'
    });

    // ── SECTION 1: EIGENE FIRMA ──────────────────────────────────────────
    const ownFirmSection = ce('div', {
      id: 'own-firm-section',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    }, [
      ce('h4', { 
        textContent: '🏢 Eigene Firma & Standorte', 
        'style.fontSize': '12px', 
        'style.fontWeight': '700', 
        'style.color': 'var(--text-bright)',
        'style.borderBottom': '1px solid rgba(255,255,255,0.08)',
        'style.paddingBottom': '4px',
        'style.marginBottom': '8px'
      })
    ]);

    if (companyData.locations && companyData.locations.length > 0) {
      companyData.locations.forEach((loc, idx) => {
        const borderColor = loc.type === 'main' ? 'var(--accent-teal)' :
                            loc.type === 'warehouse' ? 'var(--accent-amber)' :
                            (loc.type === 'workshop' || loc.type === 'factory') ? 'var(--accent-red)' : 'var(--accent-cyan)';
        ownFirmSection.append(this._renderLocationAddressBookCard(loc, idx, borderColor));
      });
    } else {
      ownFirmSection.append(ce('div', {
        textContent: 'Keine Standorte für diese Firma erfasst.',
        'style.fontSize': '11px',
        'style.opacity': '0.5',
        'style.padding': '8px'
      }));
    }

    scrollContainer.append(ownFirmSection);

    // ── SECTION 2: PARTNERFIRMEN ─────────────────────────────────────────
    const partnersSection = ce('div', {
      id: 'partners-section',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    }, [
      ce('h4', { 
        textContent: '🤝 B2B Partnernetzwerk & Subunternehmer', 
        'style.fontSize': '12px', 
        'style.fontWeight': '700', 
        'style.color': 'var(--text-bright)',
        'style.borderBottom': '1px solid rgba(255,255,255,0.08)',
        'style.paddingBottom': '4px',
        'style.marginBottom': '8px'
      })
    ]);

    if (partners.length > 0) {
      partners.forEach(p => {
        const statusColors = {
          active: 'var(--accent-emerald)',
          busy: 'var(--accent-amber)',
          inactive: 'var(--accent-red)'
        };
        const statusLabels = {
          active: 'Aktiv / Frei',
          busy: 'Beschäftigt',
          inactive: 'Inaktiv'
        };

        const addressText = `${p.address_street || ''}, ${p.address_zip || ''} ${p.address_city || ''} (${p.address_country || ''})`.trim();
        const cleanAddress = addressText.startsWith(',') ? addressText.substring(1).trim() : addressText;

        const partnerCardData = {
          id: p.id,
          type: 'partner',
          partnerRecord: p,
          title: p.name,
          phone: p.phone,
          email: p.email,
          address: cleanAddress,
          badge: {
            text: statusLabels[p.status] || p.status,
            color: statusColors[p.status] || 'var(--text-dim)'
          }
        };

        partnersSection.append(this._renderAddressBookCard(partnerCardData, 'var(--accent-indigo)'));
      });
    } else {
      partnersSection.append(ce('div', { 
        textContent: 'Keine B2B Partner im Netzwerk registriert.', 
        'style.fontSize': '11px', 
        'style.opacity': '0.5',
        'style.padding': '8px'
      }));
    }

    scrollContainer.append(partnersSection);

    // ── SECTION 3: KUNDENKONTAKTE ─────────────────────────────────────────
    const customersSection = ce('div', {
      id: 'customers-section',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    }, [
      ce('h4', { 
        textContent: '👤 Kundenkontakte (Aufträge & Rechnungen)', 
        'style.fontSize': '12px', 
        'style.fontWeight': '700', 
        'style.color': 'var(--text-bright)',
        'style.borderBottom': '1px solid rgba(255,255,255,0.08)',
        'style.paddingBottom': '4px',
        'style.marginBottom': '8px'
      })
    ]);

    // Gather Customer Contacts (Kundenkontakte)
    const customerMap = new Map();
    
    // Process from CustomerModel database
    try {
      const dbCusts = CustomerModel.getAll() || [];
      dbCusts.forEach(c => {
        if (!c.name || !c.name.trim()) return;
        const nameKey = c.name.trim().toLowerCase();
        const addressText = `${c.street || ''}, ${c.zip || ''} ${c.city || ''} (${c.country || ''})`.trim();
        const cleanAddress = addressText.startsWith(',') ? addressText.substring(1).trim() : addressText;

        if (!customerMap.has(nameKey)) {
          customerMap.set(nameKey, {
            id: c.id,
            name: c.name.trim(),
            phones: new Set(),
            emails: new Set(),
            addresses: new Set(),
            sources: new Set(['Datenbank']),
            dbRecord: c
          });
        }
        const cust = customerMap.get(nameKey);
        if (c.phone && c.phone.trim()) cust.phones.add(c.phone.trim());
        if (c.email && c.email.trim()) cust.emails.add(c.email.trim());
        if (cleanAddress && cleanAddress.replace(/, /g, '').replace(/\(.*\)/g, '').trim()) cust.addresses.add(cleanAddress);
      });
    } catch (e) {
      console.warn("Failed to load customer database:", e);
    }

    // Process from Orders
    try {
      const orders = OrderModel.getAll() || [];
      orders.forEach(o => {
        if (!o.caller_name || !o.caller_name.trim()) return;
        const nameKey = o.caller_name.trim().toLowerCase();
        const addressParts = [];
        if (o.strasse) addressParts.push(o.strasse.trim());
        if (o.plz || o.ort) {
          addressParts.push(`${o.plz || ''} ${o.ort || ''}`.trim());
        }
        if (o.land) addressParts.push(o.land.trim());
        const cleanAddress = addressParts.join(', ');
        
        if (!customerMap.has(nameKey)) {
          customerMap.set(nameKey, {
            name: o.caller_name.trim(),
            phones: new Set(),
            emails: new Set(),
            addresses: new Set(),
            sources: new Set(['Aufträge'])
          });
        }
        
        const cust = customerMap.get(nameKey);
        if (o.telefon && o.telefon.trim()) cust.phones.add(o.telefon.trim());
        if (cleanAddress && cleanAddress.replace(/, /g, '').trim()) cust.addresses.add(cleanAddress);
        cust.sources.add('Aufträge');
      });
    } catch (e) {
      console.warn("Failed to load customer orders:", e);
    }
    
    // Process from Invoices
    try {
      const invoices = InvoiceModel.getAll() || [];
      invoices.forEach(inv => {
        if (!inv.client_name || !inv.client_name.trim()) return;
        const nameKey = inv.client_name.trim().toLowerCase();
        
        if (!customerMap.has(nameKey)) {
          customerMap.set(nameKey, {
            name: inv.client_name.trim(),
            phones: new Set(),
            emails: new Set(),
            addresses: new Set(),
            sources: new Set(['Rechnungen'])
          });
        }
        
        const cust = customerMap.get(nameKey);
        if (inv.client_email && inv.client_email.trim()) cust.emails.add(inv.client_email.trim());
        cust.sources.add('Rechnungen');
      });
    } catch (e) {
      console.warn("Failed to load customer invoices:", e);
    }

    const customersList = Array.from(customerMap.values()).map(c => ({
      id: c.id || null,
      type: 'customer',
      dbRecord: c.dbRecord || null,
      title: c.name,
      phones: Array.from(c.phones).map(p => ({ label: 'Tel', number: p })),
      emails: Array.from(c.emails).map(e => ({ label: 'Mail', address: e })),
      address: Array.from(c.addresses).join(' / '),
      subtitle: `Kunde (${Array.from(c.sources).join(', ')})`,
      socials: c.dbRecord ? (c.dbRecord.socials || []) : []
    }));

    if (customersList.length > 0) {
      customersList.forEach(cust => {
        customersSection.append(this._renderAddressBookCard(cust, 'var(--accent-pink)'));
      });
    } else {
      customersSection.append(ce('div', { 
        textContent: 'Keine Kundenkontakte erfasst.', 
        'style.fontSize': '11px', 
        'style.opacity': '0.5',
        'style.padding': '8px'
      }));
    }

    scrollContainer.append(customersSection);

    // ── SECTION 4: SONSTIGE KONTAKTE ─────────────────────────────────────
    const otherSection = ce('div', {
      id: 'other-section',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    }, [
      ce('h4', { 
        textContent: '📁 Sonstige Kontakte (z.B. Immomakler, Planer)', 
        'style.fontSize': '12px', 
        'style.fontWeight': '700', 
        'style.color': 'var(--text-bright)',
        'style.borderBottom': '1px solid rgba(255,255,255,0.08)',
        'style.paddingBottom': '4px',
        'style.marginBottom': '8px'
      })
    ]);

    try {
      const others = OtherContactModel.getAll() || [];
      if (others.length > 0) {
        others.forEach(oth => {
          const addressText = `${oth.address_street || ''}, ${oth.address_zip || ''} ${oth.address_city || ''} (${oth.address_country || 'AT'})`.trim();
          const cleanAddress = addressText.startsWith(',') ? addressText.substring(1).trim() : addressText;

          const cardData = {
            id: oth.id,
            type: 'other',
            otherRecord: oth,
            title: oth.name,
            subtitle: oth.type || 'Sonstiges',
            phone: oth.phone,
            email: oth.email,
            address: cleanAddress,
            socials: oth.socials || []
          };

          otherSection.append(this._renderAddressBookCard(cardData, 'var(--accent-amber)'));
        });
      } else {
        otherSection.append(ce('div', {
          textContent: 'Keine sonstigen Kontakte erfasst.',
          'style.fontSize': '11px',
          'style.opacity': '0.5',
          'style.padding': '8px'
        }));
      }
    } catch (e) {
      console.warn("Failed to load other contacts:", e);
    }

    scrollContainer.append(otherSection);
    container.append(scrollContainer);

    this._filterAddressBookDOM();
  }

  _filterAddressBookDOM() {
    const root = this.el || document;
    const query = (this._addressBookSearchQuery || '').trim().toLowerCase();
    const activeTab = this._addressBookActiveTab || 'all';
    
    // Hide/show sections based on active tab
    const ownSec = root.querySelector('#own-firm-section');
    const partSec = root.querySelector('#partners-section');
    const custSec = root.querySelector('#customers-section');
    const othSec = root.querySelector('#other-section');
    
    if (ownSec) ownSec.style.display = (activeTab === 'all' || activeTab === 'own') ? 'flex' : 'none';
    if (partSec) partSec.style.display = (activeTab === 'all' || activeTab === 'partners') ? 'flex' : 'none';
    if (custSec) custSec.style.display = (activeTab === 'all' || activeTab === 'customers') ? 'flex' : 'none';
    if (othSec) othSec.style.display = (activeTab === 'all' || activeTab === 'other') ? 'flex' : 'none';

    // Filter cards
    const cards = root.querySelectorAll('.address-book-card');
    cards.forEach(card => {
      // If parent section is hidden, card is hidden
      const parentSection = card.closest('#own-firm-section, #partners-section, #customers-section, #other-section');
      if (parentSection && parentSection.style.display === 'none') {
        card.style.display = 'none';
        return;
      }

      if (!query) {
        card.style.display = 'flex';
        return;
      }
      
      const text = card.textContent.toLowerCase();
      let matchesLink = false;
      card.querySelectorAll('a').forEach(a => {
        if (a.getAttribute('href')?.toLowerCase().includes(query)) {
          matchesLink = true;
        }
      });
      
      if (text.includes(query) || matchesLink) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Hide/show category subheadings if they have no visible cards
    const catGroups = root.querySelectorAll('.address-book-cat-group');
    catGroups.forEach(group => {
      const parentSection = group.closest('#own-firm-section');
      if (parentSection && parentSection.style.display === 'none') {
        group.style.display = 'none';
        return;
      }
      
      const visibleCards = Array.from(group.querySelectorAll('.address-book-card')).filter(c => c.style.display !== 'none');
      if (visibleCards.length > 0) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });
  }

  _showQuickModal(title, fields, onSave) {
    const root = this.el || document;
    
    const overlay = ce('div', {
      className: 'modal-overlay',
      'style.position': 'fixed',
      'style.top': '0',
      'style.left': '0',
      'style.width': '100vw',
      'style.height': '100vh',
      'style.background': 'rgba(0, 0, 0, 0.75)',
      'style.backdropFilter': 'blur(10px)',
      'style.display': 'flex',
      'style.justifyContent': 'center',
      'style.alignItems': 'flex-start',
      'style.overflowY': 'auto',
      'style.padding': '20px',
      'style.zIndex': '100000'
    });

    const content = ce('div', {
      className: 'modal-content',
      'style.background': '#121216',
      'style.border': '1px solid rgba(255, 255, 255, 0.08)',
      'style.boxShadow': '0 20px 40px rgba(0,0,0,0.5)',
      'style.borderRadius': '12px',
      'style.width': '500px',
      'style.maxWidth': '90%',
      'style.maxHeight': '90vh',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.margin': 'auto'
    });

    const header = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center',
      'style.borderBottom': '1px solid rgba(255,255,255,0.06)',
      'style.padding': '16px 24px'
    }, [
      ce('h3', { textContent: title, 'style.fontSize': '15px', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)' }),
      ce('button', {
        className: 'btn btn--secondary btn--sm',
        textContent: '✕',
        'style.padding': '4px 8px'
      })
    ]);
    header.querySelector('button').addEventListener('click', () => overlay.remove());

    const body = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px',
      'style.padding': '20px 24px',
      'style.overflowY': 'auto'
    });

    const inputs = {};
    fields.forEach(f => {
      const fieldDiv = ce('div', {});
      fieldDiv.append(ce('label', { 
        className: 'form-label', 
        textContent: f.label, 
        'style.display': 'block', 
        'style.marginBottom': '6px',
        'style.fontSize': '11px'
      }));

      let inputEl;
      if (f.type === 'select') {
        inputEl = ce('select', { className: 'form-select', 'style.width': '100%' }, 
          f.options.map(opt => ce('option', { value: opt.value, textContent: opt.label }))
        );
      } else {
        inputEl = ce('input', {
          type: f.type || 'text',
          className: 'form-input',
          placeholder: f.placeholder || '',
          value: f.value || '',
          'style.width': '100%',
          'style.boxSizing': 'border-box'
        });
      }
      if (f.type === 'select' && f.value) {
        inputEl.value = f.value;
      }
      
      fieldDiv.append(inputEl);
      body.append(fieldDiv);
      inputs[f.key] = inputEl;
    });

    const footer = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'flex-end',
      'style.gap': '12px',
      'style.borderTop': '1px solid rgba(255,255,255,0.06)',
      'style.padding': '16px 24px'
    });

    const cancelBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary',
      textContent: 'Abbrechen'
    });
    cancelBtn.addEventListener('click', () => overlay.remove());

    const saveBtn = ce('button', {
      type: 'button',
      className: 'btn btn--primary',
      textContent: 'Speichern'
    });
    saveBtn.addEventListener('click', () => {
      const data = {};
      Object.keys(inputs).forEach(k => {
        data[k] = inputs[k].value;
      });
      onSave(data);
      overlay.remove();
    });

    footer.append(cancelBtn, saveBtn);
    content.append(header, body, footer);
    overlay.append(content);
    document.body.append(overlay);
  }

  _showForwardOptions(contactName, phone, email, address, subtitle) {
    const textDetails = `Kontakt-Details:\nName: ${contactName}\nKategorie: ${subtitle || ''}\nTelefon: ${phone || 'n.a.'}\nE-Mail: ${email || 'n.a.'}\nAdresse: ${address || 'n.a.'}`;

    const overlay = ce('div', {
      className: 'modal-overlay',
      'style.position': 'fixed',
      'style.top': '0',
      'style.left': '0',
      'style.width': '100vw',
      'style.height': '100vh',
      'style.background': 'rgba(0, 0, 0, 0.75)',
      'style.backdropFilter': 'blur(10px)',
      'style.display': 'flex',
      'style.justifyContent': 'center',
      'style.alignItems': 'center',
      'style.zIndex': '100000'
    });

    const content = ce('div', {
      className: 'modal-content',
      'style.background': '#121216',
      'style.border': '1px solid rgba(255, 255, 255, 0.08)',
      'style.boxShadow': '0 20px 40px rgba(0,0,0,0.5)',
      'style.borderRadius': '12px',
      'style.width': '400px',
      'style.maxWidth': '90%',
      'style.padding': '24px',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '16px'
    });

    const header = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center',
      'style.borderBottom': '1px solid rgba(255,255,255,0.06)',
      'style.paddingBottom': '12px'
    }, [
      ce('h3', { textContent: '➡️ Kontakt weiterleiten', 'style.fontSize': '14px', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)' }),
      ce('button', {
        className: 'btn btn--secondary btn--sm',
        textContent: '✕',
        'style.padding': '4px 8px'
      })
    ]);
    header.querySelector('button').addEventListener('click', () => overlay.remove());

    const body = ce('div', {
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    }, [
      ce('button', {
        className: 'btn btn--secondary',
        textContent: '📋 In die Zwischenablage kopieren',
        'style.textAlign': 'left',
        'style.justifyContent': 'flex-start'
      }),
      ce('button', {
        className: 'btn btn--secondary',
        textContent: '✉️ Per E-Mail versenden',
        'style.textAlign': 'left',
        'style.justifyContent': 'flex-start'
      }),
      ce('div', {
        'style.fontSize': '11px',
        'style.fontWeight': '700',
        'style.color': 'var(--text-dim)',
        'style.marginTop': '8px',
        'style.marginBottom': '4px'
      }, '🤝 An B2B Subunternehmer weiterleiten:'),
      ce('div', {
        id: 'forward-partners-list',
        'style.maxHeight': '150px',
        'style.overflowY': 'auto',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '6px'
      })
    ]);

    body.querySelectorAll('button')[0].addEventListener('click', () => {
      navigator.clipboard.writeText(textDetails).then(() => {
        toast.show('Kontaktdaten in die Zwischenablage kopiert!', 'success');
        overlay.remove();
      });
    });

    body.querySelectorAll('button')[1].addEventListener('click', () => {
      const mailtoUrl = `mailto:?subject=Kontakt-Details: ${encodeURIComponent(contactName)}&body=${encodeURIComponent(textDetails)}`;
      window.open(mailtoUrl, '_blank');
      overlay.remove();
    });

    const partnerListDiv = body.querySelector('#forward-partners-list');
    const partners = PartnerModel.getAll() || [];
    if (partners.length > 0) {
      partners.forEach(p => {
        const pBtn = ce('button', {
          className: 'btn btn--secondary btn--sm',
          textContent: `👤 ${p.name}`,
          'style.textAlign': 'left',
          'style.justifyContent': 'flex-start',
          'style.fontSize': '10px'
        });
        pBtn.addEventListener('click', () => {
          if (!p.email) {
            toast.show(`Dieser Partner hat keine E-Mail-Adresse hinterlegt.`, 'warning');
            return;
          }
          const mailtoUrl = `mailto:${p.email}?subject=Kontaktweiterleitung: ${encodeURIComponent(contactName)}&body=${encodeURIComponent(textDetails)}`;
          window.open(mailtoUrl, '_blank');
          overlay.remove();
        });
        partnerListDiv.append(pBtn);
      });
    } else {
      partnerListDiv.append(ce('div', { 
        textContent: 'Keine Partner registriert.', 
        'style.fontSize': '10px', 
        'style.opacity': '0.5' 
      }));
    }

    content.append(header, body);
    overlay.append(content);
    document.body.append(overlay);
  }

  _handleQuickAdd(activeTab) {
    const root = this.el || document;
    if (activeTab === 'own') {
      this._showLocationFormModal();
    } else if (activeTab === 'partners') {
      this._showPartnerFormModal();
    } else if (activeTab === 'customers') {
      this._showCustomerFormModal();
    } else if (activeTab === 'other') {
      this._showOtherContactFormModal();
    } else {
      // 'all' / fallback: Show choice dialog
      const overlay = ce('div', {
        className: 'modal-overlay',
        'style.position': 'fixed',
        'style.top': '0',
        'style.left': '0',
        'style.width': '100vw',
        'style.height': '100vh',
        'style.background': 'rgba(0, 0, 0, 0.75)',
        'style.backdropFilter': 'blur(10px)',
        'style.display': 'flex',
        'style.justifyContent': 'center',
        'style.alignItems': 'flex-start',
        'style.overflowY': 'auto',
        'style.padding': '20px',
        'style.zIndex': '100000'
      });

      const content = ce('div', {
        className: 'modal-content',
        'style.background': '#121216',
        'style.border': '1px solid rgba(255, 255, 255, 0.08)',
        'style.borderRadius': '12px',
        'style.width': '350px',
        'style.padding': '24px',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '12px',
        'style.margin': 'auto'
      });

      const header = ce('h3', { textContent: '＋ Kontakt hinzufügen', 'style.fontSize': '14px', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)' });
      
      const btnLoc = ce('button', { className: 'btn btn--secondary', textContent: '🏢 Neuer Standort (Eigene Firma)' });
      btnLoc.addEventListener('click', () => {
        overlay.remove();
        this._showLocationFormModal();
      });

      const btnPart = ce('button', { className: 'btn btn--secondary', textContent: '🤝 Neue Partnerfirma' });
      btnPart.addEventListener('click', () => {
        overlay.remove();
        this._showPartnerFormModal();
      });

      const btnCust = ce('button', { className: 'btn btn--secondary', textContent: '👤 Neuer Kunde' });
      btnCust.addEventListener('click', () => {
        overlay.remove();
        this._showCustomerFormModal();
      });

      const btnOth = ce('button', { className: 'btn btn--secondary', textContent: '📁 Sonstiger Kontakt' });
      btnOth.addEventListener('click', () => {
        overlay.remove();
        this._showOtherContactFormModal();
      });

      const btnClose = ce('button', { className: 'btn btn--secondary btn--sm', textContent: 'Abbrechen', 'style.marginTop': '12px' });
      btnClose.addEventListener('click', () => overlay.remove());

      content.append(header, btnLoc, btnPart, btnCust, btnOth, btnClose);
      overlay.append(content);
      document.body.append(overlay);
    }
  }

  _showPartnerFormModal(partnerData = {}) {
    const socMap = {};
    (partnerData.socials || []).forEach(s => { socMap[s.platform] = s.value; });

    const fields = [
      { key: 'name', label: 'Partner Name', value: partnerData.name || '', placeholder: 'z.B. Spedition Gruber' },
      { key: 'email', label: 'E-Mail', value: partnerData.email || '', placeholder: 'partner@example.com' },
      { key: 'phone', label: 'Telefon', value: partnerData.phone || '', placeholder: '+43 664...' },
      { key: 'status', label: 'Status', type: 'select', value: partnerData.status || 'active', options: [
        { value: 'active', label: 'Aktiv / Frei' },
        { value: 'busy', label: 'Beschäftigt' },
        { value: 'inactive', label: 'Inaktiv' }
      ]},
      { key: 'address_street', label: 'Straße', value: partnerData.address_street || '' },
      { key: 'address_city', label: 'Ort', value: partnerData.address_city || '' },
      { key: 'address_zip', label: 'PLZ', value: partnerData.address_zip || '' },
      { key: 'address_country', label: 'Land', type: 'select', value: partnerData.address_country || 'AT', options: [
        { value: 'AT', label: 'Österreich (AT)' },
        { value: 'DE', label: 'Deutschland (DE)' },
        { value: 'CH', label: 'Schweiz (CH)' }
      ]},
      { key: 'soc_facebook', label: 'Facebook Handle/URL', value: socMap.facebook || '' },
      { key: 'soc_instagram', label: 'Instagram Handle/URL', value: socMap.instagram || '' },
      { key: 'soc_linkedin', label: 'LinkedIn URL', value: socMap.linkedin || '' },
      { key: 'soc_youtube', label: 'YouTube URL', value: socMap.youtube || '' },
      { key: 'soc_x', label: 'X (Twitter) Handle', value: socMap.x || '' }
    ];

    this._showQuickModal(
      partnerData.id ? '🤝 Partnerfirma bearbeiten' : '🤝 Partnerfirma hinzufügen',
      fields,
      (data) => {
        const gatheredSocials = [];
        ['facebook', 'instagram', 'linkedin', 'youtube', 'x'].forEach(plat => {
          const val = data[`soc_${plat}`];
          if (val && val.trim()) {
            gatheredSocials.push({ platform: plat, value: val.trim() });
          }
          delete data[`soc_${plat}`];
        });
        data.socials = gatheredSocials;

        const payload = partnerData.id ? { ...partnerData, ...data } : data;
        PartnerModel.save(payload);
        toast.show('B2B Partner erfolgreich gespeichert.', 'success');
        this._renderAddressBook();
      }
    );
  }

  _showCustomerFormModal(customerData = {}) {
    const socMap = {};
    (customerData.socials || []).forEach(s => { socMap[s.platform] = s.value; });

    const fields = [
      { key: 'name', label: 'Kunden Name', value: customerData.name || '', placeholder: 'z.B. Max Mustermann' },
      { key: 'email', label: 'E-Mail', value: customerData.email || '', placeholder: 'kunde@example.com' },
      { key: 'phone', label: 'Telefon', value: customerData.phone || '', placeholder: '+43...' },
      { key: 'street', label: 'Straße', value: customerData.street || '' },
      { key: 'city', label: 'Ort', value: customerData.city || '' },
      { key: 'zip', label: 'PLZ', value: customerData.zip || '' },
      { key: 'country', label: 'Land', type: 'select', value: customerData.country || 'AT', options: [
        { value: 'AT', label: 'Österreich (AT)' },
        { value: 'DE', label: 'Deutschland (DE)' },
        { value: 'CH', label: 'Schweiz (CH)' }
      ]},
      { key: 'notes', label: 'Notizen', value: customerData.notes || '' },
      { key: 'soc_facebook', label: 'Facebook Handle/URL', value: socMap.facebook || '' },
      { key: 'soc_instagram', label: 'Instagram Handle/URL', value: socMap.instagram || '' },
      { key: 'soc_linkedin', label: 'LinkedIn URL', value: socMap.linkedin || '' },
      { key: 'soc_youtube', label: 'YouTube URL', value: socMap.youtube || '' },
      { key: 'soc_x', label: 'X (Twitter) Handle', value: socMap.x || '' }
    ];

    this._showQuickModal(
      customerData.id ? '👤 Kunde bearbeiten' : '👤 Kunde hinzufügen',
      fields,
      (data) => {
        const gatheredSocials = [];
        ['facebook', 'instagram', 'linkedin', 'youtube', 'x'].forEach(plat => {
          const val = data[`soc_${plat}`];
          if (val && val.trim()) {
            gatheredSocials.push({ platform: plat, value: val.trim() });
          }
          delete data[`soc_${plat}`];
        });
        data.socials = gatheredSocials;

        const payload = customerData.id ? { ...customerData, ...data } : data;
        CustomerModel.save(payload);
        toast.show('Kundenkontakt erfolgreich gespeichert.', 'success');
        this._renderAddressBook();
      }
    );
  }

  _showOtherContactFormModal(otherData = {}) {
    const socMap = {};
    (otherData.socials || []).forEach(s => { socMap[s.platform] = s.value; });

    const fields = [
      { key: 'name', label: 'Name des Kontakts', value: otherData.name || '', placeholder: 'z.B. Immomakler Müller' },
      { key: 'type', label: 'Bezeichnung / Rolle', value: otherData.type || '', placeholder: 'z.B. Immomakler, Planer, Lieferant' },
      { key: 'email', label: 'E-Mail-Adresse', value: otherData.email || '', placeholder: 'office@example.com' },
      { key: 'phone', label: 'Telefonnummer', value: otherData.phone || '', placeholder: '+43...' },
      { key: 'address_street', label: 'Straße', value: otherData.address_street || '' },
      { key: 'address_city', label: 'Ort', value: otherData.address_city || '' },
      { key: 'address_zip', label: 'PLZ', value: otherData.address_zip || '' },
      { key: 'address_country', label: 'Land', type: 'select', value: otherData.address_country || 'AT', options: [
        { value: 'AT', label: 'Österreich (AT)' },
        { value: 'DE', label: 'Deutschland (DE)' },
        { value: 'CH', label: 'Schweiz (CH)' }
      ]},
      { key: 'soc_facebook', label: 'Facebook Handle/URL', value: socMap.facebook || '' },
      { key: 'soc_instagram', label: 'Instagram Handle/URL', value: socMap.instagram || '' },
      { key: 'soc_linkedin', label: 'LinkedIn URL', value: socMap.linkedin || '' },
      { key: 'soc_youtube', label: 'YouTube URL', value: socMap.youtube || '' },
      { key: 'soc_x', label: 'X (Twitter) Handle', value: socMap.x || '' }
    ];

    this._showQuickModal(
      otherData.id ? '📁 Sonstigen Kontakt bearbeiten' : '📁 Sonstigen Kontakt hinzufügen',
      fields,
      (data) => {
        const gatheredSocials = [];
        ['facebook', 'instagram', 'linkedin', 'youtube', 'x'].forEach(plat => {
          const val = data[`soc_${plat}`];
          if (val && val.trim()) {
            gatheredSocials.push({ platform: plat, value: val.trim() });
          }
          delete data[`soc_${plat}`];
        });
        data.socials = gatheredSocials;

        const payload = otherData.id ? { ...otherData, ...data } : data;
        OtherContactModel.save(payload);
        toast.show('Kontakt erfolgreich gespeichert.', 'success');
        this._renderAddressBook();
      }
    );
  }

  _showLocationFormModal(index = null) {
    const company = CompanyModel.getActiveCompany();
    const root = this.el || document;
    const isNew = index === null;
    const loc = isNew ? {
      type: 'secondary',
      name: '',
      street: '',
      zip: '',
      city: '',
      country: 'AT',
      phone: '',
      email: '',
      website: '',
      socials: [],
      accounting: { name: '', phone: '', email: '', street: '', zip: '', city: '', country: 'AT' },
      staff: []
    } : company.locations[index];

    const overlay = ce('div', {
      className: 'modal-overlay',
      'style.position': 'fixed',
      'style.top': '0',
      'style.left': '0',
      'style.width': '100vw',
      'style.height': '100vh',
      'style.background': 'rgba(0, 0, 0, 0.75)',
      'style.backdropFilter': 'blur(10px)',
      'style.display': 'flex',
      'style.justifyContent': 'center',
      'style.alignItems': 'flex-start',
      'style.overflowY': 'auto',
      'style.padding': '20px',
      'style.zIndex': '100000'
    });

    const content = ce('div', {
      className: 'modal-content',
      'style.background': '#121216',
      'style.border': '1px solid rgba(255, 255, 255, 0.08)',
      'style.boxShadow': '0 20px 40px rgba(0,0,0,0.5)',
      'style.borderRadius': '12px',
      'style.width': '650px',
      'style.maxWidth': '95%',
      'style.maxHeight': '90vh',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.margin': 'auto'
    });

    const header = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center',
      'style.borderBottom': '1px solid rgba(255,255,255,0.06)',
      'style.padding': '16px 24px'
    }, [
      ce('h3', { textContent: isNew ? '🏢 Neuer Standort hinzufügen' : '🏢 Standort bearbeiten', 'style.fontSize': '15px', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)' }),
      ce('button', {
        className: 'btn btn--secondary btn--sm',
        textContent: '✕',
        'style.padding': '4px 8px'
      })
    ]);
    header.querySelector('button').addEventListener('click', () => overlay.remove());

    const body = ce('div', {
      'style.padding': '20px 24px',
      'style.overflowY': 'auto',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '20px'
    });

    // --- Tab 1: Basisdaten ---
    const section1 = ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '12px' }, [
      ce('div', { textContent: '📍 Standort Basisdaten', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)', 'style.borderBottom': '1px solid rgba(255,255,255,0.05)', 'style.paddingBottom': '4px' }),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Name des Standorts', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-name', className: 'form-input', value: loc.name || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Typ des Standorts', 'style.fontSize': '11px' }),
          ce('select', { id: 'loc-form-type', className: 'form-select', 'style.width': '100%' }, [
            ce('option', { value: 'main', textContent: 'Hauptstandort / Zentrale', selected: loc.type === 'main' }),
            ce('option', { value: 'secondary', textContent: 'Nebenstandort', selected: loc.type === 'secondary' }),
            ce('option', { value: 'office', textContent: 'Büro', selected: loc.type === 'office' }),
            ce('option', { value: 'warehouse', textContent: 'Lager', selected: loc.type === 'warehouse' }),
            ce('option', { value: 'workshop', textContent: 'Werkstatt', selected: loc.type === 'workshop' }),
            ce('option', { value: 'branch', textContent: 'Filiale', selected: loc.type === 'branch' }),
            ce('option', { value: 'factory', textContent: 'Fabrik', selected: loc.type === 'factory' })
          ])
        ])
      ]),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '2fr 1fr 1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Straße', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-street', className: 'form-input', value: loc.street || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'PLZ', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-zip', className: 'form-input', value: loc.zip || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Ort', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-city', className: 'form-input', value: loc.city || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Land', 'style.fontSize': '11px' }),
          ce('select', { id: 'loc-form-country', className: 'form-select', 'style.width': '100%' }, [
            ce('option', { value: 'AT', textContent: 'AT', selected: loc.country === 'AT' }),
            ce('option', { value: 'DE', textContent: 'DE', selected: loc.country === 'DE' }),
            ce('option', { value: 'CH', textContent: 'CH', selected: loc.country === 'CH' })
          ])
        ])
      ]),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Telefon', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-phone', className: 'form-input', value: loc.phone || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'E-Mail', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-email', className: 'form-input', value: loc.email || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Webadresse', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-form-website', className: 'form-input', value: loc.website || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ])
      ])
    ]);

    const socMap = {};
    (loc.socials || []).forEach(s => { socMap[s.platform] = s.value; });

    const socialsSection = ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '12px' }, [
      ce('div', { textContent: '📱 Social Media Kanäle', 'style.fontWeight': '700', 'style.color': 'var(--accent-cyan)', 'style.borderBottom': '1px solid rgba(255,255,255,0.05)', 'style.paddingBottom': '4px' }),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Facebook Handle/URL', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-soc-facebook', className: 'form-input', value: socMap.facebook || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Instagram Handle/URL', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-soc-instagram', className: 'form-input', value: socMap.instagram || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'LinkedIn URL', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-soc-linkedin', className: 'form-input', value: socMap.linkedin || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'YouTube URL', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-soc-youtube', className: 'form-input', value: socMap.youtube || '', 'style.width': '100%', 'style.boxSizing': 'border-box' }),
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'X (Twitter) Handle', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-soc-x', className: 'form-input', value: socMap.x || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ])
      ])
    ]);

    // --- Tab 2: Rechnungswesen ---
    const accData = loc.accounting || {};
    const section2 = ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '12px' }, [
      ce('div', { textContent: '💳 Rechnungswesen / Buchhaltung', 'style.fontWeight': '700', 'style.color': 'var(--accent-purple)', 'style.borderBottom': '1px solid rgba(255,255,255,0.05)', 'style.paddingBottom': '4px' }),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Ansprechpartner Name', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-name', className: 'form-input', value: accData.name || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Telefonnummer', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-phone', className: 'form-input', value: accData.phone || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ])
      ]),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'E-Mail-Adresse', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-email', className: 'form-input', value: accData.email || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Rechnungsanschrift (Straße)', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-street', className: 'form-input', value: accData.street || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ])
      ]),
      ce('div', { 'style.display': 'grid', 'style.gridTemplateColumns': '1fr 1fr 1fr', 'style.gap': '12px' }, [
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'PLZ', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-zip', className: 'form-input', value: accData.zip || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Ort', 'style.fontSize': '11px' }),
          ce('input', { id: 'loc-acc-city', className: 'form-input', value: accData.city || '', 'style.width': '100%', 'style.boxSizing': 'border-box' })
        ]),
        ce('div', {}, [
          ce('label', { className: 'form-label', textContent: 'Land', 'style.fontSize': '11px' }),
          ce('select', { id: 'loc-acc-country', className: 'form-select', 'style.width': '100%' }, [
            ce('option', { value: 'AT', textContent: 'AT', selected: accData.country === 'AT' }),
            ce('option', { value: 'DE', textContent: 'DE', selected: accData.country === 'DE' }),
            ce('option', { value: 'CH', textContent: 'CH', selected: accData.country === 'CH' })
          ])
        ])
      ])
    ]);

    // --- Tab 3: Mitarbeiter ---
    const staffContainer = ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '10px' });

    const addStaffRow = (s = {}) => {
      const row = ce('div', {
        className: 'loc-staff-row',
        'style.display': 'grid',
        'style.gridTemplateColumns': '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr auto',
        'style.gap': '8px',
        'style.alignItems': 'center',
        'style.background': 'rgba(255,255,255,0.01)',
        'style.padding': '8px',
        'style.borderRadius': '4px',
        'style.border': '1px solid rgba(255,255,255,0.03)'
      });

      const inpName = ce('input', { placeholder: 'Name', className: 'form-input', value: s.name || '', 'style.width': '100%', 'style.boxSizing': 'border-box' });
      
      const selType = ce('select', { className: 'form-select', 'style.width': '100%' }, [
        ce('option', { value: 'employed', textContent: 'Angestellt', selected: s.type === 'employed' }),
        ce('option', { value: 'freelancer', textContent: 'Freier Dienstnehmer', selected: s.type === 'freelancer' }),
        ce('option', { value: 'helper', textContent: 'Aushilfe', selected: s.type === 'helper' }),
        ce('option', { value: 'other', textContent: 'Sonstiges', selected: s.type === 'other' })
      ]);

      const inpPhone = ce('input', { placeholder: 'Telefon', className: 'form-input', value: s.phone || '', 'style.width': '100%', 'style.boxSizing': 'border-box' });
      const inpEmail = ce('input', { placeholder: 'E-Mail', className: 'form-input', value: s.email || '', 'style.width': '100%', 'style.boxSizing': 'border-box' });
      
      const chkEmergency = ce('input', { type: 'checkbox', checked: s.is_emergency || false });
      const divEmergency = ce('div', { 'style.display': 'flex', 'style.justifyContent': 'center' }, [chkEmergency]);

      const chkHoliday = ce('input', { type: 'checkbox', checked: s.is_holiday_replacement || false });
      const divHoliday = ce('div', { 'style.display': 'flex', 'style.justifyContent': 'center' }, [chkHoliday]);

      const btnDel = ce('button', {
        type: 'button',
        className: 'btn btn--secondary btn--sm',
        textContent: '🗑️',
        'style.padding': '4px 8px'
      });
      btnDel.addEventListener('click', () => row.remove());

      row.append(inpName, selType, inpPhone, inpEmail, divEmergency, divHoliday, btnDel);
      staffContainer.append(row);
    };

    (loc.staff || []).forEach(s => addStaffRow(s));

    const btnAddStaff = ce('button', {
      type: 'button',
      className: 'btn btn--secondary btn--sm',
      textContent: '＋ Mitarbeiter hinzufügen',
      'style.marginTop': '8px'
    });
    btnAddStaff.addEventListener('click', () => addStaffRow());

    const section3 = ce('div', { 'style.display': 'flex', 'style.flexDirection': 'column', 'style.gap': '12px' }, [
      ce('div', { 'style.display': 'flex', 'style.justifyContent': 'space-between', 'style.alignItems': 'center', 'style.borderBottom': '1px solid rgba(255,255,255,0.05)', 'style.paddingBottom': '4px' }, [
        ce('div', { textContent: '👥 Mitarbeiter & Personal', 'style.fontWeight': '700', 'style.color': 'var(--accent-emerald)' }),
        btnAddStaff
      ]),
      ce('div', {
        'style.display': 'grid',
        'style.gridTemplateColumns': '2fr 1.5fr 1.5fr 1.5fr 1fr 1fr auto',
        'style.gap': '8px',
        'style.fontSize': '9px',
        'style.fontWeight': '700',
        'style.color': 'var(--text-dim)',
        'style.padding': '0 8px'
      }, [
        ce('div', { textContent: 'NAME' }),
        ce('div', { textContent: 'VERTRAGSTYP' }),
        ce('div', { textContent: 'TELEFON' }),
        ce('div', { textContent: 'E-MAIL' }),
        ce('div', { textContent: 'NOTDIENST', 'style.textAlign': 'center' }),
        ce('div', { textContent: 'VERTRETUNG', 'style.textAlign': 'center' }),
        ce('div', { textContent: '' })
      ]),
      staffContainer
    ]);

    body.append(section1, socialsSection, section2, section3);

    const footer = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'flex-end',
      'style.gap': '12px',
      'style.borderTop': '1px solid rgba(255,255,255,0.06)',
      'style.padding': '16px 24px'
    });

    const cancelBtn = ce('button', {
      type: 'button',
      className: 'btn btn--secondary',
      textContent: 'Abbrechen'
    });
    cancelBtn.addEventListener('click', () => overlay.remove());

    const saveBtn = ce('button', {
      type: 'button',
      className: 'btn btn--primary',
      textContent: 'Standort Speichern'
    });
    saveBtn.addEventListener('click', () => {
      const nameVal = body.querySelector('#loc-form-name').value;
      if (!nameVal || !nameVal.trim()) {
        toast.show('Bitte geben Sie einen Namen für den Standort ein.', 'warning');
        return;
      }

      const gatheredSocials = [];
      ['facebook', 'instagram', 'linkedin', 'youtube', 'x'].forEach(plat => {
        const val = body.querySelector(`#loc-soc-${plat}`).value;
        if (val && val.trim()) {
          gatheredSocials.push({ platform: plat, value: val.trim() });
        }
      });

      const gatheredAcc = {
        name: body.querySelector('#loc-acc-name').value.trim(),
        phone: body.querySelector('#loc-acc-phone').value.trim(),
        email: body.querySelector('#loc-acc-email').value.trim(),
        street: body.querySelector('#loc-acc-street').value.trim(),
        zip: body.querySelector('#loc-acc-zip').value.trim(),
        city: body.querySelector('#loc-acc-city').value.trim(),
        country: body.querySelector('#loc-acc-country').value
      };

      const gatheredStaff = [];
      body.querySelectorAll('.loc-staff-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const select = row.querySelector('select');
        const name = inputs[0].value.trim();
        if (!name) return;

        gatheredStaff.push({
          name: name,
          type: select.value,
          phone: inputs[1].value.trim(),
          email: inputs[2].value.trim(),
          is_emergency: inputs[3].checked,
          is_holiday_replacement: inputs[4].checked
        });
      });

      const updatedLoc = {
        name: nameVal.trim(),
        type: body.querySelector('#loc-form-type').value,
        street: body.querySelector('#loc-form-street').value.trim(),
        zip: body.querySelector('#loc-form-zip').value.trim(),
        city: body.querySelector('#loc-form-city').value.trim(),
        country: body.querySelector('#loc-form-country').value,
        phone: body.querySelector('#loc-form-phone').value.trim(),
        email: body.querySelector('#loc-form-email').value.trim(),
        website: body.querySelector('#loc-form-website').value.trim(),
        socials: gatheredSocials,
        accounting: gatheredAcc,
        staff: gatheredStaff,
        contacts: []
      };

      if (isNew) {
        if (!company.locations) company.locations = [];
        company.locations.push(updatedLoc);
      } else {
        company.locations[index] = updatedLoc;
      }

      CompanyModel.save(company);
      toast.show('Standortdaten erfolgreich gespeichert!', 'success');
      overlay.remove();
      this._renderAddressBook();
    });

    footer.append(cancelBtn, saveBtn);
    content.append(header, body, footer);
    overlay.append(content);
    document.body.append(overlay);
  }

  _renderLocationAddressBookCard(loc, index, borderColor) {
    const card = ce('div', {
      className: 'address-book-card location-card',
      'style.background': 'rgba(255, 255, 255, 0.015)',
      'style.border': '1px solid rgba(255, 255, 255, 0.04)',
      'style.borderLeft': `4px solid ${borderColor}`,
      'style.borderRadius': '8px',
      'style.padding': '16px',
      'style.marginBottom': '12px',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '12px'
    });

    const typeLabel = loc.type === 'main' ? 'Hauptstandort' :
                      loc.type === 'secondary' ? 'Nebenstandort' :
                      loc.type === 'office' ? 'Büro' :
                      loc.type === 'warehouse' ? 'Lager' :
                      loc.type === 'workshop' ? 'Werkstatt' :
                      loc.type === 'branch' ? 'Filiale' :
                      loc.type === 'factory' ? 'Fabrik' : 'Sonstiges';

    const header = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center'
    }, [
      ce('span', {
        textContent: `🏢 ${typeLabel}: ${loc.name || ''}`,
        'style.fontWeight': '700',
        'style.fontSize': '13px',
        'style.color': 'var(--text-bright)'
      })
    ]);
    card.append(header);

    const addressText = `${loc.street || ''}, ${loc.zip || ''} ${loc.city || ''} (${loc.country || 'AT'})`.trim();
    if (addressText.replace(/, /g, '').trim()) {
      card.append(ce('div', {
        textContent: `📍 ${addressText}`,
        'style.fontSize': '11px',
        'style.color': 'var(--text-bright)',
        'style.opacity': '0.9'
      }));
    }

    const channels = ce('div', {
      'style.display': 'flex',
      'style.gap': '12px',
      'style.flexWrap': 'wrap',
      'style.fontSize': '11px',
      'style.marginTop': '4px'
    });

    if (loc.phone) {
      channels.append(ce('a', { href: `tel:${loc.phone}`, textContent: `📞 ${loc.phone}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none', 'style.fontWeight': '600' }));
    }
    if (loc.email) {
      channels.append(ce('a', { href: `mailto:${loc.email}`, textContent: `✉️ ${loc.email}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none', 'style.fontWeight': '600' }));
    }
    if (loc.website) {
      let href = loc.website;
      if (!href.startsWith('http://') && !href.startsWith('https://')) href = `https://${href}`;
      channels.append(ce('a', { href: href, target: '_blank', textContent: `🌐 Web`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none', 'style.fontWeight': '600' }));
    }

    if (loc.socials && loc.socials.length > 0) {
      loc.socials.forEach(soc => {
        if (!soc.value || !soc.value.trim()) return;
        const platformLabel = soc.platform.charAt(0).toUpperCase() + soc.platform.slice(1);
        let href = soc.value;
        if (!href.startsWith('http://') && !href.startsWith('https://')) href = `https://${href}`;
        channels.append(ce('a', {
          href: href,
          target: '_blank',
          textContent: `📱 ${platformLabel}: ${soc.value}`,
          'style.color': 'var(--accent-cyan)',
          'style.textDecoration': 'none',
          'style.fontWeight': '600'
        }));
      });
    }

    if (channels.children.length > 0) {
      card.append(channels);
    }

    const acc = loc.accounting || {};
    if (acc.name || acc.phone || acc.email || acc.street) {
      const accBox = ce('div', {
        'style.background': 'rgba(168, 85, 247, 0.04)',
        'style.border': '1px solid rgba(168, 85, 247, 0.15)',
        'style.borderRadius': '6px',
        'style.padding': '10px',
        'style.marginTop': '4px',
        'style.fontSize': '11px'
      }, [
        ce('div', { 
          textContent: '💳 Rechnungswesen / Buchhaltung', 
          'style.fontWeight': '700', 
          'style.color': 'var(--accent-purple)',
          'style.marginBottom': '6px'
        })
      ]);

      const details = [];
      if (acc.name) details.push(`Ansprechpartner: ${acc.name}`);
      if (acc.street || acc.city) {
        details.push(`Adresse: ${acc.street || ''}, ${acc.zip || ''} ${acc.city || ''} (${acc.country || 'AT'})`);
      }

      details.forEach(d => {
        accBox.append(ce('div', { textContent: d, 'style.marginBottom': '4px', 'style.color': 'var(--text-dim)' }));
      });

      const accChans = ce('div', { 'style.display': 'flex', 'style.gap': '12px', 'style.marginTop': '4px' });
      if (acc.phone) {
        accChans.append(ce('a', { href: `tel:${acc.phone}`, textContent: `📞 ${acc.phone}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
      }
      if (acc.email) {
        accChans.append(ce('a', { href: `mailto:${acc.email}`, textContent: `✉️ ${acc.email}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
      }
      if (accChans.children.length > 0) {
        accBox.append(accChans);
      }

      card.append(accBox);
    }

    if (loc.staff && loc.staff.length > 0) {
      const staffBox = ce('div', {
        'style.background': 'rgba(16, 185, 129, 0.04)',
        'style.border': '1px solid rgba(16, 185, 129, 0.15)',
        'style.borderRadius': '6px',
        'style.padding': '10px',
        'style.marginTop': '4px',
        'style.fontSize': '11px',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '8px'
      }, [
        ce('div', { 
          textContent: '👥 Mitarbeiter & Personal', 
          'style.fontWeight': '700', 
          'style.color': 'var(--accent-emerald)',
          'style.marginBottom': '2px'
        })
      ]);

      loc.staff.forEach(s => {
        const typeLabel = s.type === 'employed' ? 'Angestellt' :
                          s.type === 'freelancer' ? 'Freier Dienstnehmer' :
                          s.type === 'helper' ? 'Aushilfe' : 'Sonstiges';

        const row = ce('div', {
          'style.borderBottom': '1px dashed rgba(255,255,255,0.03)',
          'style.paddingBottom': '6px',
          'style.display': 'flex',
          'style.flexDirection': 'column',
          'style.gap': '2px'
        });

        const nameLine = ce('div', { 'style.display': 'flex', 'style.justifyContent': 'space-between', 'style.alignItems': 'center' });
        const nameSpan = ce('span', { textContent: s.name, 'style.fontWeight': '600', 'style.color': 'var(--text-bright)' });
        const typeSpan = ce('span', { 
          textContent: typeLabel, 
          'style.fontSize': '9px', 
          'style.color': 'var(--text-dim)', 
          'style.background': 'rgba(255,255,255,0.05)', 
          'style.padding': '1px 4px', 
          'style.borderRadius': '3px' 
        });
        nameLine.append(nameSpan, typeSpan);
        row.append(nameLine);

        const badges = ce('div', { 'style.display': 'flex', 'style.gap': '6px', 'style.marginTop': '2px' });
        if (s.is_emergency) {
          badges.append(ce('span', {
            textContent: '🚨 Notdienst',
            'style.fontSize': '9px',
            'style.fontWeight': '700',
            'style.color': 'var(--accent-red)',
            'style.background': 'rgba(239, 68, 68, 0.1)',
            'style.padding': '1px 5px',
            'style.borderRadius': '3px'
          }));
        }
        if (s.is_holiday_replacement) {
          badges.append(ce('span', {
            textContent: '⛱️ Urlaubsvertretung',
            'style.fontSize': '9px',
            'style.fontWeight': '700',
            'style.color': 'var(--accent-cyan)',
            'style.background': 'rgba(6, 182, 212, 0.1)',
            'style.padding': '1px 5px',
            'style.borderRadius': '3px'
          }));
        }
        if (badges.children.length > 0) {
          row.append(badges);
        }

        const comms = ce('div', { 'style.display': 'flex', 'style.gap': '12px', 'style.marginTop': '2px', 'style.fontSize': '10px' });
        if (s.phone) {
          comms.append(ce('a', { href: `tel:${s.phone}`, textContent: `📞 ${s.phone}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
        }
        if (s.email) {
          comms.append(ce('a', { href: `mailto:${s.email}`, textContent: `✉️ ${s.email}`, 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
        }
        if (comms.children.length > 0) {
          row.append(comms);
        }

        staffBox.append(row);
      });

      card.append(staffBox);
    }

    const toolbar = ce('div', {
      className: 'address-card-toolbar',
      'style.display': 'flex',
      'style.gap': '12px',
      'style.marginTop': '8px',
      'style.borderTop': '1px solid rgba(255, 255, 255, 0.04)',
      'style.paddingTop': '8px',
      'style.justifyContent': 'flex-end',
      'style.fontSize': '11px'
    });

    const editBtn = ce('span', {
      textContent: '✏️ Bearbeiten',
      'style.cursor': 'pointer',
      'style.color': 'var(--text-dim)',
      'style.fontWeight': '600'
    });
    editBtn.addEventListener('mouseover', () => editBtn.style.color = 'var(--accent-cyan)');
    editBtn.addEventListener('mouseout', () => editBtn.style.color = 'var(--text-dim)');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showLocationFormModal(index);
    });

    const delBtn = ce('span', {
      textContent: '🗑️ Löschen',
      'style.cursor': 'pointer',
      'style.color': 'var(--text-dim)',
      'style.fontWeight': '600'
    });
    delBtn.addEventListener('mouseover', () => delBtn.style.color = 'var(--accent-red)');
    delBtn.addEventListener('mouseout', () => delBtn.style.color = 'var(--text-dim)');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Möchten Sie den Standort "${loc.name}" wirklich löschen?`)) {
        const company = CompanyModel.getActiveCompany();
        company.locations.splice(index, 1);
        CompanyModel.save(company);
        toast.show('Standort erfolgreich gelöscht.', 'info');
        this._renderAddressBook();
      }
    });

    toolbar.append(editBtn, delBtn);
    card.append(toolbar);

    return card;
  }

  _renderAddressBookCard(item, borderColor) {
    const card = ce('div', {
      className: 'address-book-card',
      'style.background': 'rgba(255, 255, 255, 0.015)',
      'style.border': '1px solid rgba(255, 255, 255, 0.04)',
      'style.borderLeft': `4px solid ${borderColor}`,
      'style.borderRadius': '6px',
      'style.padding': '12px',
      'style.marginBottom': '8px',
      'style.display': 'flex',
      'style.flexDirection': 'column',
      'style.gap': '6px'
    });

    const titleRow = ce('div', {
      'style.display': 'flex',
      'style.justifyContent': 'space-between',
      'style.alignItems': 'center'
    }, [
      ce('span', { 
        textContent: item.title, 
        'style.fontWeight': '600', 
        'style.fontSize': '12px', 
        'style.color': 'var(--text-bright)' 
      })
    ]);

    if (item.badge) {
      titleRow.append(ce('span', {
        textContent: item.badge.text,
        'style.fontSize': '9px',
        'style.fontWeight': '700',
        'style.color': item.badge.color,
        'style.background': 'rgba(255,255,255,0.03)',
        'style.padding': '2px 6px',
        'style.borderRadius': '4px',
        'style.border': `1px solid ${item.badge.color}33`
      }));
    }

    card.append(titleRow);

    if (item.subtitle) {
      card.append(ce('div', {
        textContent: item.subtitle,
        'style.fontSize': '10px',
        'style.opacity': '0.6',
        'style.marginTop': '-4px'
      }));
    }

    if (item.address) {
      card.append(ce('div', {
        textContent: `📍 ${item.address}`,
        'style.fontSize': '11px',
        'style.opacity': '0.7'
      }));
    }

    const contactChannels = ce('div', {
      'style.display': 'flex',
      'style.gap': '12px',
      'style.flexWrap': 'wrap',
      'style.fontSize': '11px',
      'style.marginTop': '2px'
    });

    if (item.phone) {
      contactChannels.append(ce('a', {
        href: `tel:${item.phone}`,
        textContent: `📞 ${item.phone}`,
        'style.color': 'var(--accent-cyan)',
        'style.textDecoration': 'none',
        'style.fontWeight': '600'
      }));
    }

    if (item.email) {
      contactChannels.append(ce('a', {
        href: `mailto:${item.email}`,
        textContent: `✉️ ${item.email}`,
        'style.color': 'var(--accent-cyan)',
        'style.textDecoration': 'none',
        'style.fontWeight': '600'
      }));
    }

    if (item.phones) {
      item.phones.forEach(ph => {
        contactChannels.append(ce('a', {
          href: `tel:${ph.number}`,
          textContent: `📞 ${ph.label || 'Telefon'}: ${ph.number}`,
          'style.color': 'var(--accent-cyan)',
          'style.textDecoration': 'none',
          'style.fontWeight': '600'
        }));
      });
    }

    if (item.emails) {
      item.emails.forEach(em => {
        contactChannels.append(ce('a', {
          href: `mailto:${em.address}`,
          textContent: `✉️ ${em.label || 'E-Mail'}: ${em.address}`,
          'style.color': 'var(--accent-cyan)',
          'style.textDecoration': 'none',
          'style.fontWeight': '600'
        }));
      });
    }

    if (item.socials) {
      item.socials.forEach(soc => {
        const platformLabel = soc.platform.charAt(0).toUpperCase() + soc.platform.slice(1);
        let href = soc.value;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          href = `https://${href}`;
        }
        contactChannels.append(ce('a', {
          href: href,
          target: '_blank',
          textContent: `🌐 ${platformLabel}: ${soc.value}`,
          'style.color': 'var(--accent-cyan)',
          'style.textDecoration': 'none',
          'style.fontWeight': '600'
        }));
      });
    }

    if (item.phone || item.email || (item.phones && item.phones.length > 0) || (item.emails && item.emails.length > 0) || (item.socials && item.socials.length > 0)) {
      card.append(contactChannels);
    }

    // Render Nested Contacts if present
    if (item.contacts && item.contacts.length > 0) {
      const nestedList = ce('div', {
        'style.marginTop': '8px',
        'style.borderTop': '1px dashed rgba(255,255,255,0.05)',
        'style.paddingTop': '6px',
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '4px'
      });

      item.contacts.forEach(c => {
        const contactLine = ce('div', {
          'style.display': 'flex',
          'style.justifyContent': 'space-between',
          'style.fontSize': '10px',
          'style.opacity': '0.85'
        }, [
          ce('span', { textContent: `👤 ${c.name} (${c.position || 'Kontakt'})`, 'style.color': 'var(--text-dim)' })
        ]);

        const chan = ce('span', { 'style.display': 'flex', 'style.gap': '8px' });
        if (c.phone) {
          chan.append(ce('a', { href: `tel:${c.phone}`, textContent: '📞 tel', 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
        }
        if (c.email) {
          chan.append(ce('a', { href: `mailto:${c.email}`, textContent: '✉️ mail', 'style.color': 'var(--accent-cyan)', 'style.textDecoration': 'none' }));
        }
        contactLine.append(chan);
        nestedList.append(contactLine);
      });

      card.append(nestedList);
    }

    // Render Employees if present (from the staff card)
    if (item.employee_names || item.helper_names) {
      const listDiv = ce('div', {
        'style.display': 'flex',
        'style.flexDirection': 'column',
        'style.gap': '8px',
        'style.marginTop': '6px',
        'style.fontSize': '11px'
      });

      if (item.employee_names && item.employee_names.length > 0) {
        const displayList = item.employee_names.map(emp => {
          const empObj = typeof emp === 'object' ? emp : { name: emp, phone: '', email: '' };
          return empObj.name + (empObj.phone || empObj.email ? ` (${[empObj.phone, empObj.email].filter(Boolean).join(', ')})` : '');
        }).join(', ');
        listDiv.append(ce('div', {}, [
          ce('span', { textContent: 'Festangestellt: ', 'style.color': 'var(--text-dim)', 'style.fontWeight': '600' }),
          ce('span', { textContent: displayList, 'style.color': 'var(--text-bright)' })
        ]));
      }

      if (item.helper_names && item.helper_names.length > 0) {
        const displayList = item.helper_names.map(emp => {
          const empObj = typeof emp === 'object' ? emp : { name: emp, phone: '', email: '' };
          return empObj.name + (empObj.phone || empObj.email ? ` (${[empObj.phone, empObj.email].filter(Boolean).join(', ')})` : '');
        }).join(', ');
        listDiv.append(ce('div', {}, [
          ce('span', { textContent: 'Aushilfen / Freie Mitarbeiter: ', 'style.color': 'var(--text-dim)', 'style.fontWeight': '600' }),
          ce('span', { textContent: displayList, 'style.color': 'var(--text-bright)' })
        ]));
      }

      card.append(listDiv);
    }

    // Action toolbar
    const toolbar = ce('div', {
      className: 'address-card-toolbar',
      'style.display': 'flex',
      'style.gap': '12px',
      'style.marginTop': '8px',
      'style.borderTop': '1px solid rgba(255, 255, 255, 0.04)',
      'style.paddingTop': '8px',
      'style.justifyContent': 'flex-end',
      'style.fontSize': '10px'
    });

    const copyBtn = ce('span', {
      textContent: '📋 Kopieren',
      'style.cursor': 'pointer',
      'style.color': 'var(--text-dim)',
      'style.fontWeight': '600'
    });
    copyBtn.addEventListener('mouseover', () => copyBtn.style.color = 'var(--accent-cyan)');
    copyBtn.addEventListener('mouseout', () => copyBtn.style.color = 'var(--text-dim)');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textDetails = `Kontakt-Details:\nName: ${item.title}\nKategorie: ${item.subtitle || ''}\nTelefon: ${item.phone || (item.phones?.[0]?.number) || 'n.a.'}\nE-Mail: ${item.email || (item.emails?.[0]?.address) || 'n.a.'}\nAdresse: ${item.address || 'n.a.'}`;
      navigator.clipboard.writeText(textDetails).then(() => {
        toast.show('Kontakt-Details kopiert!', 'success');
      });
    });
    toolbar.append(copyBtn);

    const forwardBtn = ce('span', {
      textContent: '➡️ Weiterleiten',
      'style.cursor': 'pointer',
      'style.color': 'var(--text-dim)',
      'style.fontWeight': '600'
    });
    forwardBtn.addEventListener('mouseover', () => forwardBtn.style.color = 'var(--accent-cyan)');
    forwardBtn.addEventListener('mouseout', () => forwardBtn.style.color = 'var(--text-dim)');
    forwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showForwardOptions(
        item.title,
        item.phone || (item.phones?.[0]?.number) || '',
        item.email || (item.emails?.[0]?.address) || '',
        item.address || '',
        item.subtitle
      );
    });
    toolbar.append(forwardBtn);

    if (item.type === 'partner') {
      const editBtn = ce('span', {
        textContent: '✏️ Bearbeiten',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      editBtn.addEventListener('mouseover', () => editBtn.style.color = 'var(--accent-cyan)');
      editBtn.addEventListener('mouseout', () => editBtn.style.color = 'var(--text-dim)');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showPartnerFormModal(item.partnerRecord);
      });

      const delBtn = ce('span', {
        textContent: '🗑️ Löschen',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      delBtn.addEventListener('mouseover', () => delBtn.style.color = 'var(--accent-red)');
      delBtn.addEventListener('mouseout', () => delBtn.style.color = 'var(--text-dim)');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Möchten Sie den Partner "${item.title}" wirklich löschen?`)) {
          PartnerModel.delete(item.id);
          toast.show('B2B Partner gelöscht.', 'info');
          this._renderAddressBook();
        }
      });

      toolbar.append(editBtn, delBtn);
    } else if (item.type === 'customer') {
      const editBtn = ce('span', {
        textContent: '✏️ Bearbeiten',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      editBtn.addEventListener('mouseover', () => editBtn.style.color = 'var(--accent-cyan)');
      editBtn.addEventListener('mouseout', () => editBtn.style.color = 'var(--text-dim)');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showCustomerFormModal(item.dbRecord || {
          name: item.title,
          phone: item.phones?.[0]?.number || '',
          email: item.emails?.[0]?.address || '',
          street: item.address || ''
        });
      });

      const delBtn = ce('span', {
        textContent: '🗑️ Löschen',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      delBtn.addEventListener('mouseover', () => delBtn.style.color = 'var(--accent-red)');
      delBtn.addEventListener('mouseout', () => delBtn.style.color = 'var(--text-dim)');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!item.id) {
          toast.show('Historische Transaktionsdaten (Aufträge/Rechnungen) können nicht gelöscht werden.', 'warning');
          return;
        }
        if (confirm(`Möchten Sie den Kunden "${item.title}" wirklich aus der Datenbank löschen?`)) {
          CustomerModel.delete(item.id);
          toast.show('Kundenkontakt gelöscht.', 'info');
          this._renderAddressBook();
        }
      });

      toolbar.append(editBtn, delBtn);
    } else if (item.type === 'other') {
      const editBtn = ce('span', {
        textContent: '✏️ Bearbeiten',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      editBtn.addEventListener('mouseover', () => editBtn.style.color = 'var(--accent-cyan)');
      editBtn.addEventListener('mouseout', () => editBtn.style.color = 'var(--text-dim)');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showOtherContactFormModal(item.otherRecord);
      });

      const promoteBtn = ce('span', {
        textContent: '🤝 Zum Partner befördern',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      promoteBtn.addEventListener('mouseover', () => promoteBtn.style.color = 'var(--accent-emerald)');
      promoteBtn.addEventListener('mouseout', () => promoteBtn.style.color = 'var(--text-dim)');
      promoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Möchten Sie den Kontakt "${item.title}" wirklich zu einer Partnerfirma befördern?`)) {
          PartnerModel.save({
            name: item.otherRecord.name,
            email: item.otherRecord.email,
            phone: item.otherRecord.phone,
            address_street: item.otherRecord.address_street,
            address_city: item.otherRecord.address_city,
            address_zip: item.otherRecord.address_zip,
            address_country: item.otherRecord.address_country,
            status: 'active'
          });
          OtherContactModel.delete(item.id);
          toast.show('Kontakt erfolgreich zu Partnerfirma befördert.', 'success');
          this._renderAddressBook();
        }
      });

      const delBtn = ce('span', {
        textContent: '🗑️ Löschen',
        'style.cursor': 'pointer',
        'style.color': 'var(--text-dim)',
        'style.fontWeight': '600'
      });
      delBtn.addEventListener('mouseover', () => delBtn.style.color = 'var(--accent-red)');
      delBtn.addEventListener('mouseout', () => delBtn.style.color = 'var(--text-dim)');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Möchten Sie den Kontakt "${item.title}" wirklich löschen?`)) {
          OtherContactModel.delete(item.id);
          toast.show('Kontakt gelöscht.', 'info');
          this._renderAddressBook();
        }
      });

      toolbar.append(editBtn, promoteBtn, delBtn);
    }

    card.append(toolbar);
    return card;
  }

  onSwitch(fn) { this._onSwitch = fn; }
  onSave(fn) { this._onSave = fn; }
  onDelete(fn) { this._onDelete = fn; }
}
