/**
 * RadarView.js — Capacity Radar Map View.
 * Dynamically loads Leaflet map and plots partners with busy/active states.
 * Allows quick proximity filtering based on radius.
 */
import { BaseView } from './BaseView.js';
import { ce } from '../utils/DOMHelper.js';
import { calculateDistance } from '../models/PartnerModel.js';

export class RadarView extends BaseView {
  constructor(container) {
    super(container);
    this._map = null;
    this._markers = [];
    this._partners = [];
  }

  /**
   * @param {import('../models/PartnerModel.js').Partner[]} partners
   */
  render(partners) {
    this._partners = partners;
    const wrapper = ce('div', {});

    // Header
    const header = ce('div', { className: 'page-header' }, [
      ce('div', {}, [
        ce('h1', { className: 'page-header__title', textContent: 'Kapazitäten-Radar' }),
        ce('div', { className: 'page-header__subtitle', textContent: 'RADAR::PARTNER_GEO_PROXIMITY' }),
      ])
    ]);

    const grid = ce('div', { 
      className: 'radar-grid', 
      'style.display': 'grid', 
      'style.gridTemplateColumns': '300px 1fr', 
      'style.gap': 'var(--spacing-lg)',
      'style.height': 'calc(100vh - 200px)' 
    });

    // ── Left Panel: Controls & Proximity List ──────────────────────
    const sidebar = ce('div', { 
      className: 'panel', 
      'style.display': 'flex', 
      'style.flexDirection': 'column', 
      'style.gap': 'var(--spacing-md)',
      'style.overflowY': 'auto' 
    }, [
      ce('h2', { className: 'panel__title', textContent: 'Proximity-Filter' }),
      this._buildField('Zentrum (Breitengrad)', ce('input', {
        type: 'number',
        step: 'any',
        id: 'center-lat',
        className: 'form__control',
        value: '47.0707' // Graz center
      })),
      this._buildField('Zentrum (Längengrad)', ce('input', {
        type: 'number',
        step: 'any',
        id: 'center-lng',
        className: 'form__control',
        value: '15.4395'
      })),
      this._buildField('Radius (km)', ce('input', {
        type: 'range',
        min: '5',
        max: '100',
        step: '5',
        value: '50',
        id: 'radius-slider',
        className: 'form__control'
      })),
      ce('div', { 
        id: 'radius-label', 
        textContent: 'Radius: 50 km', 
        'style.fontWeight': '600',
        'style.fontSize': 'var(--font-sm)',
        'style.marginTop': '-8px'
      }),
      ce('hr', { 'style.border': '0', 'style.borderTop': '1px solid rgba(255,255,255,0.05)' }),
      ce('h3', { className: 'panel__title', textContent: 'Gefundene Partner', 'style.fontSize': 'var(--font-md)' }),
      ce('div', { 
        id: 'nearby-list', 
        'style.display': 'flex', 
        'style.flexDirection': 'column', 
        'style.gap': 'var(--spacing-sm)' 
      })
    ]);

    // ── Right Panel: Map Container ─────────────────────────────────
    const mapContainer = ce('div', { 
      id: 'leaflet-map-radar', 
      'style.height': '100%', 
      'style.borderRadius': 'var(--border-radius)',
      'style.border': '1px solid rgba(255, 255, 255, 0.05)',
      'style.overflow': 'hidden',
      'style.position': 'relative'
    });

    grid.append(sidebar, mapContainer);
    wrapper.append(header, grid);

    this.container.append(wrapper);
    this.el = wrapper;

    // Load Leaflet dynamically and initialize map
    this._loadLeaflet().then(() => {
      this._initMap();
      this._setupListeners();
      this._updateRadar();
    });

    return wrapper;
  }

  _buildField(label, input) {
    return ce('div', { className: 'form__group', 'style.marginBottom': '4px' }, [
      ce('label', { className: 'form__label', textContent: label, 'style.fontSize': '12px' }),
      input
    ]);
  }

  _loadLeaflet() {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }
      const link = ce('link', {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      });
      document.head.appendChild(link);

      const script = ce('script', {
        src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      });
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  _initMap() {
    const lat = Number(this.el.querySelector('#center-lat').value);
    const lng = Number(this.el.querySelector('#center-lng').value);

    // Dark Map styling from CartoDB Voyager/DarkMatter
    this._map = window.L.map('leaflet-map-radar').setView([lat, lng], 10);
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this._map);
  }

  _setupListeners() {
    const slider = this.el.querySelector('#radius-slider');
    const label = this.el.querySelector('#radius-label');
    const latInput = this.el.querySelector('#center-lat');
    const lngInput = this.el.querySelector('#center-lng');

    const update = () => {
      label.textContent = `Radius: ${slider.value} km`;
      this._updateRadar();
    };

    slider.addEventListener('input', update);
    latInput.addEventListener('change', update);
    lngInput.addEventListener('change', update);

    // Selection on Map updates inputs
    this._map.on('click', (e) => {
      latInput.value = e.latlng.lat.toFixed(5);
      lngInput.value = e.latlng.lng.toFixed(5);
      update();
    });
  }

  _updateRadar() {
    if (!this._map) return;

    const centerLat = Number(this.el.querySelector('#center-lat').value);
    const centerLng = Number(this.el.querySelector('#center-lng').value);
    const radius = Number(this.el.querySelector('#radius-slider').value);

    // Clear existing markers
    this._markers.forEach(m => m.remove());
    this._markers = [];

    // Draw center indicator
    const centerColor = '#2563EB'; // Brand Blue
    const centerMarker = window.L.circle([centerLat, centerLng], {
      color: centerColor,
      fillColor: centerColor,
      fillOpacity: 0.15,
      radius: radius * 1000 // meters
    }).addTo(this._map);
    this._markers.push(centerMarker);

    const listEl = this.el.querySelector('#nearby-list');
    listEl.innerHTML = '';

    const matchingPartners = [];

    this._partners.forEach(partner => {
      const distance = calculateDistance(centerLat, centerLng, partner.lat, partner.lng);
      const isWithinRadius = distance <= radius;

      // Color coding status
      let markerColor = '#10B981'; // Green (active)
      if (partner.status === 'busy') markerColor = '#F59E0B'; // Orange (busy)
      if (partner.status === 'inactive') markerColor = '#EF4444'; // Red (inactive)

      // Add to map if within range (or just render all markers but style matching differently)
      const pin = window.L.circleMarker([partner.lat, partner.lng], {
        radius: 8,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: 1.5,
        fillOpacity: 0.9
      }).addTo(this._map);

      pin.bindPopup(`
        <div style="color:#000; font-family:sans-serif; min-width:160px;">
          <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:700;">${partner.name}</h4>
          <p style="margin:0 0 6px 0; font-size:11px; opacity:0.7;">${partner.address_city} (${distance.toFixed(1)} km entfernt)</p>
          <div style="font-size:12px; font-weight:600; color:${markerColor}">${partner.status.toUpperCase()}</div>
          <div style="font-size:11px; margin-top:4px;">Rule: ${partner.commission_rate}${partner.commission_type === 'percentage' ? '%' : '€'}</div>
        </div>
      `);

      this._markers.push(pin);

      if (isWithinRadius) {
        matchingPartners.push({ partner, distance, markerColor });
      }
    });

    // Sort matching by distance
    matchingPartners.sort((a, b) => a.distance - b.distance);

    if (matchingPartners.length === 0) {
      listEl.innerHTML = '<div style="opacity:0.5; font-size:12px; padding:8px; text-align:center;">Keine Partner im Radius gefunden.</div>';
    } else {
      matchingPartners.forEach(({ partner, distance, markerColor }) => {
        const item = ce('div', {
          className: 'pipeline-card',
          'style.padding': 'var(--spacing-xs)',
          'style.cursor': 'pointer',
          'style.borderLeft': `3px solid ${markerColor}`,
          'style.background': 'rgba(255,255,255,0.01)',
          'style.borderRadius': '4px',
          'style.fontSize': '12px'
        }, [
          ce('div', { 'style.fontWeight': '600', textContent: partner.name }),
          ce('div', { 
            'style.opacity': '0.6', 
            'style.marginTop': '2px', 
            textContent: `${partner.status.toUpperCase()} · ${distance.toFixed(1)} km entfernt` 
          })
        ]);

        item.addEventListener('click', () => {
          this._map.setView([partner.lat, partner.lng], 14);
        });

        listEl.append(item);
      });
    }
  }

  destroy() {
    this._markers.forEach(m => m.remove());
    this._map?.remove();
    super.destroy();
  }
}
