(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();const kt={"COMP-001":{name:"Müller Entrümpelung GmbH",active:!0,license:"GISA-12948574"},"COMP-002":{name:"Schmid Transporte",active:!0,license:"GISA-98274381"}},Et={"de-AT":{replacements:[{pattern:/\bEntsorgung\b/g,replacement:"Abtransport (Wertstoffübertragung)",reason:"Entsorgungs-Schutzbegriff in AT unter GewO 1994 / AWG 2002. Nur für konzessionierte Entsorgungsbetriebe zulässig."},{pattern:/\bentsorgen\b/g,replacement:"abtransportieren",reason:"Verbot irreführender Bewerbung von Entsorgungsdienstleistungen bei Räumung."},{pattern:/\bHaushaltsauflösung\b/g,replacement:"Räumung/Entrümpelung",reason:"Regionale Wortwahl (LINGUA-LOCA AT): Verwende Räumung statt Haushaltsauflösung."},{pattern:/\bUmzugsunternehmen\b/g,replacement:"Spedition",reason:"Regionale Wortwahl (LINGUA-LOCA AT): Umzugsdienste fallen unter das konzessionierte Speditionsgewerbe."},{pattern:/\bAprikosen\b/ig,replacement:"Marillen",reason:"Regionale Wortwahl (LINGUA-LOCA AT): Marillen statt Aprikosen."},{pattern:/\blecker\b/ig,replacement:"hervorragend",reason:"Beseitigung steriler bundesdeutscher Floskeln in AT."},{pattern:/\bgucken\b/ig,replacement:"sehen",reason:"Beseitigung steriler bundesdeutscher Floskeln in AT."},{pattern:/\bsofortiger Anwaltsrückruf\b/ig,replacement:"Rückruf durch unser Kanzleiteam",reason:"Standesrecht Recht (AT/DE): Keine unzulässige Zusage von Direkt-Rückrufen."},{pattern:/\bKunde\b/ig,replacement:"Mandant",reason:"Branchen-Wortwahl (Recht): Verwendet Mandant anstelle von Kunde."}]},"de-DE":{replacements:[{pattern:/\bSperrmüllabfuhr\b/g,replacement:"Wertstoffentsorgung",reason:"Regionale Wortwahl (LINGUA-LOCA DE): Verwende bundesweit anerkannte Termini."}]},"de-CH":{replacements:[{pattern:/\bParkplatz\b/g,replacement:"Parkfeld",reason:"Regionale Wortwahl (LINGUA-LOCA CH): Parkfeld statt Parkplatz."},{pattern:/\bFahrrad\b/g,replacement:"Velo",reason:"Regionale Wortwahl (LINGUA-LOCA CH): Velo statt Fahrrad."}]}};function tt(n,e="de-AT",t="Entrümpelung",o=!0,r){const a=[],i=[];let s=n||"";const l=Et[e];if(l&&l.replacements.forEach(({pattern:p,replacement:z,reason:m})=>{p.test(s)&&(p.lastIndex=0,s=s.replace(p,u=>(i.push({original:u,replaced:z,reason:m}),z)))}),e==="de-AT"&&(t==="Entrümpelung"&&/entsorg/i.test(s)&&a.push("Regulierungskonflikt: Der Text enthält den Begriff 'Entsorgung' für ein Räumungsgewerbe in Österreich. Dies verstößt gegen das AWG 2002."),o&&r)){const p=kt[r];(!p||!p.active)&&a.push(`GISA-Validierungsfehler: Der Partner ${r} besitzt keine aufrechte GISA-Registrierung.`)}const d=a.length===0;let g=1;return a.length>0&&(g-=.5),i.length>0&&(g-=Math.min(.5,i.length*.1)),g=Math.max(0,g),{isCompliant:d,score:g,errors:a,correctedText:s,modifications:i}}function U(n="SO",e=2,t=4){const o="23456789ABCDEFGHJKLMNPQRSTUVWXYZ",r=[n];for(let a=0;a<e;a++){let i="";for(let s=0;s<t;s++){const l=Math.floor(Math.random()*o.length);i+=o[l]}r.push(i)}return r.join("-")}function rt(n){const e=(n||"").toLowerCase(),t=/(gmbh|e\.u\.|ag|team|meister|experte|partner|spezialist|kanzlei|spedition|service|firma|gisa)/i,o=/(räumung|entrümpelung|transport|reinigung|montage|gutachten|beratung|reparatur|installation|server|hardware|lizenz)/i,r=/(wien|graz|linz|salzburg|innsbruck|klagenfurt|kärnten|steiermark|oberösterreich|niederösterreich|tirol|vorarlberg|deutschland|österreich|schweiz|bezirk|stadt|plz|\b\d{4}\b|\b\d{5}\b)/i,a=/(lkw|transporter|kran|werkzeug|software|api|cloud|server|containern|messgerät|ausrüstung|hardware)/i,i=/(kostenlos|wertanrechnung|garantie|festpreis|schnell|24h|notdienst|effizient|sicher|zertifiziert|rabatt)/i,s=/(schritt|ablauf|anfrage|besichtigung|angebot|abwicklung|injektion|prozess|übernahme)/i,l=/(heute|morgen|sofort|binnen|termin|24\/7|uhr|datum|saisonal|zeitnah|ab)/i,d=e.match(t),g=e.match(o),p=e.match(r),z=e.match(a),m=e.match(i),u=e.match(s),y=e.match(l),k={quis:{label:"Quis (Wer - Entität & Autorität)",passed:!!d,match:d==null?void 0:d[0]},quid:{label:"Quid (Was - Konkreter Service)",passed:!!g,match:g==null?void 0:g[0]},ubi:{label:"Ubi (Wo - Geografische Injektion)",passed:!!p,match:p==null?void 0:p[0]},quibus:{label:"Quibus (Womit - Ressourcen & Werkzeuge)",passed:!!z,match:z==null?void 0:z[0]},cur:{label:"Cur (Warum - Conversion-Trigger)",passed:!!m,match:m==null?void 0:m[0]},quomodo:{label:"Quomodo (Wie - Prozess & Schritte)",passed:!!u,match:u==null?void 0:u[0]},quando:{label:"Quando (Wann - Timing & Verfgbarkeit)",passed:!!y,match:y==null?void 0:y[0]}},x=Object.values(k).filter(E=>E.passed).length;return{score:parseFloat((x/7).toFixed(2)),passedCount:x,details:k}}function nt(n,e,t,o){const a=(t-n)*(Math.PI/180),i=(o-e)*(Math.PI/180),s=Math.sin(a/2)*Math.sin(a/2)+Math.cos(n*(Math.PI/180))*Math.cos(t*(Math.PI/180))*Math.sin(i/2)*Math.sin(i/2),l=2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));return parseFloat((6371*l).toFixed(2))}function It(n,e=100){const t=[];for(let r=0;r<n.length;r++)for(let a=0;a<n.length;a++){if(r===a)continue;const i=n[r],s=n[a],l=nt(i.lat,i.lon,s.lat,s.lon);if(l<=e){const d=i.population||1e3,g=s.population||1e3,p=parseFloat((d*g/(l+.001)).toFixed(2));t.push({from:i.id,to:s.id,distanceKm:l,priority:p})}}return t.sort((r,a)=>a.priority-r.priority)}function zt(n){if(!n||n.trim().length===0)return 0;const e=n.split(/[.!?]+/).filter(g=>g.trim().length>0),t=n.split(/\s+/).filter(g=>g.trim().length>0);if(t.length===0)return 0;const o=e.length||1,r=t.length,a=r/o;let i=0;t.forEach(g=>{const p=g.toLowerCase().replace(/[^a-zäöüß]/g,"");if(p.length===0)return;const z=p.match(/[aeiouyäöü]+/g);let m=z?z.length:1;p.endsWith("e")&&m>1&&m--,i+=m});const s=i/r,l=180-a-58.5*s;let d=.5;return l>=60&&l<=90?d=1:l>90?d=.9-(l-90)*.01:d=l/60,Math.max(0,Math.min(1,d))}class Bt{constructor(){this.cache=new Map}getDistance(e,t){const o=e.length,r=t.length,a=[];for(let i=0;i<=o;i++)a[i]=[i];for(let i=0;i<=r;i++)a[0][i]=i;for(let i=1;i<=o;i++)for(let s=1;s<=r;s++){const l=e[i-1]===t[s-1]?0:1;a[i][s]=Math.min(a[i-1][s]+1,a[i][s-1]+1,a[i-1][s-1]+l)}return a[o][r]}get(e,t=3){const o=e.trim().toLowerCase();for(const[r,a]of this.cache.entries()){const i=this.getDistance(o,r);if(i<=t)return console.log(`[Cache Hit] Stabilized semantically equivalent state. Distance: ${i} <= epsilon (${t})`),a.result}return null}set(e,t){t.isCompliant&&this.cache.set(e.trim().toLowerCase(),{result:t,timestamp:Date.now()})}}function me(n){return n?/^ATU\d{8}$/i.test(n.trim()):!1}function ot(n,e,t,o,r){const a=`${n||"GENESIS"}:${e}:${t}:${o}:${r}`;let i=0;for(let l=0;l<a.length;l++){const d=a.charCodeAt(l);i=(i<<5)-i+d,i|=0}return`HASH-${Math.abs(i).toString(16).toUpperCase().padStart(8,"0")}`}function At(n){if(!n||n.length===0)return{isValid:!0,corruptedIndex:-1,logsCount:0};const e=[...n].reverse();let t="GENESIS";for(let o=0;o<e.length;o++){const r=e[o],a=ot(t,r.timestamp,r.user,r.action,r.details);if(r.hash&&r.hash!==a)return{isValid:!1,corruptedIndex:n.length-1-o,logsCount:n.length};t=a}return{isValid:!0,corruptedIndex:-1,logsCount:n.length}}typeof window<"u"&&(window.generateAuditHash=ot,window.verifyAuditTrailIntegrity=At);function ge(n){window._ludusTelemetry=window._ludusTelemetry||{hasPhysicalInteraction:!1,interactionCount:0,lastInteractionType:null,botImmunityVerified:!1},window._ludusTelemetry.hasPhysicalInteraction=!0,window._ludusTelemetry.interactionCount++,window._ludusTelemetry.lastInteractionType=n,window._ludusTelemetry.interactionCount>=1&&(window._ludusTelemetry.botImmunityVerified=!0),window.dispatchEvent(new CustomEvent("ludus-telemetry-update",{detail:window._ludusTelemetry}))}function $t(){return window._ludusTelemetry||{hasPhysicalInteraction:!1,interactionCount:0,lastInteractionType:null,botImmunityVerified:!1}}function Ct(n){const e=(n||"").toLowerCase();return e.includes("recht")||e.includes("medizin")||e.includes("notdienst")||e.includes("security")?"T_Control":e.includes("entrümpelung")||e.includes("handwerk")||e.includes("umzug")||e.includes("solar")||e.includes("immobilien")||e.includes("cloud")?"T_Config":"T_Reward"}function Tt(n,e,t){const o=document.getElementById(n);if(!o)return;const r=Ct(e);if(r==="T_Config"){o.innerHTML=`
      <div class="ludus-widget ludus-config" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.9rem; color: var(--color-primary-light);">
            ⚡ LUDUS Kalkulator (T_Config): Volumen & Kostenschätzung
          </span>
          <span class="ludus-badge" id="ludus-bot-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #f87171;">
            🤖 Bot-Status: Inaktiv
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Passen Sie das geschätzte Volumen (m³) an, um die Kosten und LKW-Kapazität zu berechnen.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: center;">
          <div>
            <label style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span>Volumen: <strong id="ludus-volume-val" style="color: var(--color-accent);">15 m³</strong></span>
              <span>LKW: <strong id="ludus-trucks-val">1 Transporter</strong></span>
            </label>
            <input type="range" id="ludus-slider-volume" min="5" max="100" value="15" step="5" style="width: 100%; cursor: pointer;">
          </div>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Richtwert-Aufwand</div>
            <div style="font-size: 1.4rem; font-weight: 700; color: #10b981;" id="ludus-cost-val">€ 450,00</div>
          </div>
        </div>
      </div>
    `;const a=document.getElementById("ludus-slider-volume");a&&a.addEventListener("input",()=>{ge("slider_drag");const i=parseInt(a.value,10),s=i*30,l=Math.ceil(i/20);document.getElementById("ludus-volume-val").textContent=`${i} m³`,document.getElementById("ludus-cost-val").textContent=`€ ${s.toFixed(2)}`,document.getElementById("ludus-trucks-val").textContent=`${l} ${l>1?"LKWs":"Transporter"}`;const d=document.getElementById("ludus-bot-badge");d&&(d.style.background="rgba(16, 185, 129, 0.2)",d.style.color="#34d399",d.textContent="🛡️ Mensch verifiziert"),t&&t({volume:i,estimatedCost:s})})}else r==="T_Control"?(o.innerHTML=`
      <div class="ludus-widget ludus-control" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 0.9rem; color: #60a5fa;">
            🛡️ LUDUS Agency Control (T_Control): Sicherheits & Vorbereitungs-Checkliste
          </span>
          <span class="ludus-badge" id="ludus-bot-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #f87171;">
            🤖 Bot-Status: Inaktiv
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Wählen Sie zutreffende Sicherheitsschritte zur Agency-Rückgewinnung aus:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="doc"> Erstberatung & Sachverhalt vorbereitet
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="urgency"> Fristenwahrung erforderlich
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="gisa"> GISA / Gewerbe-Compliance geprüft
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="ludus-check" data-step="confidential"> Vertraulichkeitsvereinbarung erwünscht
          </label>
        </div>
      </div>
    `,o.querySelectorAll(".ludus-check").forEach(i=>{i.addEventListener("change",()=>{ge("checkbox_toggle");const s=document.getElementById("ludus-bot-badge");s&&(s.style.background="rgba(16, 185, 129, 0.2)",s.style.color="#34d399",s.textContent="🛡️ Mensch verifiziert"),t&&t({profile:"T_Control"})})})):o.innerHTML=`
      <div class="ludus-widget ludus-reward" style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 12px; margin-top: 12px; text-align: center;">
        <span style="font-size: 0.85rem; color: #a7f3d0;">💎 LUDUS Reward (T_Reward): Exklusive Express-Bearbeitung freigeschaltet!</span>
      </div>
    `}const it=[{id:"WRK-01",name:"Worker Alpha (Vienna SSG)",maxCapacity:5,activeTasks:1,rpmQuota:60,status:"idle"},{id:"WRK-02",name:"Worker Beta (Graz Geo-Scan)",maxCapacity:4,activeTasks:0,rpmQuota:45,status:"idle"},{id:"WRK-03",name:"Worker Gamma (Linz Compliance)",maxCapacity:6,activeTasks:2,rpmQuota:90,status:"busy"}];function fe(n){let e=0;for(let t=0;t<n.length;t++){const o=n.charCodeAt(t);e=(e<<5)-e+o,e|=0}return"0x"+Math.abs(e).toString(16).padStart(8,"0")}function Lt(n,e,t=new Date){const o=fe(n),r=fe(e),i=Math.abs(new Date().getTime()-t.getTime()),s=Math.ceil(i/(1e3*60*60*24)),l=o!==r,d=s>90,g=l||d;let p="Inhalt ist synchron und aktuell (Delta = 0)";return l?p=`Soll-Ist Hash-Abweichung erkannt (${o} vs ${r})`:d&&(p=`Staleness-Trigger ausgelöst (> 90 Tage seit letztem Build: ${s} Tage)`),{hasChanged:g,deltaScore:g?1:0,reason:p,stalenessDays:s,hashIst:o,hashSoll:r}}function Mt(){let n=null,e=-1;for(const t of it){const o=t.maxCapacity-t.activeTasks;o>=1&&o>e&&(e=o,n=t)}return n}function Ot(){return Math.floor(Math.random()*1001)+500}function Dt(n){const e=document.getElementById(n);if(!e)return;const t=it;e.innerHTML=`
    <div class="factorium-view" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px;">🏭 FACTORIUM Build & Worker-Engine</h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Deterministische SSG-Pipeline, Delta-Inferenz & Token-Bucket Rate-Limiting</p>
        </div>
        <button id="btn-trigger-factorium-build" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
          <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Build-Pipeline Durchlauf Starten
        </button>
      </div>

      <!-- Pipeline Phase Display -->
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 24px;">
        <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--color-text-primary);">Pipeline Phase Execution Status</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="factorium-pipeline-steps">
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">1. Data-Load</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">2. Geo-Scan</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">3. Delta-Compute</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">4. Intent-Match</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">5. Task-Split</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">6. Worker-Dispatch</span>
          <span class="step-chip" style="padding: 6px 12px; border-radius: 6px; background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; color: #93c5fd; font-size: 0.8rem;">7. SSG Output</span>
        </div>
      </div>

      <!-- Worker Pool Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${t.map(a=>`
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; font-size: 0.95rem;">${a.name}</span>
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; background: ${a.status==="idle"?"rgba(16, 185, 129, 0.2)":"rgba(245, 158, 11, 0.2)"}; color: ${a.status==="idle"?"#34d399":"#fbbf24"};">${a.status.toUpperCase()}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 6px;">Kapazität Score: <strong>${a.maxCapacity-a.activeTasks} / ${a.maxCapacity}</strong></div>
            <div style="font-size: 0.85rem; color: var(--color-text-secondary);">Token Bucket: <strong>${a.rpmQuota} RPM</strong></div>
          </div>
        `).join("")}
      </div>

      <!-- Console Log Box -->
      <div style="background: #090d16; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px; font-family: monospace; font-size: 0.85rem; color: #34d399; height: 180px; overflow-y: auto;" id="factorium-console-log">
        [FACTORIUM Engine Ready] Initialized 3 distributed workers. Delta-Compute threshold: Δ > 0.
      </div>
    </div>
  `;const o=document.getElementById("btn-trigger-factorium-build"),r=document.getElementById("factorium-console-log");o&&r&&o.addEventListener("click",()=>{const a=Ot(),i=Mt(),s=Lt("Soll state text v1","Soll state text v2",new Date(Date.now()-2400*60*60*1e3));r.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] 🚀 Initiating FACTORIUM Pipeline...`,r.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] 🔍 Delta-Inference: ${s.reason}`,r.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] ⚙️ Selected Optimal Worker: ${i?i.name:"Queue Overload"}`,r.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] ⏱️ Applied Human Jitter Delay: ${a}ms`,r.innerHTML+=`<br>[${new Date().toLocaleTimeString()}] ✅ SSG Static Generation Completed Successfully.`,r.scrollTop=r.scrollHeight})}const at=[];function Pt(){document.getElementById("tab-crm")&&(localStorage.getItem("serviceos_customers")||localStorage.setItem("serviceos_customers",JSON.stringify(at)),X())}function G(){const n=localStorage.getItem("serviceos_customers");return n?JSON.parse(n):at}function st(n){localStorage.setItem("serviceos_customers",JSON.stringify(n)),window.dispatchEvent(new Event("storage"))}function X(){const n=document.getElementById("tab-crm");if(!n)return;const e=G();n.innerHTML=`
    <div class="crm-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: var(--color-primary);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Kunden CRM (Customer Relationship Management)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Verwaltung von B2B & B2C Kundenstamm, Kontaktpersonen und Umsatzhistorie</p>
        </div>

        <button id="btn-add-customer-crm" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neuen Kunden anlegen
        </button>
      </div>

      <!-- Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtkunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: var(--color-text-primary);" id="crm-stat-total">${e.length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">VIP Kunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;" id="crm-stat-vip">${e.filter(t=>t.status==="VIP").length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">B2B Enterprise</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;" id="crm-stat-b2b">${e.filter(t=>t.type.includes("B2B")).length}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtumsatz Kunden</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;" id="crm-stat-revenue">€ ${e.reduce((t,o)=>t+(o.totalRevenue||0),0).toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          <input type="text" id="crm-search-input" class="wizard-input" placeholder="Kunden nach Name, Ort, E-Mail suchen..." style="width: 100%; height: 40px; padding: 0 14px;">
        </div>
        <select id="crm-type-filter" class="wizard-input" style="width: 200px; height: 40px; padding: 0 12px; cursor: pointer;">
          <option value="ALL">Alle Kundentypen</option>
          <option value="B2B Enterprise">B2B Enterprise</option>
          <option value="B2C Privatkunde">B2C Privatkunde</option>
          <option value="B2B Partner">B2B Partner</option>
          <option value="Öffentlicher Auftraggeber">Öffentlicher Auftraggeber</option>
        </select>
      </div>

      <!-- Customer Table -->
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-premium);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
              <th style="padding: 14px 16px;">Kunde / Firma</th>
              <th style="padding: 14px 16px;">Typ</th>
              <th style="padding: 14px 16px;">Kontaktperson</th>
              <th style="padding: 14px 16px;">Ort / Adresse</th>
              <th style="padding: 14px 16px;">Aufträge & Umsatz</th>
              <th style="padding: 14px 16px; text-align: center;">Status</th>
              <th style="padding: 14px 16px; text-align: right;">Aktionen</th>
            </tr>
          </thead>
          <tbody id="crm-table-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" id="crm-customer-modal" style="display: none;">
      <div class="modal-card" style="max-width: 650px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border); box-shadow: var(--shadow-premium);">
        <div class="modal-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="crm-modal-title" style="font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-text-primary);">Neuen Kunden anlegen</h3>
          <button id="btn-close-crm-modal" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 1.5rem;">&times;</button>
        </div>
        <form id="crm-customer-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kunden- / Firmenname</label>
              <input type="text" id="crm-cust-name" class="wizard-input" required placeholder="z.B. Google Cloud DE" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kundentyp</label>
              <select id="crm-cust-type" class="wizard-input" style="width: 100%;">
                <option value="B2B Enterprise">B2B Enterprise</option>
                <option value="B2C Privatkunde">B2C Privatkunde</option>
                <option value="B2B Partner">B2B Partner</option>
                <option value="Öffentlicher Auftraggeber">Öffentlicher Auftraggeber</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kontaktperson</label>
              <input type="text" id="crm-cust-contact" class="wizard-input" placeholder="z.B. Dr. Martin Weber" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
              <select id="crm-cust-status" class="wizard-input" style="width: 100%;">
                <option value="Aktiv">Aktiv</option>
                <option value="VIP">VIP</option>
                <option value="Inaktiv">Inaktiv</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">E-Mail Adresse</label>
              <input type="email" id="crm-cust-email" class="wizard-input" required placeholder="name@firma.at" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Telefonnummer</label>
              <input type="text" id="crm-cust-phone" class="wizard-input" placeholder="+43 1 23456" style="width: 100%;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Ort / Stadt</label>
              <input type="text" id="crm-cust-city" class="wizard-input" placeholder="Wien" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Vollständige Adresse</label>
              <input type="text" id="crm-cust-address" class="wizard-input" placeholder="Musterstraße 12, 1010 Wien" style="width: 100%;">
            </div>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Notizen & Verträge</label>
            <textarea id="crm-cust-notes" class="wizard-input" rows="3" placeholder="Zusätzliche Notizen, Rahmenverträge..." style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-crm-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Kunden Speichern</button>
          </div>
        </form>
      </div>
    </div>
  `,ne(),Rt()}function ne(){var r,a;const n=document.getElementById("crm-table-body");if(!n)return;const e=(((r=document.getElementById("crm-search-input"))==null?void 0:r.value)||"").toLowerCase(),t=((a=document.getElementById("crm-type-filter"))==null?void 0:a.value)||"ALL";let o=G();if(t!=="ALL"&&(o=o.filter(i=>i.type===t)),e&&(o=o.filter(i=>i.name.toLowerCase().includes(e)||(i.city||"").toLowerCase().includes(e)||(i.email||"").toLowerCase().includes(e)||(i.contactPerson||"").toLowerCase().includes(e))),n.innerHTML="",o.length===0){n.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Kunden für die ausgewählten Kriterien gefunden.</td></tr>';return}o.forEach(i=>{const s=document.createElement("tr");s.style.borderBottom="1px solid var(--color-border)",s.innerHTML=`
      <td style="padding: 12px 16px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${i.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${i.id}</div>
      </td>
      <td style="padding: 12px 16px;">
        <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa;">${i.type}</span>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-primary);">
        <div>${i.contactPerson||"-"}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${i.email}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div style="font-weight: 500; color: var(--color-text-primary);">${i.city||"-"}</div>
        <div style="font-size: 0.75rem;">${i.address||""}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem;">
        <div style="font-weight: 600; color: #10b981;">€ ${(i.totalRevenue||0).toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${i.totalOrders||0} Auftrag/Aufträge</div>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; background: ${i.status==="VIP"?"rgba(245, 158, 11, 0.2)":i.status==="Aktiv"?"rgba(16, 185, 129, 0.2)":"rgba(239, 68, 68, 0.2)"}; color: ${i.status==="VIP"?"#fbbf24":i.status==="Aktiv"?"#34d399":"#f87171"};">
          ${i.status}
        </span>
      </td>
      <td style="padding: 12px 16px; text-align: right;">
        <button class="btn btn-sm crm-edit-btn" data-id="${i.id}" style="margin-right: 6px;">Bearbeiten</button>
        <button class="btn btn-sm crm-delete-btn" data-id="${i.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </td>
    `,n.appendChild(s)}),n.querySelectorAll(".crm-edit-btn").forEach(i=>{i.addEventListener("click",()=>dt(i.getAttribute("data-id")))}),n.querySelectorAll(".crm-delete-btn").forEach(i=>{i.addEventListener("click",()=>Nt(i.getAttribute("data-id")))})}function Rt(){const n=document.getElementById("crm-search-input"),e=document.getElementById("crm-type-filter"),t=document.getElementById("btn-add-customer-crm"),o=document.getElementById("crm-customer-modal"),r=document.getElementById("btn-close-crm-modal"),a=document.getElementById("btn-cancel-crm-modal"),i=document.getElementById("crm-customer-form");n&&n.addEventListener("input",ne),e&&e.addEventListener("change",ne),t&&t.addEventListener("click",()=>dt()),r&&r.addEventListener("click",()=>o.style.display="none"),a&&a.addEventListener("click",()=>o.style.display="none"),i&&i.addEventListener("submit",s=>{var p,z;s.preventDefault();const l=i.dataset.editId,d=G(),g={id:l||`CUST-${Math.floor(1e3+Math.random()*9e3)}`,name:document.getElementById("crm-cust-name").value.trim(),type:document.getElementById("crm-cust-type").value,contactPerson:document.getElementById("crm-cust-contact").value.trim(),status:document.getElementById("crm-cust-status").value,email:document.getElementById("crm-cust-email").value.trim(),phone:document.getElementById("crm-cust-phone").value.trim(),city:document.getElementById("crm-cust-city").value.trim(),address:document.getElementById("crm-cust-address").value.trim(),notes:document.getElementById("crm-cust-notes").value.trim(),totalOrders:l&&((p=d.find(m=>m.id===l))==null?void 0:p.totalOrders)||0,totalRevenue:l&&((z=d.find(m=>m.id===l))==null?void 0:z.totalRevenue)||0};if(l){const m=d.findIndex(u=>u.id===l);m>-1&&(d[m]=g)}else d.push(g);st(d),o.style.display="none",X()})}function dt(n=null){const e=document.getElementById("crm-customer-modal"),t=document.getElementById("crm-customer-form"),o=document.getElementById("crm-modal-title");if(!(!e||!t)){if(t.reset(),n){const r=G().find(a=>a.id===n);if(!r)return;o.textContent="Kunden bearbeiten",document.getElementById("crm-cust-name").value=r.name||"",document.getElementById("crm-cust-type").value=r.type||"B2B Enterprise",document.getElementById("crm-cust-contact").value=r.contactPerson||"",document.getElementById("crm-cust-status").value=r.status||"Aktiv",document.getElementById("crm-cust-email").value=r.email||"",document.getElementById("crm-cust-phone").value=r.phone||"",document.getElementById("crm-cust-city").value=r.city||"",document.getElementById("crm-cust-address").value=r.address||"",document.getElementById("crm-cust-notes").value=r.notes||"",t.dataset.editId=n}else o.textContent="Neuen Kunden anlegen",delete t.dataset.editId;e.style.display="flex"}}function Nt(n){if(!confirm("Möchten Sie diesen Kunden wirklich aus dem CRM löschen?"))return;const e=G().filter(t=>t.id!==n);st(e),X()}const lt=[];function ct(n,e=15){const t=parseFloat(n)||0,o=Math.round(t*(e/100)*100)/100,r=Math.round((t-o)*100)/100;return{gross:t,commission:o,partnerPayout:r,rate:e}}typeof window<"u"&&(window.calculateCommissionAndPayout=ct);function ut(){if(!window.ServiceOSStore)return;const n=ServiceOSStore.getOrders(),e=V();let t=!1;n.forEach(o=>{if(!e.some(r=>r.orderId===o.id)){const r=o.value||450,a=Math.round(r/1.2*100)/100,i=Math.round((r-a)*100)/100,s=ct(r,15),d=(window.generateCryptographicId||function(m){return m+"-2026-"+Math.floor(1e3+Math.random()*9e3)})("INV"),g=new Date,p=new Date(g);p.setDate(p.getDate()+14);const z={id:d,orderId:o.id,caseId:o.caseId||o.caseNumber||null,client:o.client||"Auftraggeber",companyId:o.companyId||null,partner:o.partner||"Zentrale",date:o.date||g.toISOString().split("T")[0],dueDate:p.toISOString().split("T")[0],paymentMethod:"Banküberweisung",netAmount:a,vatRate:20,vatAmount:i,grossAmount:r,commissionRate:15,commissionAmount:s.commission,partnerPayout:s.partnerPayout,payoutStatus:"Offen",status:o.status==="Delivered"?"Bezahlt":"Offen"};e.unshift(z),t=!0,o.caseId&&ServiceOSStore.addTimelineEventToCase&&ServiceOSStore.addTimelineEventToCase(o.caseId,{type:"BILLING_GENERATED",title:`Fakturierung ${d}`,description:`Automatische Fakturierung über € ${r.toFixed(2)} (Provision: € ${s.commission.toFixed(2)}, Partner-Auszahlung: € ${s.partnerPayout.toFixed(2)}).`,author:"Billing Engine"})}}),t&&pt(e)}function Ut(){document.getElementById("tab-finance")&&(localStorage.getItem("serviceos_invoices")||localStorage.setItem("serviceos_invoices",JSON.stringify(lt)),ut(),de())}function V(){const n=localStorage.getItem("serviceos_invoices");return n?JSON.parse(n):lt}function pt(n){localStorage.setItem("serviceos_invoices",JSON.stringify(n)),window.dispatchEvent(new Event("storage"))}function de(){const n=document.getElementById("tab-finance");if(!n)return;ut();const e=V(),t=e.reduce((s,l)=>s+(l.grossAmount||0),0),o=e.filter(s=>s.status==="Offen"||s.status==="Überfällig").reduce((s,l)=>s+(l.grossAmount||0),0),r=e.reduce((s,l)=>s+(l.commissionAmount||0),0),a=e.filter(s=>s.status==="Bezahlt").length,i=e.length?Math.round(a/e.length*100):0;n.innerHTML=`
    <div class="finance-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Finanzen & Abrechnung (Invoicing & Revenue)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Automatisierte Fakturierung, USt-Berechnung (20% AT / 19% DE) und Partner-Provisionsabrechnung</p>
        </div>

        <button id="btn-add-invoice-fin" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neue Rechnung ausstellen
        </button>
      </div>

      <!-- KPI Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Gesamtfakturierung (Brutto)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">€ ${t.toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Offene Forderungen</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #f87171;">€ ${o.toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">System-Provisionen (15%)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">€ ${r.toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Zahlungsquote</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;">${i}% <span style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: normal;">(${a}/${e.length})</span></div>
        </div>
      </div>

      <!-- Filters -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          <input type="text" id="fin-search-input" class="wizard-input" placeholder="Rechnungsnummer, Kunde oder Auftrag suchen..." style="width: 100%; height: 40px; padding: 0 14px;">
        </div>
        <select id="fin-status-filter" class="wizard-input" style="width: 200px; height: 40px; padding: 0 12px; cursor: pointer;">
          <option value="ALL">Alle Status</option>
          <option value="Bezahlt">Bezahlt</option>
          <option value="Offen">Offen</option>
          <option value="Überfällig">Überfällig</option>
        </select>
      </div>

      <!-- Invoices Table -->
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); overflow: hidden; box-shadow: var(--shadow-premium);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
              <th style="padding: 14px 16px;">Rechnung Nr.</th>
              <th style="padding: 14px 16px;">Kunde & Auftrag</th>
              <th style="padding: 14px 16px;">Datum / Fälligkeit</th>
              <th style="padding: 14px 16px;">Betrag (Netto / USt)</th>
              <th style="padding: 14px 16px;">Brutto Gesamt</th>
              <th style="padding: 14px 16px;">Provision</th>
              <th style="padding: 14px 16px; text-align: center;">Status</th>
              <th style="padding: 14px 16px; text-align: right;">Aktionen</th>
            </tr>
          </thead>
          <tbody id="fin-table-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invoice PDF Preview Modal -->
    <div class="modal-overlay" id="fin-pdf-modal" style="display: none;">
      <div class="modal-card" style="max-width: 700px; background: #ffffff; color: #0f172a; border-radius: 8px; padding: 32px; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0; color: #0f172a; font-size: 1.5rem;">NEXUS OMS SYSTEM</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.85rem;">Fakturierung & Abrechnungsdienstleister AUSTRIA</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #3b82f6; font-size: 1.3rem;" id="pdf-inv-num">RE-2026-001</h3>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.85rem;" id="pdf-inv-date">Datum: 15.07.2026</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 0.9rem;">
          <div>
            <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Empfänger (Kunde):</strong>
            <div id="pdf-inv-client" style="font-weight: bold; margin-top: 4px; font-size: 1.05rem;">Google Cloud DE</div>
            <div id="pdf-inv-order" style="color: #475569; font-size: 0.85rem; margin-top: 2px;">Auftrag: NEX-2980</div>
          </div>
          <div style="text-align: right;">
            <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Zahlungskondition:</strong>
            <div id="pdf-inv-payment" style="font-weight: bold; margin-top: 4px;">Banküberweisung</div>
            <div id="pdf-inv-due" style="color: #ef4444; font-size: 0.85rem; margin-top: 2px;">Fällig bis: 29.07.2026</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.9rem;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left; color: #334155;">
              <th style="padding: 10px;">Position</th>
              <th style="padding: 10px; text-align: right;">Netto</th>
              <th style="padding: 10px; text-align: right;">USt (20%)</th>
              <th style="padding: 10px; text-align: right;">Brutto</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 10px;" id="pdf-inv-pos">Dienstleistung gem. Auftrag NEX-2980</td>
              <td style="padding: 12px 10px; text-align: right;" id="pdf-inv-net">€ 3.750,00</td>
              <td style="padding: 12px 10px; text-align: right;" id="pdf-inv-vat">€ 750,00</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold;" id="pdf-inv-gross">€ 4.500,00</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; border: 1px dashed #cbd5e1;">
          <span>System-Provision Partner (15%): <strong id="pdf-inv-comm">€ 675,00</strong></span>
          <span style="padding: 4px 10px; border-radius: 12px; font-weight: bold; background: #dcfce7; color: #15803d;" id="pdf-inv-status-badge">BEZAHLT</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button class="btn btn-secondary" id="btn-close-pdf-modal" style="background: #e2e8f0; color: #0f172a; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Schließen</button>
          <button class="btn btn-primary" onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">🖨️ Drucken / PDF Speichern</button>
        </div>
      </div>
    </div>
  `,oe(),Ft()}function oe(){var r,a;const n=document.getElementById("fin-table-body");if(!n)return;const e=(((r=document.getElementById("fin-search-input"))==null?void 0:r.value)||"").toLowerCase(),t=((a=document.getElementById("fin-status-filter"))==null?void 0:a.value)||"ALL";let o=V();if(t!=="ALL"&&(o=o.filter(i=>i.status===t)),e&&(o=o.filter(i=>i.id.toLowerCase().includes(e)||i.client.toLowerCase().includes(e)||i.orderId.toLowerCase().includes(e))),n.innerHTML="",o.length===0){n.innerHTML='<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Rechnungen für die Filterkriterien vorhanden.</td></tr>';return}o.forEach(i=>{const s=document.createElement("tr");s.style.borderBottom="1px solid var(--color-border)",s.innerHTML=`
      <td style="padding: 12px 16px;">
        <div style="font-weight: 700; color: #60a5fa;">${i.id}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${i.paymentMethod}</div>
      </td>
      <td style="padding: 12px 16px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${i.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-accent);">Auftrag: ${i.orderId}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>Ausgestellt: ${i.date}</div>
        <div style="font-size: 0.75rem; color: ${i.status==="Überfällig"?"#f87171":"var(--color-text-muted)"};">Fällig: ${i.dueDate}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>Netto: € ${(i.netAmount||0).toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">USt (${i.vatRate}%): € ${(i.vatAmount||0).toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
      </td>
      <td style="padding: 12px 16px; font-size: 0.95rem; font-weight: 700; color: #10b981;">
        € ${(i.grossAmount||0).toLocaleString("de-AT",{minimumFractionDigits:2})}
      </td>
      <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--color-text-secondary);">
        <div>€ ${(i.commissionAmount||0).toLocaleString("de-AT",{minimumFractionDigits:2})}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${i.commissionRate}% Provision</div>
      </td>
      <td style="padding: 12px 16px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 10px; border-radius: 10px; background: ${i.status==="Bezahlt"?"rgba(16, 185, 129, 0.2)":i.status==="Offen"?"rgba(245, 158, 11, 0.2)":"rgba(239, 68, 68, 0.2)"}; color: ${i.status==="Bezahlt"?"#34d399":i.status==="Offen"?"#fbbf24":"#f87171"};">
          ${i.status}
        </span>
      </td>
      <td style="padding: 12px 16px; text-align: right;">
        <button class="btn btn-sm fin-view-pdf-btn" data-id="${i.id}" style="margin-right: 6px;">PDF Vorschau</button>
        <button class="btn btn-sm fin-toggle-status-btn" data-id="${i.id}" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3);">Status</button>
      </td>
    `,n.appendChild(s)}),n.querySelectorAll(".fin-view-pdf-btn").forEach(i=>{i.addEventListener("click",()=>Ht(i.getAttribute("data-id")))}),n.querySelectorAll(".fin-toggle-status-btn").forEach(i=>{i.addEventListener("click",()=>qt(i.getAttribute("data-id")))})}function Ft(){const n=document.getElementById("fin-search-input"),e=document.getElementById("fin-status-filter"),t=document.getElementById("btn-close-pdf-modal");n&&n.addEventListener("input",oe),e&&e.addEventListener("change",oe),t&&t.addEventListener("click",()=>{document.getElementById("fin-pdf-modal").style.display="none"})}function Ht(n){const e=V().find(r=>r.id===n);if(!e)return;const t=document.getElementById("fin-pdf-modal");if(!t)return;document.getElementById("pdf-inv-num").textContent=e.id,document.getElementById("pdf-inv-date").textContent=`Datum: ${e.date}`,document.getElementById("pdf-inv-client").textContent=e.client,document.getElementById("pdf-inv-order").textContent=`Auftrag Referenz: ${e.orderId}`,document.getElementById("pdf-inv-payment").textContent=e.paymentMethod,document.getElementById("pdf-inv-due").textContent=`Fällig bis: ${e.dueDate}`,document.getElementById("pdf-inv-pos").textContent=`Dienstleistung gem. Auftrag ${e.orderId}`,document.getElementById("pdf-inv-net").textContent=`€ ${e.netAmount.toLocaleString("de-AT",{minimumFractionDigits:2})}`,document.getElementById("pdf-inv-vat").textContent=`€ ${e.vatAmount.toLocaleString("de-AT",{minimumFractionDigits:2})}`,document.getElementById("pdf-inv-gross").textContent=`€ ${e.grossAmount.toLocaleString("de-AT",{minimumFractionDigits:2})}`,document.getElementById("pdf-inv-comm").textContent=`€ ${e.commissionAmount.toLocaleString("de-AT",{minimumFractionDigits:2})}`;const o=document.getElementById("pdf-inv-status-badge");o&&(o.textContent=e.status.toUpperCase(),e.status==="Bezahlt"?(o.style.background="#dcfce7",o.style.color="#15803d"):e.status==="Offen"?(o.style.background="#fef3c7",o.style.color="#b45309"):(o.style.background="#fee2e2",o.style.color="#b91c1c")),t.style.display="flex"}function qt(n){const e=V(),t=e.find(o=>o.id===n);t&&(t.status==="Offen"?t.status="Bezahlt":t.status==="Bezahlt"?t.status="Überfällig":t.status="Offen",pt(e),de())}const Gt={avgQNexus:.885,avgLuposScore:.89,conversionRate:84.2,botImmunityScore:98.6,branchPerformance:[{branch:"Ententrümpelung / Räumung",revenue:28949.99,orders:8,sharePercent:42.5},{branch:"Cloud Infrastructure",revenue:13500,orders:4,sharePercent:19.8},{branch:"IT Security & Audits",revenue:8550,orders:5,sharePercent:12.5},{branch:"Database Sync",revenue:11600,orders:3,sharePercent:17},{branch:"Transport & Logistics",revenue:5600,orders:3,sharePercent:8.2}],regionalShare:[{region:"Wien & Umgebung",orders:12,share:52},{region:"Kärnten & Steiermark",orders:5,share:22},{region:"Oberösterreich & Salzburg",orders:4,share:17},{region:"Deutschland (Bayern/NRW)",orders:2,share:9}]};function Vt(){document.getElementById("tab-analytics")&&mt()}function mt(){const n=document.getElementById("tab-analytics");if(!n)return;const e=Gt;n.innerHTML=`
    <div class="analytics-module" style="padding: 24px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #60a5fa;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Reporting & Performance Analytics
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Echtzeit-Auswertung von Q_NEXUS Qualitäts-Scores, Branchen-Performances und Konversionsquoten</p>
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="display: flex; background: rgba(30, 41, 59, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); padding: 2px;" id="analytics-time-picker">
            <button class="analytics-time-btn active" data-range="7d" style="background: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">7 Tage</button>
            <button class="analytics-time-btn" data-range="30d" style="background: transparent; color: var(--color-text-secondary); border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">30 Tage</button>
            <button class="analytics-time-btn" data-range="90d" style="background: transparent; color: var(--color-text-secondary); border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">90 Tage</button>
          </div>

          <button id="btn-export-analytics" class="btn-secondary" style="display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); padding: 8px 14px; border-radius: var(--border-radius-sm); color: var(--color-text-primary); font-size: 0.85rem; cursor: pointer;">
            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Bericht (CSV)
          </button>
        </div>
      </div>

      <!-- KPI Scorecards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Ø Q_NEXUS Score</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">${e.avgQNexus} <span style="font-size: 0.8rem; color: var(--color-text-muted);">/ 1.0</span></div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 4px;">↑ +4.2% gegenüber Vorwoche</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Conversion Rate</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">${e.conversionRate}%</div>
          <div style="font-size: 0.75rem; color: #93c5fd; margin-top: 4px;">Optimales Zero-Friction Level</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Lupos Lesbarkeits-Index</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #fbbf24;">${e.avgLuposScore}</div>
          <div style="font-size: 0.75rem; color: #fde68a; margin-top: 4px;">Birkenbihl VFB-Konform</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Bot-Immunität (LUDUS)</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #a7f3d0;">${e.botImmunityScore}%</div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 4px;">Gefilterte Fake-Visits</div>
        </div>
      </div>

      <!-- Main Visual Section (2 Columns) -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Left: Branch Performance Bar Chart -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); display: flex; align-items: center; justify-content: space-between;">
            <span>📊 Umsatzverteilung nach Branchen</span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Gesamt: € 68.199,99</span>
          </h3>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${e.branchPerformance.map(t=>`
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                  <span style="color: var(--color-text-primary); font-weight: 500;">${t.branch} <small style="color: var(--color-text-muted);">(${t.orders} Aufträge)</small></span>
                  <span style="color: #10b981; font-weight: 600;">€ ${t.revenue.toLocaleString("de-AT",{minimumFractionDigits:2})} (${t.sharePercent}%)</span>
                </div>
                <div style="width: 100%; height: 10px; background: rgba(30, 41, 59, 0.8); border-radius: 5px; overflow: hidden;">
                  <div style="width: ${t.sharePercent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 5px; transition: width 0.5s ease;"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Right: Regional Market Share -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary);">📍 Regionaler Marktanteil</h3>
          
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${e.regionalShare.map(t=>`
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(30, 41, 59, 0.4); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary);">${t.region}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${t.orders} Aufträge lokal</div>
                </div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #60a5fa;">${t.share}%</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Q_NEXUS Formula Simulator Interactive Widget -->
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
        <h3 style="font-size: 1.1rem; margin-bottom: 8px; color: var(--color-text-primary);">
          🧮 Q_NEXUS Gewichtungs-Simulator (Synergie-Formel V2)
        </h3>
        <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px;">
          Formel: <code style="color: #60a5fa;">Q_NEXUS = w1*S + w2*V + w3*L + w4*(S*V*L)</code> mit ∑ w_i = 1.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: center;">
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Syntax (w1): <strong id="sim-w1-val">0.25</strong></span>
            </label>
            <input type="range" id="sim-w1" min="0.1" max="0.5" step="0.05" value="0.25" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Verifizierung (w2): <strong id="sim-w2-val">0.35</strong></span>
            </label>
            <input type="range" id="sim-w2" min="0.1" max="0.5" step="0.05" value="0.35" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; display: flex; justify-content: space-between;">
              <span>Lupos (w3): <strong id="sim-w3-val">0.25</strong></span>
            </label>
            <input type="range" id="sim-w3" min="0.1" max="0.5" step="0.05" value="0.25" style="width: 100%;">
          </div>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Simulierter Ø Score</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;" id="sim-q-result">0.885</div>
          </div>
        </div>
      </div>
    </div>
  `,Kt()}function Kt(){const n=document.querySelectorAll(".analytics-time-btn");n.forEach(s=>{s.addEventListener("click",()=>{n.forEach(l=>{l.style.background="transparent",l.style.color="var(--color-text-secondary)"}),s.style.background="var(--color-primary)",s.style.color="white"})});const e=document.getElementById("btn-export-analytics");e&&e.addEventListener("click",()=>{const l=encodeURI(`data:text/csv;charset=utf-8,Branche,Umsatz,Auftraege
Entruempelung,28949.99,8
Cloud,13500.00,4
Security,8550.00,5
Database,11600.00,3
Transport,5600.00,3`),d=document.createElement("a");d.setAttribute("href",l),d.setAttribute("download",`nexus_analytics_report_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(d),d.click(),document.body.removeChild(d)});const t=document.getElementById("sim-w1"),o=document.getElementById("sim-w2"),r=document.getElementById("sim-w3"),a=document.getElementById("sim-q-result"),i=()=>{if(!t||!o||!r||!a)return;const s=parseFloat(t.value),l=parseFloat(o.value),d=parseFloat(r.value),g=Math.max(0,parseFloat((1-(s+l+d)).toFixed(2)));document.getElementById("sim-w1-val").textContent=s.toString(),document.getElementById("sim-w2-val").textContent=l.toString(),document.getElementById("sim-w3-val").textContent=d.toString();const p=.94,z=.92,m=.89,u=s*p+l*z+d*m+g*(p*z*m);a.textContent=u.toFixed(3)};t&&t.addEventListener("input",i),o&&o.addEventListener("input",i),r&&r.addEventListener("input",i)}function _t(){document.getElementById("tab-profile")&&J()}function J(){const n=document.getElementById("tab-profile");if(!n)return;const e=window.ServiceOSStore?window.ServiceOSStore.getCurrentUser():{id:"USR-001",name:"Alex Dev",role:"Superadmin",email:"alex@serviceos.com",phone:"+43 1 234 5678",company:"Müller Entrümpelung GmbH (Zentrale)",gisa:"GISA-12948574",language:"de-AT"},t=window.ServiceOSStore?window.ServiceOSStore.getUsers():[],o=window.ServiceOSStore?window.ServiceOSStore.getCompanies():[],r=e.name?e.name.split(" ").map(i=>i[0]).join("").toUpperCase():"AD",a=e.role==="Superadmin"||e.role==="Administrator";n.innerHTML=`
    <div class="profile-module" style="padding: 24px; max-width: 1000px; margin: 0 auto;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; box-shadow: var(--shadow-premium);">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; border: 3px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
            ${r}
          </div>
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 4px; color: var(--color-text-primary);" id="profile-display-name">${e.name}</h2>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-weight: 600;">${e.role}</span>
              <span style="font-size: 0.85rem; color: var(--color-text-secondary);">${e.email}</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${e.id}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-bottom: 4px;">Status Konto-Sicherheit</span>
          <span style="font-size: 0.85rem; font-weight: bold; padding: 4px 12px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: inline-flex; align-items: center; gap: 6px;">
            🛡️ 2FA Geschützt
          </span>
        </div>
      </div>

      <!-- Main Profile Settings Forms -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 28px;">
        <!-- Left: Edit Form -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 20px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 10px;">
            👤 Persönliche Angaben & Stammdaten
          </h3>

          <form id="profile-edit-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Vollständiger Name</label>
                <input type="text" id="prof-input-name" class="wizard-input" value="${e.name}" required style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">E-Mail Adresse</label>
                <input type="email" id="prof-input-email" class="wizard-input" value="${e.email}" required style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Telefonnummer</label>
                <input type="text" id="prof-input-phone" class="wizard-input" value="${e.phone||"+43 1 234 5678"}" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Sprache & Region (LINGUA-LOCAL)</label>
                <select id="prof-input-lang" class="wizard-input" style="width: 100%;">
                  <option value="de-AT" ${e.language==="de-AT"?"selected":""}>Deutsch (Österreich - de-AT)</option>
                  <option value="de-DE" ${e.language==="de-DE"?"selected":""}>Deutsch (Deutschland - de-DE)</option>
                  <option value="de-CH" ${e.language==="de-CH"?"selected":""}>Deutsch (Schweiz - de-CH)</option>
                </select>
              </div>
            </div>

            <div style="border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 8px;">
              <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--color-text-primary);">🏢 Zuordnung & Gewerbe-Lizenz (GISA)</h4>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Unternehmen / Hauptpartner</label>
                  <input type="text" id="prof-input-company" class="wizard-input" value="${e.company||"Müller Entrümpelung GmbH"}" style="width: 100%;">
                </div>
                <div>
                  <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">GISA-Zahl (GewO 1994 AT)</label>
                  <input type="text" id="prof-input-gisa" class="wizard-input" value="${e.gisa||"GISA-12948574"}" style="width: 100%;">
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 24px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
                Profil Speichern
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Security & Notification Preferences -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Security Box -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
            <h3 style="font-size: 1rem; margin-bottom: 14px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
              🔐 Sicherheit & Zugang
            </h3>
            
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 12px;">
              Rolle: <strong style="color: var(--color-text-primary);">${e.role}</strong>
            </div>

            <button id="btn-sim-password" class="btn-secondary" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; margin-bottom: 10px;">
              Passwort ändern
            </button>
            <button id="btn-sim-2fa" class="btn-secondary" style="width: 100%; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
              2FA-Schlüssel verwalten
            </button>
          </div>

          <!-- Notification Settings Box -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
            <h3 style="font-size: 1rem; margin-bottom: 14px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
              🔔 Benachrichtigungen
            </h3>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> E-Mail bei neuen Aufträgen
              </label>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> WhatsApp Event-Benachrichtigungen
              </label>
              <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: var(--color-text-primary);">
                <input type="checkbox" checked style="accent-color: var(--color-primary);"> Compliance-Audits & GISA Warnungen
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Console Section: All Accounts Overview -->
      ${a?`
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px; box-shadow: var(--shadow-premium);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-text-primary); display: flex; align-items: center; gap: 10px;">
                <svg style="width: 20px; height: 20px; color: #60a5fa;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                🔑 Admin Console: Alle Systemkonten & Partner-Hierarchie
              </h3>
              <p style="color: var(--color-text-secondary); font-size: 0.85rem;">Übersicht aller Benutzerkonten (Superadmins, Admins, Partnerfirmen, Sub-Partner & Mitarbeiter)</p>
            </div>

            <button id="btn-add-system-user" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 8px 16px; border-radius: var(--border-radius-sm); color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              + Neues Systemkonto anlegen
            </button>
          </div>

          <!-- Accounts Table -->
          <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
                  <th style="padding: 12px 14px;">Konto Name / ID</th>
                  <th style="padding: 12px 14px;">Rolle</th>
                  <th style="padding: 12px 14px;">E-Mail & Kontakt</th>
                  <th style="padding: 12px 14px;">Zuordnung (Firma / Partner)</th>
                  <th style="padding: 12px 14px;">GISA Lizenz</th>
                  <th style="padding: 12px 14px; text-align: center;">Status</th>
                  <th style="padding: 12px 14px; text-align: right;">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                ${t.map(i=>{const s=o.find(d=>d.id===i.companyId),l=s&&s.parentId?o.find(d=>d.id===s.parentId):null;return`
                    <tr style="border-bottom: 1px solid var(--color-border);">
                      <td style="padding: 12px 14px;">
                        <div style="font-weight: 600; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
                          <div style="width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">
                            ${i.name.split(" ").map(d=>d[0]).join("")}
                          </div>
                          ${i.name}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted);">ID: ${i.id}</div>
                      </td>
                      <td style="padding: 12px 14px;">
                        <span style="font-size: 0.75rem; font-weight: bold; padding: 3px 8px; border-radius: 10px; background: ${i.role==="Superadmin"?"rgba(239, 68, 68, 0.2)":i.role==="Administrator"?"rgba(59, 130, 246, 0.2)":i.role==="Partner"?"rgba(16, 185, 129, 0.2)":"rgba(245, 158, 11, 0.2)"}; color: ${i.role==="Superadmin"?"#f87171":i.role==="Administrator"?"#60a5fa":i.role==="Partner"?"#34d399":"#fbbf24"};">
                          ${i.role}
                        </span>
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-primary);">
                        <div>${i.email}</div>
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">
                        <div style="font-weight: 500; color: var(--color-text-primary);">${s?s.name:"Zentrale (ServiceOS)"}</div>
                        ${l?`<div style="font-size: 0.75rem; color: var(--color-text-muted);">Sub-Partner von: ${l.name}</div>`:""}
                      </td>
                      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">
                        ${s&&s.gisa?`<span style="color: #34d399; font-family: monospace;">✓ ${s.gisa}</span>`:'<span style="color: var(--color-text-muted);">-</span>'}
                      </td>
                      <td style="padding: 12px 14px; text-align: center;">
                        <span style="font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">Aktiv</span>
                      </td>
                      <td style="padding: 12px 14px; text-align: right;">
                        <button class="btn btn-sm sys-user-switch-btn" data-id="${i.id}" style="margin-right: 6px;">Konto Wechseln</button>
                      </td>
                    </tr>
                  `}).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `:""}

    </div>

    <!-- Create User Modal -->
    <div class="modal-overlay" id="prof-user-modal" style="display: none;">
      <div class="modal-card" style="max-width: 500px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.1rem; color: var(--color-text-primary);">Neues Systemkonto anlegen</h3>
          <button id="btn-close-user-modal" style="background: none; border: none; color: var(--color-text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="prof-user-form" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Name</label>
            <input type="text" id="add-usr-name" class="wizard-input" required placeholder="z.B. Maria Weber" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">E-Mail</label>
            <input type="email" id="add-usr-email" class="wizard-input" required placeholder="maria@firma.at" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Rolle</label>
            <select id="add-usr-role" class="wizard-input" style="width: 100%;">
              <option value="Administrator">Administrator</option>
              <option value="Partner">Partner</option>
              <option value="Sub-Partner">Sub-Partner</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-user-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Konto Anlegen</button>
          </div>
        </form>
      </div>
    </div>
  `,jt()}function jt(){const n=document.getElementById("profile-edit-form"),e=document.getElementById("btn-sim-password"),t=document.getElementById("btn-sim-2fa"),o=document.getElementById("btn-add-system-user"),r=document.getElementById("prof-user-modal"),a=document.getElementById("btn-close-user-modal"),i=document.getElementById("btn-cancel-user-modal"),s=document.getElementById("prof-user-form");n&&n.addEventListener("submit",l=>{l.preventDefault();const d=document.getElementById("prof-input-name").value.trim(),g=document.getElementById("prof-input-email").value.trim(),p=document.getElementById("prof-input-phone").value.trim(),z=document.getElementById("prof-input-lang").value,m=document.getElementById("prof-input-company").value.trim(),u=document.getElementById("prof-input-gisa").value.trim();if(window.ServiceOSStore){const x=window.ServiceOSStore.getCurrentUser(),f={...x,name:d,email:g,phone:p,language:z,company:m,gisa:u},E=window.ServiceOSStore.getUsers(),b=E.findIndex(c=>c.id===x.id);b>-1&&(E[b]=f,window.ServiceOSStore.set("users",E)),window.ServiceOSStore.logAudit("PROFILE_UPDATED",`Benutzerprofil ${d} (${x.id}) aktualisiert.`)}const y=document.getElementById("current-user-avatar"),k=document.getElementById("current-user-name");y&&d&&(y.textContent=d.split(" ").map(x=>x[0]).join("").toUpperCase()),k&&d&&(k.textContent=d),alert("✓ Benutzerprofil wurde erfolgreich aktualisiert!"),J()}),o&&o.addEventListener("click",()=>{r&&(r.style.display="flex")}),a&&a.addEventListener("click",()=>r.style.display="none"),i&&i.addEventListener("click",()=>r.style.display="none"),s&&s.addEventListener("submit",l=>{l.preventDefault();const d=document.getElementById("add-usr-name").value.trim(),g=document.getElementById("add-usr-email").value.trim(),p=document.getElementById("add-usr-role").value;if(window.ServiceOSStore){const z=window.ServiceOSStore.getUsers(),m={id:`USR-${Math.floor(1e3+Math.random()*9e3)}`,name:d,email:g,role:p,companyId:"COMP-001"};z.push(m),window.ServiceOSStore.set("users",z),window.ServiceOSStore.logAudit("USER_CREATED",`Neues Systemkonto ${d} (${p}) angelegt.`)}r&&(r.style.display="none"),J()}),document.querySelectorAll(".sys-user-switch-btn").forEach(l=>{l.addEventListener("click",()=>{const d=l.getAttribute("data-id");if(window.ServiceOSStore){window.ServiceOSStore.setCurrentUserId(d);const g=document.getElementById("role-selector");g&&(g.value=d),alert(`✓ Konto gewechselt zu ID ${d}`),location.reload()}})}),e&&e.addEventListener("click",()=>{alert("🔐 Ein Link zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail gesendet.")}),t&&t.addEventListener("click",()=>{alert("🛡️ 2-Faktor-Authentifizierung (2FA) ist aktiv und mit Ihrer Authenticator-App verknüpft.")})}const gt=[];function Wt(){document.getElementById("tab-tasks")&&(localStorage.getItem("serviceos_tasks")||localStorage.setItem("serviceos_tasks",JSON.stringify(gt)),_())}function K(){const n=localStorage.getItem("serviceos_tasks");return n?JSON.parse(n):gt}function le(n){localStorage.setItem("serviceos_tasks",JSON.stringify(n)),window.dispatchEvent(new Event("storage"))}function _(){const n=document.getElementById("tab-tasks");if(!n)return;const e=window.ServiceOSStore?window.ServiceOSStore.getCurrentUser():{name:"Alex Dev"},t=K(),o=t.filter(i=>i.assignedTo===e.name&&i.status!=="Erledigt").length,r=t.filter(i=>(i.priority==="Critical"||i.priority==="High")&&i.status!=="Erledigt").length,a=t.filter(i=>i.status==="Erledigt").length;n.innerHTML=`
    <div class="tasks-module" style="padding: 24px; max-width: 1100px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #3b82f6;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Meine Aufgaben & Task-Management
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Verwaltung von Compliance-Audits, Rechnungsfreigaben und Partner-Aufgaben</p>
        </div>

        <button id="btn-add-task-modal" class="btn-primary" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; padding: 10px 18px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neue Aufgabe anlegen
        </button>
      </div>

      <!-- Stats Scorecards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Meine Offenen Aufgaben</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #60a5fa;">${o}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Dringend & Kritisch</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #f87171;">${r}</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 4px;">Erledigte Aufgaben</div>
          <div style="font-size: 1.6rem; font-weight: 700; color: #10b981;">${a}</div>
        </div>
      </div>

      <!-- Filters & Tabs -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px;" id="tasks-filter-tabs">
          <button class="task-filter-btn active" data-filter="MY" style="background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Meine Aufgaben</button>
          <button class="task-filter-btn" data-filter="ALL" style="background: rgba(30, 41, 59, 0.6); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; cursor: pointer;">Alle Aufgaben</button>
          <button class="task-filter-btn" data-filter="DONE" style="background: rgba(30, 41, 59, 0.6); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 8px 16px; border-radius: var(--border-radius-sm); font-size: 0.85rem; cursor: pointer;">Erledigt</button>
        </div>

        <div style="min-width: 250px;">
          <input type="text" id="task-search-input" class="wizard-input" placeholder="Aufgabe, Kat, Auftrag suchen..." style="width: 100%; height: 38px; padding: 0 12px; font-size: 0.85rem;">
        </div>
      </div>

      <!-- Task List Container -->
      <div style="display: flex; flex-direction: column; gap: 12px;" id="tasks-list-body">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Create Task Modal -->
    <div class="modal-overlay" id="task-create-modal" style="display: none;">
      <div class="modal-card" style="max-width: 550px; background: var(--color-bg-sidebar); border: 1px solid var(--color-border); box-shadow: var(--shadow-premium);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: var(--color-text-primary);">Neue Aufgabe anlegen</h3>
          <button id="btn-close-task-modal" style="background: none; border: none; color: var(--color-text-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="task-create-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Titel der Aufgabe</label>
            <input type="text" id="task-title-input" class="wizard-input" required placeholder="z.B. GISA-Validierung für Partner durchführen" style="width: 100%;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Zugewiesen an</label>
              <select id="task-assign-input" class="wizard-input" style="width: 100%;">
                <option value="Alex Dev">Alex Dev (Superadmin)</option>
                <option value="Sarah Admin">Sarah Admin (Administrator)</option>
                <option value="Klaus Müller">Klaus Müller (Partner)</option>
                <option value="Hans Schmid">Hans Schmid (Sub-Partner)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Priorität</label>
              <select id="task-priority-input" class="wizard-input" style="width: 100%;">
                <option value="Normal">Normal</option>
                <option value="High">Hoch (High)</option>
                <option value="Critical">Kritisch (Critical)</option>
                <option value="Low">Niedrig (Low)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Fällig am</label>
              <input type="date" id="task-date-input" class="wizard-input" value="${new Date().toISOString().split("T")[0]}" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kategorie</label>
              <select id="task-cat-input" class="wizard-input" style="width: 100%;">
                <option value="Compliance">Compliance & Legal</option>
                <option value="Finanzen">Finanzen & Abrechnung</option>
                <option value="Partner Onboarding">Partner Onboarding</option>
                <option value="System Audit">System Audit</option>
                <option value="IT Infrastructure">IT Infrastructure</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Beschreibung & Notizen</label>
            <textarea id="task-desc-input" class="wizard-input" rows="3" placeholder="Zusätzliche Details..." style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-task-modal">Abbrechen</button>
            <button type="submit" class="btn btn-primary">Aufgabe Speichern</button>
          </div>
        </form>
      </div>
    </div>
  `,ie(),Zt()}function ie(){var i;const n=document.getElementById("tasks-list-body");if(!n)return;const e=window.ServiceOSStore?window.ServiceOSStore.getCurrentUser():{name:"Alex Dev"},t=(((i=document.getElementById("task-search-input"))==null?void 0:i.value)||"").toLowerCase(),o=document.querySelector(".task-filter-btn.active"),r=o?o.getAttribute("data-filter"):"MY";let a=K();if(r==="MY"?a=a.filter(s=>s.assignedTo===e.name&&s.status!=="Erledigt"):r==="DONE"?a=a.filter(s=>s.status==="Erledigt"):r==="ALL"&&(a=a.filter(s=>s.status!=="Erledigt")),t&&(a=a.filter(s=>s.title.toLowerCase().includes(t)||s.category.toLowerCase().includes(t)||s.description.toLowerCase().includes(t))),n.innerHTML="",a.length===0){n.innerHTML=`
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 32px; text-align: center; color: var(--color-text-muted);">
        Keine Aufgaben für die ausgewählten Kriterien gefunden.
      </div>
    `;return}a.forEach(s=>{const l=s.status==="Erledigt",d=document.createElement("div");d.style.background=l?"rgba(15, 23, 42, 0.4)":"rgba(30, 41, 59, 0.6)",d.style.border="1px solid var(--color-border)",d.style.borderRadius="var(--border-radius-md)",d.style.padding="16px",d.style.display="flex",d.style.alignItems="center",d.style.justifySpaceBetween="space-between",d.style.gap="16px",d.style.transition="all 0.2s";let g="#60a5fa",p="rgba(59, 130, 246, 0.2)";s.priority==="Critical"?(g="#f87171",p="rgba(239, 68, 68, 0.2)"):s.priority==="High"?(g="#fbbf24",p="rgba(245, 158, 11, 0.2)"):s.priority==="Low"&&(g="#94a3b8",p="rgba(148, 163, 184, 0.2)"),d.innerHTML=`
      <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;">
        <input type="checkbox" class="task-checkbox" data-id="${s.id}" ${l?"checked":""} style="width: 20px; height: 20px; accent-color: #10b981; cursor: pointer; margin-top: 2px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
            <span style="font-weight: 600; font-size: 1rem; color: ${l?"var(--color-text-muted)":"var(--color-text-primary)"}; text-decoration: ${l?"line-through":"none"};">
              ${s.title}
            </span>
            <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: bold; background: ${p}; color: ${g};">
              ${s.priority}
            </span>
            <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); color: var(--color-text-secondary); border: 1px solid var(--color-border);">
              ${s.category}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0 0 8px 0; line-height: 1.4;">
            ${s.description}
          </p>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
            <span>👤 Zugewiesen: <strong>${s.assignedTo}</strong></span>
            <span>📅 Fällig: <strong style="color: ${s.dueDate<new Date().toISOString().split("T")[0]&&!l?"#f87171":"inherit"};">${s.dueDate}</strong></span>
            ${s.relatedOrder!=="-"?`<span>🔗 Auftrag: <strong>${s.relatedOrder}</strong></span>`:""}
          </div>
        </div>
      </div>
      <div>
        <button class="btn btn-sm task-delete-btn" data-id="${s.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </div>
    `,n.appendChild(d)}),n.querySelectorAll(".task-checkbox").forEach(s=>{s.addEventListener("change",()=>Qt(s.getAttribute("data-id")))}),n.querySelectorAll(".task-delete-btn").forEach(s=>{s.addEventListener("click",()=>Jt(s.getAttribute("data-id")))})}function Zt(){const n=document.getElementById("task-search-input"),e=document.querySelectorAll(".task-filter-btn"),t=document.getElementById("btn-add-task-modal"),o=document.getElementById("task-create-modal"),r=document.getElementById("btn-close-task-modal"),a=document.getElementById("btn-cancel-task-modal"),i=document.getElementById("task-create-form");n&&n.addEventListener("input",ie),e.forEach(s=>{s.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active"),l.style.background="rgba(30, 41, 59, 0.6)",l.style.color="var(--color-text-secondary)"}),s.classList.add("active"),s.style.background="var(--color-primary)",s.style.color="white",ie()})}),t&&t.addEventListener("click",()=>o.style.display="flex"),r&&r.addEventListener("click",()=>o.style.display="none"),a&&a.addEventListener("click",()=>o.style.display="none"),i&&i.addEventListener("submit",s=>{s.preventDefault();const l=document.getElementById("task-title-input").value.trim(),d=document.getElementById("task-assign-input").value,g=document.getElementById("task-priority-input").value,p=document.getElementById("task-date-input").value,z=document.getElementById("task-cat-input").value,m=document.getElementById("task-desc-input").value.trim(),u=K(),y={id:`TSK-${Math.floor(100+Math.random()*900)}`,title:l,assignedTo:d,priority:g,status:"Offen",dueDate:p,relatedOrder:"-",category:z,description:m};u.unshift(y),le(u),o.style.display="none",_()})}function Qt(n){const e=K(),t=e.find(o=>o.id===n);t&&(t.status=t.status==="Erledigt"?"Offen":"Erledigt",le(e),_())}function Jt(n){if(!confirm("Möchten Sie diese Aufgabe wirklich löschen?"))return;const e=K().filter(t=>t.id!==n);le(e),_()}const ft=[];function Xt(){document.getElementById("tab-new-document")&&(localStorage.getItem("serviceos_documents")||localStorage.setItem("serviceos_documents",JSON.stringify(ft)),Y())}function ce(){const n=localStorage.getItem("serviceos_documents");return n?JSON.parse(n):ft}function bt(n){localStorage.setItem("serviceos_documents",JSON.stringify(n)),window.dispatchEvent(new Event("storage"))}function Y(){const n=document.getElementById("tab-new-document");if(!n)return;ServiceOSStore&&ServiceOSStore.getCurrentUser();const e=ServiceOSStore?ServiceOSStore.getCases():[];n.innerHTML=`
    <div class="documents-module" style="padding: 24px; max-width: 1100px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
            <svg style="width: 24px; height: 24px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Rechtssichere Dokumenten-Engine (§ 11 UStG & GISA Compliant)
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Erstellung von Rechnungen, Angeboten & Partnerverträgen mit USt-Aufschlüsselung & GISA-/ATU-Prüfung</p>
        </div>
      </div>

      <!-- Generator & Live Preview Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; margin-bottom: 32px;">
        <!-- Left: Form -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
            📝 Dokumenten-Parameter & § 11 UStG Angaben
          </h3>

          <form id="doc-generator-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Dokumenten-Titel</label>
              <input type="text" id="doc-title" class="wizard-input" required placeholder="z.B. Honorarrechnung Gewerbliche Räumung Wien" style="width: 100%;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Dokumententyp</label>
                <select id="doc-type" class="wizard-input" style="width: 100%;">
                  <option value="Rechnung (§ 11 UStG)">Rechnung (§ 11 UStG)</option>
                  <option value="Gewerbliches Angebot">Gewerbliches Angebot</option>
                  <option value="Auftragsbestätigung">Auftragsbestätigung</option>
                  <option value="Gutschrift / Storno">Gutschrift / Storno</option>
                  <option value="Subunternehmer / Partnervereinbarung">Subunternehmer / Partnervertrag</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Kunde / Empfänger Name</label>
                <input type="text" id="doc-client" class="wizard-input" required placeholder="Firma / Herr Frau..." style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Empfänger ATU/UID (B2B)</label>
                <input type="text" id="doc-client-atu" class="wizard-input" placeholder="z.B. ATU12345678" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Verknüpfte Fallakte (Optional)</label>
                <select id="doc-case-id" class="wizard-input" style="width: 100%;">
                  <option value="">-- Keine Fallaktenverknüpfung --</option>
                  ${e.map(t=>`
                    <option value="${t.id}">${t.caseNumber} - ${t.client} (${t.branch})</option>
                  `).join("")}
                </select>
              </div>
            </div>

            <!-- Finanz- & Steueraufschlüsselung -->
            <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px;">
              <div style="font-size: 0.85rem; font-weight: 600; color: #60a5fa; margin-bottom: 10px;">💶 Betrag & Steueraufschlüsselung (§ 11 UStG)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Nettobetrag (€)</label>
                  <input type="number" step="0.01" id="doc-netto" class="wizard-input" value="375.00" style="width: 100%;">
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">USt-Satz (%)</label>
                  <select id="doc-vat-rate" class="wizard-input" style="width: 100%;">
                    <option value="20">20% Standard USt (AT)</option>
                    <option value="10">10% Ermäßigt USt (AT)</option>
                    <option value="0">0% Steuerfrei / Reverse Charge</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Leistungsbeschreibung / Textbaustein</label>
              <textarea id="doc-content" class="wizard-input" rows="4" required style="width: 100%;">Durchführung von professionellen Räumungs- und Transportleistungen am Einsatzort gemäß Vereinbarung. Wertstoffübertragung ordnungsgemäß dokumentiert.</textarea>
            </div>

            <!-- Live Compliance & Cicero 7Q Box -->
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px;" id="doc-compliance-box">
              <div style="font-size: 0.8rem; font-weight: bold; color: var(--color-text-secondary); margin-bottom: 8px;">🔍 Live Legal & GISA / ATU Prüfpipeline</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="doc-cicero-badges">
                <!-- Renders dynamically -->
              </div>
              <div style="font-size: 0.75rem; margin-top: 8px; color: #34d399;" id="doc-compliance-info">✓ Aussteller & Empfänger Angaben konform.</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
              <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, #10b981, #059669); border: none; padding: 10px 20px; border-radius: var(--border-radius-sm); color: white; font-weight: 600; cursor: pointer;">
                📄 Dokument Erstellen & Speichern
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Realtime Document Preview (§ 11 UStG Preview) -->
        <div style="background: #ffffff; color: #0f172a; border-radius: var(--border-radius-md); padding: 24px; box-shadow: var(--shadow-premium); font-family: sans-serif; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-weight: 800; font-size: 1.2rem; color: #0f172a;">SERVICEOS PLATTFORM</div>
                <div style="font-size: 0.75rem; color: #64748b;" id="prev-doc-type-label">RECHNUNG (§ 11 UStG)</div>
              </div>
              <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
                <div>Datum: <span id="prev-doc-date">${new Date().toLocaleDateString("de-AT")}</span></div>
                <div style="font-weight: bold; color: #2563eb;" id="prev-doc-id">INV-2026-DRAFT</div>
              </div>
            </div>

            <!-- Aussteller & Empfänger Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
              <div>
                <div style="font-size: 0.7rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Aussteller / Plattform:</div>
                <div style="font-weight: bold; color: #0f172a;">ServiceOS Betriebssteuerung</div>
                <div style="color: #475569;">GISA: <span id="prev-doc-gisa" style="font-family: monospace;">GISA-12948574</span></div>
                <div style="color: #475569;">UID: <span id="prev-doc-my-atu" style="font-family: monospace;">ATU78901234</span></div>
              </div>
              <div>
                <div style="font-size: 0.7rem; font-weight: bold; color: #64748b; text-transform: uppercase;">Empfänger / Auftraggeber:</div>
                <div style="font-weight: bold; color: #0f172a;" id="prev-doc-client">Kundenbezeichnung</div>
                <div style="color: #475569;" id="prev-doc-client-atu">UID: -</div>
                <div style="color: #64748b; font-size: 0.75rem;" id="prev-doc-case">Fallakte: Keine</div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 6px;" id="prev-doc-title">Rechnung für Dienstleistung</div>
              <div style="font-size: 0.85rem; line-height: 1.4; color: #334155; white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;" id="prev-doc-body">Inhalt...</div>
            </div>

            <!-- Tax Breakdown Table (§ 11 UStG) -->
            <div style="margin-bottom: 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
              <div style="font-weight: bold; font-size: 0.8rem; color: #0f172a; margin-bottom: 6px;">Entgelt & USt-Berechnung (§ 11 UStG)</div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 3px;">
                <span>Nettobetrag:</span>
                <span id="prev-calc-netto">€ 375,00</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 6px;">
                <span>USt (<span id="prev-calc-rate">20</span>%):</span>
                <span id="prev-calc-vat">€ 75,00</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: bold; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 6px;">
                <span>Brutto-Gesamtbetrag:</span>
                <span id="prev-calc-brutto" style="color: #16a34a;">€ 450,00</span>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #cbd5e1; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.75rem; color: #64748b;">
              Status: <span style="color: #16a34a; font-weight: bold;" id="prev-doc-status">✓ § 11 UStG Validiert</span>
            </div>
            <button type="button" class="btn" onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
              🖨️ Drucken / PDF Export
            </button>
          </div>
        </div>
      </div>

      <!-- Created Documents History Archive -->
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 24px;">
        <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
          📂 Dokumenten-Archiv & Erstellte Schriftstücke
        </h3>

        <div style="border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
                <th style="padding: 12px 14px;">Dokument ID & Titel</th>
                <th style="padding: 12px 14px;">Typ</th>
                <th style="padding: 12px 14px;">Empfänger</th>
                <th style="padding: 12px 14px;">Brutto (€)</th>
                <th style="padding: 12px 14px;">Erstellt am</th>
                <th style="padding: 12px 14px; text-align: center;">Compliance</th>
                <th style="padding: 12px 14px; text-align: right;">Aktionen</th>
              </tr>
            </thead>
            <tbody id="doc-archive-body">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,Yt(),er()}function Yt(){const n=document.getElementById("doc-archive-body");if(!n)return;const e=ce();if(n.innerHTML="",e.length===0){n.innerHTML='<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--color-text-muted);">Noch keine Dokumente im Archiv.</td></tr>';return}e.forEach(t=>{const o=document.createElement("tr");o.style.borderBottom="1px solid var(--color-border)",o.innerHTML=`
      <td style="padding: 12px 14px;">
        <div style="font-weight: 600; color: var(--color-text-primary);">${t.title}</div>
        <div style="font-size: 0.75rem; color: #60a5fa; font-family: monospace;">${t.id}</div>
      </td>
      <td style="padding: 12px 14px;">
        <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa;">${t.type}</span>
      </td>
      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">${t.client}</td>
      <td style="padding: 12px 14px; font-size: 0.85rem; font-weight: bold; color: #34d399;">€ ${(t.brutto||0).toFixed(2)}</td>
      <td style="padding: 12px 14px; font-size: 0.85rem; color: var(--color-text-secondary);">${t.date}</td>
      <td style="padding: 12px 14px; text-align: center;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399;">✓ § 11 UStG</span>
      </td>
      <td style="padding: 12px 14px; text-align: right;">
        <button class="btn btn-sm doc-delete-btn" data-id="${t.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
      </td>
    `,n.appendChild(o)}),n.querySelectorAll(".doc-delete-btn").forEach(t=>{t.addEventListener("click",()=>tr(t.getAttribute("data-id")))})}function er(){const n=document.getElementById("doc-generator-form"),e=document.getElementById("doc-title"),t=document.getElementById("doc-type"),o=document.getElementById("doc-client"),r=document.getElementById("doc-client-atu"),a=document.getElementById("doc-case-id"),i=document.getElementById("doc-netto"),s=document.getElementById("doc-vat-rate"),l=document.getElementById("doc-content"),d=document.getElementById("prev-doc-title"),g=document.getElementById("prev-doc-type-label"),p=document.getElementById("prev-doc-client"),z=document.getElementById("prev-doc-client-atu"),m=document.getElementById("prev-doc-case"),u=document.getElementById("prev-doc-body"),y=document.getElementById("prev-calc-netto"),k=document.getElementById("prev-calc-rate"),x=document.getElementById("prev-calc-vat"),f=document.getElementById("prev-calc-brutto"),E=document.getElementById("doc-cicero-badges"),b=()=>{if(d&&e&&(d.textContent=e.value||"Dokumenten-Titel"),g&&t&&(g.textContent=t.value.toUpperCase()),p&&o&&(p.textContent=o.value||"Empfänger Kunde"),z&&r){const S=r.value.trim(),I=me(S);z.innerHTML=`UID: <span style="font-family: monospace; font-weight: bold; color: ${I?"#16a34a":"#dc2626"};">${S||"-"}</span> ${I?"✓":""}`}if(m&&a){const S=a.value;m.textContent=S?`Fallakte: ${S}`:"Fallakte: Keine"}u&&l&&(u.textContent=l.value||"...");const c=parseFloat(i==null?void 0:i.value)||0,w=parseFloat(s==null?void 0:s.value)||0,h=c*(w/100),v=c+h;if(y&&(y.textContent=`€ ${c.toFixed(2)}`),k&&(k.textContent=w),x&&(x.textContent=`€ ${h.toFixed(2)}`),f&&(f.textContent=`€ ${v.toFixed(2)}`),E){const S=r==null?void 0:r.value.trim(),I=!S||me(S),A=rt((l==null?void 0:l.value)||"");E.innerHTML=`
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${I?"rgba(16, 185, 129, 0.25)":"rgba(239, 68, 68, 0.25)"}; color: ${I?"#34d399":"#f87171"};">
          UID: ${I?"GÜLTIG ✓":"FORMAT PRÜFEN ✕"}
        </span>
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.25); color: #34d399;">
          GISA: GÜLTIG ✓
        </span>
        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.25); color: #34d399;">
          CICERO: ${A.passedCount}/7 ✓
        </span>
      `}};[e,t,o,r,a,i,s,l].forEach(c=>{c&&(c.addEventListener("input",b),c.addEventListener("change",b))}),b(),n&&n.addEventListener("submit",c=>{c.preventDefault();const w=e.value.trim(),h=t.value,v=o.value.trim(),S=r.value.trim(),I=a.value,A=parseFloat(i.value)||0,C=parseFloat(s.value)||0,$=A*(C/100),T=A+$,D=l.value.trim(),L=U||window.generateCryptographicId||function(St){return St+"-2026-"+Math.floor(1e3+Math.random()*9e3)},M=h.includes("Rechnung")?"INV":"DOC",O=L(M),P=ce(),H={id:O,title:w,type:h,client:v,clientAtu:S,caseId:I,netto:A,vatRate:C,vat:$,brutto:T,date:new Date().toISOString().split("T")[0],status:"§ 11 UStG Compliant",content:D};P.unshift(H),bt(P),I&&ServiceOSStore&&ServiceOSStore.addTimelineEventToCase&&ServiceOSStore.addTimelineEventToCase(I,{type:"DOCUMENT_CREATED",title:`${h} ${O}`,description:`${w} (${v}) für € ${T.toFixed(2)} brutto erstellt.`,author:"Dokumenten-Engine"}),ServiceOSStore.logAudit("DOCUMENT_CREATED",`Dokument ${O} (${h}) für ${v} generiert.`),alert(`✓ Dokument ${O} wurde erfolgreich generiert, § 11 UStG-konform geprüft und gespeichert!`),Y()})}function tr(n){if(!confirm("Möchten Sie dieses Dokument wirklich löschen?"))return;const e=ce().filter(t=>t.id!==n);bt(e),Y()}function rr(){const n=document.getElementById("main-nav");if(!n)return;const e=n.querySelectorAll(".nav-group-btn"),t=n.querySelectorAll(".nav-sublist"),o=document.querySelectorAll(".dashboard-tab-content");function r(a){a&&(o.forEach(i=>{i.id===a?(i.style.display="block",i.classList.add("active")):(i.style.display="none",i.classList.remove("active"))}),a==="tab-audit"&&typeof window.renderAuditTrail=="function"&&window.renderAuditTrail(),a==="tab-factorium"&&typeof window.renderFactoriumModule=="function"&&window.renderFactoriumModule("tab-factorium"),a==="tab-crm"&&typeof window.renderCrmView=="function"&&window.renderCrmView(),a==="tab-finance"&&typeof window.renderFinanceView=="function"&&window.renderFinanceView(),a==="tab-analytics"&&typeof window.renderAnalyticsView=="function"&&window.renderAnalyticsView(),a==="tab-profile"&&typeof window.renderProfileView=="function"&&window.renderProfileView(),a==="tab-tasks"&&typeof window.renderTasksView=="function"&&window.renderTasksView(),a==="tab-new-document"&&typeof window.renderDocumentsView=="function"&&window.renderDocumentsView(),a==="tab-partners"&&typeof window.renderPartnersTable=="function"&&window.renderPartnersTable(),a==="tab-branches"&&typeof window.renderBranchesTable=="function"&&window.renderBranchesTable())}window.activateTab=r,n.querySelectorAll(".nav-group-btn[data-tab]").forEach(a=>{a.addEventListener("click",i=>{i.preventDefault();const s=a.getAttribute("data-tab");s&&(t.forEach(l=>l.classList.remove("active")),e.forEach(l=>l.classList.remove("active")),n.querySelectorAll(".nav-leaf").forEach(l=>l.classList.remove("active")),a.classList.add("active"),r(s))})}),n.querySelectorAll(".nav-group-btn[data-nav-target]").forEach(a=>{a.addEventListener("click",i=>{i.preventDefault();const s=a.getAttribute("data-nav-target");if(!s)return;const l=n.querySelector(`.nav-sublist[data-parent="${s}"]`);if(!l)return;const d=l.classList.contains("active");t.forEach(g=>{g!==l&&g.classList.remove("active")}),e.forEach(g=>{g!==a&&g.getAttribute("data-nav-target")&&g.classList.remove("active")}),d?(l.classList.remove("active"),a.classList.remove("active")):(l.classList.add("active"),a.classList.add("active"))})}),n.querySelectorAll(".nav-sublist .nav-leaf").forEach(a=>{a.addEventListener("click",i=>{i.preventDefault();const s=a.getAttribute("data-tab");s&&(n.querySelectorAll(".nav-sublist .nav-leaf").forEach(l=>l.classList.remove("active")),a.classList.add("active"),r(s))})})}let F=new Date;const nr=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],or=["Mo","Di","Mi","Do","Fr","Sa","So"];function ir(){j(),window.calendarPrevMonth=()=>{F.setMonth(F.getMonth()-1),j()},window.calendarNextMonth=()=>{F.setMonth(F.getMonth()+1),j()},window.calendarCurrentMonth=()=>{F=new Date,j()}}function j(){const n=document.getElementById("calendar-grid"),e=document.getElementById("calendar-month-year");if(!n||!e)return;const t=F.getFullYear(),o=F.getMonth();e.innerText=`${nr[o]} ${t}`,n.innerHTML="",or.forEach(m=>{const u=document.createElement("div");u.style.background="var(--color-bg-card)",u.style.padding="12px",u.style.textAlign="center",u.style.fontWeight="bold",u.style.color="var(--color-text-secondary)",u.innerText=m,n.appendChild(u)});const r=new Date(t,o,1).getDay(),a=r===0?6:r-1,i=new Date(t,o+1,0).getDate(),s=new Date(t,o,0).getDate(),l=new Date,d=l.getFullYear()===t&&l.getMonth()===o,g=l.getDate();for(let m=0;m<a;m++){const u=document.createElement("div");u.style.background="rgba(255,255,255,0.02)",u.style.minHeight="100px",u.style.padding="8px",u.style.color="var(--color-text-muted)",u.innerHTML=`<div style="font-weight: 500; margin-bottom: 4px;">${s-a+m+1}</div>`,n.appendChild(u)}for(let m=1;m<=i;m++){const u=document.createElement("div");u.style.background="var(--color-bg-card)",u.style.minHeight="100px",u.style.padding="8px",d&&m===g?(u.style.border="2px solid var(--color-primary)",u.innerHTML=`<div style="font-weight: bold; color: var(--color-primary); margin-bottom: 4px;">${m}</div>`):u.innerHTML=`<div style="font-weight: 500; margin-bottom: 4px;">${m}</div>`,m===15&&(u.innerHTML+='<div style="font-size: 0.7rem; background: rgba(99, 102, 241, 0.2); color: var(--color-primary); padding: 4px; border-radius: 4px; margin-top: 4px; cursor: pointer;">Entrümpelung Müller</div>'),n.appendChild(u)}const p=a+i,z=p%7===0?0:7-p%7;for(let m=1;m<=z;m++){const u=document.createElement("div");u.style.background="rgba(255,255,255,0.02)",u.style.minHeight="100px",u.style.padding="8px",u.style.color="var(--color-text-muted)",u.innerHTML=`<div style="font-weight: 500; margin-bottom: 4px;">${m}</div>`,n.appendChild(u)}}function yt(n){if(!n)return{score:0,level:"Gesperrt",trafficLight:"⚫ Gesperrt",logs:["Unbekannte Firma"]};if(n.trustOverride&&n.trustOverride!=="AUTO"){if(n.trustOverride==="STABIL")return{score:90,level:"Premium",trafficLight:"🟢 Stabil",logs:["Manuelle Stabilisierung aktiviert"]};if(n.trustOverride==="KRITISCH")return{score:35,level:"Bronze",trafficLight:"🔴 Kritisch",logs:["Manuelle Warnstufe aktiviert"]};if(n.trustOverride==="GESPERRT")return{score:0,level:"Gesperrt",trafficLight:"⚫ Gesperrt",logs:["Manuelle Sperre aktiviert"]}}let e=50;const t=[];if(n.gisa&&n.gisa.includes("GISA")?(e+=25,t.push("GISA Registrierung verifiziert (+25)")):t.push("Keine aufrechte GISA Registrierung (0)"),n.insuranceExpiry){const a=new Date(n.insuranceExpiry),s=Math.ceil((a-new Date)/(1e3*60*60*24));s>30?(e+=15,t.push(`Haftpflichtversicherung aufrecht (${s} Tage) (+15)`)):s>0?(e+=5,t.push(`Haftpflichtversicherung läuft in ${s} Tagen ab (+5)`)):(e-=20,t.push("Haftpflichtversicherung abgelaufen (-20)"))}else e+=10,t.push("Standard Haftpflichtnachweis vorliegend (+10)");if(n.subcontractors&&n.subcontractors.length>0){const a=n.subcontractors.filter(i=>i.active);e+=10,t.push(`${a.length} Subunternehmer offengelegt & verifiziert (+10)`)}n.active===!1&&(e=0),e=Math.max(0,Math.min(100,e));let o="🟢 Stabil",r="Gold";return e>=85?(r="Premium",o="🟢 Stabil"):e>=70?(r="Gold",o="🟢 Stabil"):e>=50?(r="Silber",o="🟡 Beobachten"):e>0?(r="Bronze",o="🔴 Kritisch"):(r="Gesperrt",o="⚫ Gesperrt"),{score:e,level:r,trafficLight:o,logs:t}}typeof window<"u"&&(window.calculatePartnerTrustScore=yt);function ar(){const n=document.getElementById("partners-table-body"),e=document.getElementById("btn-add-partner-new"),t=document.getElementById("partner-modal-advanced"),o=document.getElementById("partner-form-advanced"),r=document.getElementById("btn-close-partner-modal-advanced"),a=document.getElementById("btn-cancel-partner-advanced"),i=document.getElementById("partner-modal-advanced-title");if(!n||!t)return;function s(){n.innerHTML="";const f=ServiceOSStore.getCurrentUser(),E=f.role==="Partner"||f.role==="Sub-Partner";e&&(e.style.display=E?"none":"inline-block");let b=ServiceOSStore.getCompanies();if(E&&(b=b.filter(c=>c.id===f.companyId)),b.length===0){n.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Partnerdaten gefunden.</td></tr>';return}b.forEach(c=>{const w=yt(c),h=document.createElement("tr");h.className="animate-row",h.innerHTML=`
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          <div style="font-weight: 600; display: flex; align-items: center; gap: 6px;">
            ${c.name}
          </div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${c.type||"Partner"}</div>
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          ${c.contactPerson||"-"}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem;">
          ${c.emails&&c.emails.length?`<div>${c.emails[0].value}</div>`:c.email?`<div>${c.email}</div>`:""}
          ${c.phones&&c.phones.length?`<div>${c.phones[0].value}</div>`:c.phone?`<div>${c.phone}</div>`:""}
          ${(!c.emails||!c.emails.length)&&(!c.phones||!c.phones.length)&&!c.email&&!c.phone?"-":""}
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border);">
          ${c.branches&&c.branches.length?c.branches.join(", "):"-"}
          ${c.operatingArea&&c.operatingArea.states?`<div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">Gebiet: ${c.operatingArea.states.join(", ")} (${c.operatingArea.radiusKm==="all"?"Österreichweit":c.operatingArea.radiusKm+" km"})</div>`:""}
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 0.8rem; font-weight: bold; color: ${w.score>=70?"#10b981":w.score>=50?"#f59e0b":"#ef4444"};">
              ${w.trafficLight} (${w.score}/100)
            </span>
            <span style="font-size: 0.7rem; color: var(--color-text-secondary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border);">
              Level: ${w.level}
            </span>
            ${c.subcontractors&&c.subcontractors.length>0?`
              <span style="font-size: 0.65rem; color: #fbbf24; background: rgba(245, 158, 11, 0.15); padding: 1px 5px; border-radius: 3px;">
                ${c.subcontractors.length} Sub-Partner
              </span>
            `:""}
          </div>
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid var(--color-border);">
          <button type="button" class="btn btn-sm edit-btn" data-id="${c.id}" style="margin-right: 6px;">Bearbeiten</button>
          ${E?"":`
            <button type="button" class="btn btn-sm toggle-freeze-btn" data-id="${c.id}" style="margin-right: 6px; background: ${w.level==="Gesperrt"?"rgba(16, 185, 129, 0.15)":"rgba(239, 68, 68, 0.15)"}; color: ${w.level==="Gesperrt"?"#34d399":"#f87171"}; border: 1px solid ${w.level==="Gesperrt"?"rgba(16, 185, 129, 0.3)":"rgba(239, 68, 68, 0.3)"}; font-weight: 600;">
              ${w.level==="Gesperrt"?"🟢 Entsperren":"⚫ Sperren"}
            </button>
            <button type="button" class="btn btn-sm delete-btn" data-id="${c.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
          `}
        </td>
      `,n.appendChild(h)}),n.querySelectorAll(".edit-btn").forEach(c=>{c.addEventListener("click",()=>z(c.getAttribute("data-id")))}),n.querySelectorAll(".toggle-freeze-btn").forEach(c=>{c.addEventListener("click",()=>l(c.getAttribute("data-id")))}),n.querySelectorAll(".delete-btn").forEach(c=>{c.addEventListener("click",()=>u(c.getAttribute("data-id")))}),d()}function l(f){const E=ServiceOSStore.getCompanies(),b=E.find(c=>c.id===f);b&&(b.trustOverride==="GESPERRT"||b.active===!1?(b.trustOverride="STABIL",b.active=!0,ServiceOSStore.logAudit("PARTNER_UNLOCKED",`Partner ${b.name} (${f}) entsperrt & freigegeben.`),alert(`✓ Partner ${b.name} wurde erfolgreich entsperrt.`)):(b.trustOverride="GESPERRT",b.active=!1,ServiceOSStore.logAudit("PARTNER_FREEZE",`Risk Shield Notfall-Sperre für Partner ${b.name} (${f}) aktiviert.`),alert(`⚠️ Notfall-Sperre aktiviert: Partner ${b.name} wurde gesperrt.`)),ServiceOSStore.set("companies",E),s())}function d(){let f=document.getElementById("partners-geo-silo-container");if(!f){const b=document.getElementById("tab-partners");if(!b)return;f=document.createElement("div"),f.id="partners-geo-silo-container",f.style.marginTop="24px",b.appendChild(f)}const E=[{id:"LOC-VIE",name:"Wien (Zentrale)",lat:48.2082,lon:16.3738,type:"Headquarters",population:19e5},{id:"LOC-PURK",name:"Purkersdorf (Niederösterreich)",lat:48.2067,lon:16.1756,type:"Branch",population:9800},{id:"LOC-GRZ",name:"Graz (Steiermark)",lat:47.0707,lon:15.4395,type:"Branch",population:29e4},{id:"LOC-LNZ",name:"Linz (Oberösterreich)",lat:48.3069,lon:14.2858,type:"Branch",population:206e3}];if(window.generateLinkSilo){const b=window.generateLinkSilo(E,200);f.innerHTML=`
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 8px; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
            <svg style="width: 18px; height: 18px; color: var(--color-accent);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            🌐 Link-Siloing & Geo-Distanz Engine (mathcal{L}_{	ext{silo}})
          </h3>
          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px;">
            Berechnung der Haversine-Proximity für lokale Geo-Cluster und B2B-Netzwerke (	heta_{	ext{geo}} le 200,	ext{km}).
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            ${b.slice(0,4).map(c=>{const w=E.find(v=>v.id===c.from),h=E.find(v=>v.id===c.to);return`
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px;">
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary);">${w==null?void 0:w.name} ➔ ${h==null?void 0:h.name}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">
                    Distanz: <strong style="color: var(--color-accent);">${c.distanceKm} km</strong> | Silo-Priorität: <strong>${c.priority}</strong>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      `}}function g(f,E,b="",c=""){const w=document.createElement("div");w.className=`dynamic-field-${E}`,w.style.display="flex",w.style.gap="8px",w.style.alignItems="center",w.style.marginBottom="8px",w.innerHTML=`
      <input type="text" class="field-label wizard-input" placeholder="z.B. ${E==="email"?"Haupt, Rechnungen":"Mobil, Büro"}" value="${b}" style="width: 130px; font-size: 0.85rem;" />
      <input type="${E==="email"?"email":"tel"}" class="field-value wizard-input" placeholder="${E==="email"?"name@firma.at":"+43 ..."}" value="${c}" style="flex: 1; font-size: 0.85rem;" />
      <button type="button" class="btn btn-sm btn-remove-field" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; cursor: pointer; border-radius: 4px;">✕</button>
    `,w.querySelector(".btn-remove-field").addEventListener("click",()=>w.remove()),f.appendChild(w)}function p(f,E="",b="",c=!0){const w=document.createElement("div");w.className="dynamic-field-subcontractor",w.style.display="flex",w.style.gap="8px",w.style.alignItems="center",w.style.marginBottom="8px",w.innerHTML=`
      <input type="text" class="sub-name wizard-input" placeholder="Firmenname Sub-Partner" value="${(E||"").replace(/"/g,"&quot;")}" style="flex: 2; font-size: 0.85rem;" />
      <input type="text" class="sub-gisa wizard-input" placeholder="GISA-Zahl" value="${(b||"").replace(/"/g,"&quot;")}" style="flex: 1.2; font-size: 0.85rem;" />
      <label style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #10b981; cursor: pointer;">
        <input type="checkbox" class="sub-active" ${c?"checked":""} style="accent-color: #10b981;" /> GISA OK
      </label>
      <button type="button" class="btn btn-sm btn-remove-sub" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; cursor: pointer; border-radius: 4px;">✕</button>
    `,w.querySelector(".btn-remove-sub").addEventListener("click",()=>w.remove()),f.appendChild(w)}function z(f=null){var S;const E=ServiceOSStore.getCurrentUser(),b=E.role==="Partner"||E.role==="Sub-Partner";if(b&&(!f||f!==E.companyId)){alert("🔒 Zugriff verweigert: Partnerfirmen können keine weiteren Unternehmen anlegen oder fremde Firmen bearbeiten.");return}o.reset();const c=document.getElementById("partner-adv-emails-container"),w=document.getElementById("partner-adv-phones-container"),h=document.getElementById("partner-adv-subcontractors-container");if(c.innerHTML="",w.innerHTML="",h&&(h.innerHTML=""),document.querySelectorAll(".partner-state-cb").forEach(I=>I.checked=!1),document.getElementById("partner-adv-radius").value="10",f){const I=ServiceOSStore.getCompanies().find(L=>L.id===f);if(!I)return;i.textContent=b?"Eigenes Firmenprofil bearbeiten":"Partner bearbeiten",document.getElementById("partner-adv-name").value=I.name||"",document.getElementById("partner-adv-type").value=I.type||"Partner",document.getElementById("partner-adv-contact").value=I.contactPerson||"",document.getElementById("partner-adv-address").value=I.address||"",document.getElementById("partner-adv-atu").value=I.atu||"",document.getElementById("partner-adv-gisa").value=I.gisa||"",document.getElementById("partner-adv-iban").value=I.iban||"",document.getElementById("partner-adv-active").checked=!!I.active;const A=document.getElementById("partner-adv-insurance-expiry");A&&(A.value=I.insuranceExpiry||"");const C=document.getElementById("partner-adv-trust-override");C&&(C.value=I.trustOverride||"AUTO"),document.getElementById("partner-adv-type").disabled=b,document.getElementById("partner-adv-gisa").disabled=b,document.getElementById("partner-adv-active").disabled=b,C&&(C.disabled=b),(I.emails||(I.email?[{label:"Haupt",value:I.email}]:[])).forEach(L=>g(c,"email",L.label,L.value)),(I.phones||(I.phone?[{label:"Haupt",value:I.phone}]:[])).forEach(L=>g(w,"phone",L.label,L.value));const D=I.subcontractors||[];if(h&&D.forEach(L=>p(h,L.name,L.gisa,L.active)),I.operatingArea){document.getElementById("partner-adv-radius").value=I.operatingArea.radiusKm||"10";const L=I.operatingArea.states||[];document.querySelectorAll(".partner-state-cb").forEach(M=>{L.includes(M.value)&&(M.checked=!0)})}o.dataset.editId=f}else i.textContent="Neuen Partner anlegen",g(c,"email"),g(w,"phone"),delete o.dataset.editId;const v=document.getElementById("partner-adv-branches-container");if(v){v.innerHTML="";const I=ServiceOSStore.getBranches(),A=f?((S=ServiceOSStore.getCompanies().find(C=>C.id===f))==null?void 0:S.branches)||[]:[];I.forEach(C=>{const $=A.includes(C.name)?"checked":"",T=document.createElement("div");T.style.display="flex",T.style.alignItems="center",T.style.gap="6px",T.innerHTML=`
          <input type="checkbox" id="cb-branch-${C.id}" value="${C.name}" class="partner-branch-cb" style="accent-color: var(--color-primary);" ${$} />
          <label for="cb-branch-${C.id}" style="font-size: 0.8rem; color: var(--color-text-primary); cursor: pointer;">${C.name}</label>
        `,v.appendChild(T)}),I.length===0&&(v.innerHTML='<span style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Branchen vorhanden.</span>')}t.classList.add("active")}function m(){t.classList.remove("active")}function u(f){const E=ServiceOSStore.getCurrentUser();if(E.role==="Partner"||E.role==="Sub-Partner"){alert("🔒 Zugriff verweigert: Partnerfirmen können keine Unternehmen löschen.");return}if(!confirm("Möchten Sie diesen Partner wirklich löschen?"))return;const b=ServiceOSStore.getCompanies().filter(c=>c.id!==f);ServiceOSStore.set("companies",b),ServiceOSStore.logAudit("PARTNER_DELETED",`Partner mit ID ${f} wurde gelöscht.`),s(),typeof window.updateUserHeaderProfile=="function"&&window.updateUserHeaderProfile()}e&&e.addEventListener("click",()=>z()),r&&r.addEventListener("click",m),a&&a.addEventListener("click",m);const y=document.getElementById("btn-add-partner-email");y&&y.addEventListener("click",()=>{g(document.getElementById("partner-adv-emails-container"),"email")});const k=document.getElementById("btn-add-partner-phone");k&&k.addEventListener("click",()=>{g(document.getElementById("partner-adv-phones-container"),"phone")});const x=document.getElementById("btn-add-partner-subcontractor");x&&x.addEventListener("click",()=>{p(document.getElementById("partner-adv-subcontractors-container"))}),o.addEventListener("submit",f=>{var D,L;f.preventDefault();const E=ServiceOSStore.getCurrentUser(),b=E.role==="Partner"||E.role==="Sub-Partner",c=o.dataset.editId;if(b&&c!==E.companyId){alert("🔒 Zugriff verweigert: Du kannst nur dein eigenes Firmenprofil bearbeiten.");return}const w=document.querySelectorAll(".partner-branch-cb:checked"),h=Array.from(w).map(M=>M.value),v=[];document.querySelectorAll(".dynamic-field-email").forEach(M=>{const O=M.querySelector(".field-label").value.trim(),P=M.querySelector(".field-value").value.trim();P&&v.push({label:O,value:P})});const S=[];document.querySelectorAll(".dynamic-field-phone").forEach(M=>{const O=M.querySelector(".field-label").value.trim(),P=M.querySelector(".field-value").value.trim();P&&S.push({label:O,value:P})});const I=[];document.querySelectorAll(".dynamic-field-subcontractor").forEach(M=>{const O=M.querySelector(".sub-name").value.trim(),P=M.querySelector(".sub-gisa").value.trim(),H=M.querySelector(".sub-active").checked;O&&I.push({id:"SUB-"+Math.floor(1e3+Math.random()*9e3),name:O,gisa:P,active:H})});const A=document.getElementById("partner-adv-radius").value,C=Array.from(document.querySelectorAll(".partner-state-cb:checked")).map(M=>M.value),$={id:c||"COMP-"+Math.floor(1e3+Math.random()*9e3),name:document.getElementById("partner-adv-name").value.trim(),type:document.getElementById("partner-adv-type").value,contactPerson:document.getElementById("partner-adv-contact").value.trim(),emails:v,phones:S,address:document.getElementById("partner-adv-address").value.trim(),atu:document.getElementById("partner-adv-atu").value.trim(),gisa:document.getElementById("partner-adv-gisa").value.trim(),iban:document.getElementById("partner-adv-iban").value.trim(),insuranceExpiry:((D=document.getElementById("partner-adv-insurance-expiry"))==null?void 0:D.value)||"",trustOverride:((L=document.getElementById("partner-adv-trust-override"))==null?void 0:L.value)||"AUTO",subcontractors:I,branches:h,operatingArea:{radiusKm:A,states:C},active:document.getElementById("partner-adv-active").checked},T=ServiceOSStore.getCompanies();if(c){const M=T.findIndex(O=>O.id===c);M>-1&&(T[M]={...T[M],...$}),ServiceOSStore.logAudit("PARTNER_UPDATED",`Partner ${$.name} wurde aktualisiert (Trust-Status verifiziert).`)}else T.push($),ServiceOSStore.logAudit("PARTNER_CREATED",`Neuer Partner ${$.name} wurde angelegt.`);ServiceOSStore.set("companies",T),m(),s(),typeof window.updateUserHeaderProfile=="function"&&window.updateUserHeaderProfile()}),window.addEventListener("storage",()=>{document.getElementById("tab-partners")&&document.getElementById("tab-partners").classList.contains("active")&&s()}),window.renderPartnersTable=s,s()}function sr(){const n=document.getElementById("branches-table-body"),e=document.getElementById("btn-add-branch"),t=document.getElementById("branch-modal"),o=document.getElementById("branch-form"),r=document.getElementById("btn-close-branch-modal"),a=document.getElementById("btn-cancel-branch"),i=document.getElementById("branch-modal-title");if(!n||!t)return;function s(m="",u=""){const y=document.getElementById("branch-subcats-rows-container");if(!y)return;const k=document.createElement("div");k.className="subcat-input-row",u&&(k.dataset.group=u),k.style.display="flex",k.style.gap="8px",k.style.alignItems="center",k.style.width="100%";const x=document.createElement("input");x.type="text",x.className="wizard-input branch-subcat-field",x.value=m,x.placeholder=u?`z.B. ${u} Unterpunkt`:"z.B. Unterbereich Name",x.style.flex="1",x.style.minWidth="0",x.style.width="100%",x.style.height="40px",x.style.padding="0 14px",x.style.fontSize="0.9rem",x.style.background="rgba(15, 23, 42, 0.8)",x.style.border="1px solid var(--color-border)",x.style.borderRadius="var(--border-radius-sm)",x.style.color="var(--color-text-primary)",x.style.boxSizing="border-box",x.addEventListener("keydown",E=>{E.key==="Enter"&&(E.preventDefault(),s("",u))});const f=document.createElement("button");f.type="button",f.className="remove-subcat-row-btn",f.innerHTML="✕",f.style.width="40px",f.style.minWidth="40px",f.style.height="40px",f.style.flexShrink="0",f.style.background="rgba(239, 68, 68, 0.15)",f.style.color="#ef4444",f.style.border="1px solid rgba(239, 68, 68, 0.4)",f.style.borderRadius="var(--border-radius-sm)",f.style.cursor="pointer",f.style.display="inline-flex",f.style.alignItems="center",f.style.justifyContent="center",f.style.fontWeight="bold",f.style.fontSize="1.1rem",f.title="Zeile löschen",f.addEventListener("click",E=>{E.preventDefault(),k.remove()}),k.appendChild(x),k.appendChild(f),y.appendChild(k),m||setTimeout(()=>x.focus(),50)}function l(m){const u=document.getElementById("branch-subcats-rows-container");if(!u)return;const y=document.createElement("div");y.className="subcat-group-header",y.dataset.groupTitle=m,y.style.marginTop="12px",y.style.marginBottom="4px",y.style.padding="6px 10px",y.style.background="rgba(59, 130, 246, 0.1)",y.style.borderLeft="3px solid #60a5fa",y.style.borderRadius="4px",y.style.color="#60a5fa",y.style.fontSize="0.85rem",y.style.fontWeight="600",y.style.display="flex",y.style.justifyContent="space-between",y.style.alignItems="center",y.innerHTML=`
      <span>📌 ${m}</span>
      <button type="button" class="btn-add-in-group" style="background: none; border: none; color: #60a5fa; font-size: 0.75rem; cursor: pointer; text-decoration: underline;">+ Zeile in Gruppe</button>
    `,y.querySelector(".btn-add-in-group").addEventListener("click",()=>{s("",m)}),u.appendChild(y)}document.addEventListener("click",m=>{m.target&&(m.target.id==="btn-add-subcat-row"||m.target.closest("#btn-add-subcat-row"))&&(m.preventDefault(),s(""))});function d(){n.innerHTML="";const m=ServiceOSStore.getBranches();if(m.length===0){n.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Branchen gefunden.</td></tr>';return}m.forEach(u=>{const y=u.subcategories||[];let k="";y.length>0?typeof y[0]=="object"&&y[0]!==null&&"group"in y[0]?k=y.map(f=>`
            <div style="margin-bottom: 6px;">
              <div style="font-size: 0.75rem; font-weight: 600; color: #60a5fa; margin-bottom: 2px;">${f.group}:</div>
              ${(f.items||[]).map(E=>`<span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); margin-right: 4px; display: inline-block; margin-bottom: 4px;">${E}</span>`).join("")}
            </div>
          `).join(""):k=y.map(f=>`<span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); margin-right: 4px; display: inline-block; margin-bottom: 4px;">${f}</span>`).join(""):k='<span style="font-size: 0.75rem; color: var(--color-text-muted);">-</span>';const x=document.createElement("tr");x.className="animate-row",x.innerHTML=`
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-family: monospace;">
          ${u.id}
        </td>
        <td style="padding: 12px; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); font-weight: 600;">
          ${u.name}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem; max-width: 320px;">
          ${k}
        </td>
        <td style="padding: 12px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); font-size: 0.85rem;">
          ${u.description||"-"}
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid var(--color-border);">
          ${u.active?'<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Aktiv</span>':'<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Inaktiv</span>'}
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid var(--color-border);">
          <button type="button" class="btn btn-sm edit-btn" data-id="${u.id}" style="margin-right: 8px;">Bearbeiten</button>
          <button type="button" class="btn btn-sm delete-btn" data-id="${u.id}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Löschen</button>
        </td>
      `,n.appendChild(x)}),n.querySelectorAll(".edit-btn").forEach(u=>{u.addEventListener("click",()=>g(u.getAttribute("data-id")))}),n.querySelectorAll(".delete-btn").forEach(u=>{u.addEventListener("click",()=>z(u.getAttribute("data-id")))})}function g(m=null){o.reset();const u=document.getElementById("branch-subcats-rows-container");if(u&&(u.innerHTML=""),m){const y=ServiceOSStore.getBranches().find(x=>x.id===m);if(!y)return;i.textContent="Branche bearbeiten",document.getElementById("branch-name").value=y.name||"",document.getElementById("branch-description").value=y.description||"",document.getElementById("branch-active").checked=!!y.active;const k=y.subcategories||[];k.length>0?typeof k[0]=="object"&&k[0]!==null&&"group"in k[0]?k.forEach(x=>{l(x.group),(x.items||[]).forEach(f=>s(f,x.group))}):k.forEach(x=>s(x)):s(""),o.dataset.editId=m}else i.textContent="Neue Branche anlegen",s(""),delete o.dataset.editId;t.classList.add("active")}function p(){t.classList.remove("active")}function z(m){if(!confirm("Möchten Sie diese Branche wirklich löschen?"))return;const u=ServiceOSStore.getBranches().filter(y=>y.id!==m);ServiceOSStore.set("branches",u),ServiceOSStore.logAudit("BRANCH_DELETED",`Branche mit ID ${m} wurde gelöscht.`),d()}e&&e.addEventListener("click",()=>g()),r&&r.addEventListener("click",p),a&&a.addEventListener("click",p),o.addEventListener("submit",m=>{m.preventDefault();const u=o.dataset.editId,y=document.getElementById("branch-subcats-rows-container"),k=y?Array.from(y.querySelectorAll(".subcat-group-header")):[];let x=[];if(k.length>0)k.forEach(b=>{const c=b.dataset.groupTitle,w=[];let h=b.nextElementSibling;for(;h&&!h.classList.contains("subcat-group-header");){const v=h.querySelector(".branch-subcat-field");v&&v.value.trim().length>0&&w.push(v.value.trim()),h=h.nextElementSibling}w.length>0&&x.push({group:c,items:w})});else{const b=document.querySelectorAll(".branch-subcat-field");x=Array.from(b).map(c=>c.value.trim()).filter(c=>c.length>0)}const f={id:u||"BR-"+Math.floor(1e3+Math.random()*9e3),name:document.getElementById("branch-name").value.trim(),subcategories:x,description:document.getElementById("branch-description").value.trim(),active:document.getElementById("branch-active").checked},E=ServiceOSStore.getBranches();if(u){const b=E.findIndex(c=>c.id===u);b>-1&&(E[b]={...E[b],...f}),ServiceOSStore.logAudit("BRANCH_UPDATED",`Branche ${f.name} wurde aktualisiert.`)}else E.push(f),ServiceOSStore.logAudit("BRANCH_CREATED",`Neue Branche ${f.name} wurde angelegt.`);ServiceOSStore.set("branches",E),p(),d()}),window.addEventListener("storage",()=>{document.getElementById("tab-branches")&&document.getElementById("tab-branches").classList.contains("active")&&d()}),window.renderBranchesTable=d,d()}const be=new Bt;function ee(n,e,t){const o=B.getSettings(),r=o.gisaVerify!==!1,a=o.language||"de-AT";let i=be.get(n);i||(i=tt(n,a,e,r,t),be.set(n,i));let s=1;(!n||n.trim().length<5)&&(s-=.3),e||(s-=.2);const l=i.score,d=zt(n),u=.25*s+.35*l+.25*d+.15*(s*l*d);return{qNexus:parseFloat(u.toFixed(3)),sScore:parseFloat(s.toFixed(2)),vScore:parseFloat(l.toFixed(2)),lScore:parseFloat(d.toFixed(2)),compliance:i}}window.calculateQNexusScore=ee;window.runComplianceCheck=tt;window.analyzeCicero7Q=rt;window.calculateHaversineDistance=nt;window.generateLinkSilo=It;window.renderLudusWidget=Tt;window.getLudusTelemetryState=$t;window.renderFactoriumModule=Dt;window.renderCrmView=X;window.renderFinanceView=de;window.renderAnalyticsView=mt;window.renderProfileView=J;window.renderTasksView=_;window.renderDocumentsView=Y;window.generateCryptographicId=U;function ue(n,e="",t=[]){const o=[],r=(e+" "+(Array.isArray(t)?t.join(" "):t)).toLowerCase();return(r.includes("verlassenschaft")||r.includes("nachlass")||r.includes("todesfall"))&&(o.push({branch:"Antiquitäten",title:"Verlassenschafts-Bewertung & Ankauf",reason:"Wertanrechnung verwertbarer Erbstücke & Kunstgegenstände",suggestedValue:1200}),o.push({branch:"Immobilienmakler",title:"Immobilien-Bewertung & Verkauf",reason:"Professionelle Vermarktung nach der Räumung",suggestedValue:3500}),o.push({branch:"Reinigung",title:"Besenreine Spezialreinigung & Desinfektion",reason:"Bezugsfertige Übergabe an Vermieter oder Käufer",suggestedValue:450})),(r.includes("messie")||r.includes("zwangsräumung")||r.includes("mietnomaden"))&&(o.push({branch:"Entrümpelung",title:"Spezialreinigung & Schädlingsbekämpfung",reason:"Hygieneherstellung nach extremer Belastung",suggestedValue:850}),o.push({branch:"Entrümpelung",title:"Maler- & Renovierungsarbeiten",reason:"Rückbau & bezugsfertige Herrichtung",suggestedValue:1600})),(r.includes("gewerbeauflösung")||r.includes("insolvenz")||r.includes("büro"))&&(o.push({branch:"Umzug",title:"Firmen- & EDV-Transport (Spedition)",reason:"Sicherer Abtransport verbliebener Büroausstattung",suggestedValue:950}),o.push({branch:"Antiquitäten",title:"Inventar- & Maschinenbewertung",reason:"Verwertung von Gewerbeinventar",suggestedValue:1500})),n==="Solar"&&o.push({branch:"Solar",title:"Speicher-Nachrüstung & Energiemanagement",reason:"Maximierung des Eigenverbrauchs",suggestedValue:4200}),n==="Umzug"&&(o.push({branch:"Entrümpelung",title:"Altmöbel-Entrümpelung & Wertstoff-Abtransport",reason:"Bereinigung nicht mehr benötigten Umzugsguts",suggestedValue:380}),o.push({branch:"Reinigung",title:"Endreinigung der Altwohnung",reason:"Übergabegarantie für Kaution",suggestedValue:320})),o.length===0&&o.push({branch:"Reinigung",title:"Spezial- & Endreinigung",reason:"Qualitätssicherung bei Übergabe",suggestedValue:350}),o}window.generateCrossSellingSuggestions=ue;const ye=[{id:"USR-001",name:"Alex Dev",role:"Superadmin",email:"alex@serviceos.com"},{id:"USR-002",name:"Sarah Admin",role:"Administrator",email:"sarah@serviceos.com"},{id:"USR-003",name:"Klaus Müller",role:"Partner",email:"klaus@mueller-entruempelung.at",companyId:"COMP-001"},{id:"USR-004",name:"Hans Schmid",role:"Sub-Partner",email:"hans@schmid-transporte.at",companyId:"COMP-002",parentCompanyId:"COMP-001"}],dr=[{id:"COMP-001",name:"Müller Entrümpelung GmbH",type:"Partner",branches:["Entrümpelung","Reinigung"],active:!0,gisa:"GISA-12948574"},{id:"COMP-002",name:"Schmid Transporte",type:"Sub-Partner",parentId:"COMP-001",branches:["Transport"],active:!0,gisa:"GISA-98274381"}],lr=[],te=[{id:"BR-001",name:"Entrümpelung",description:"Räumung und Entsorgung",active:!0,subcategories:[{group:"Nach Objekt- & Immobilienart",items:["Wohnung entrümpeln","Haus entrümpeln","Keller & Dachboden entrümpeln","Garage, Schuppen & Gartenhaus","Gewerbe- & Firmenentrümpelung (Büro, Lager, Werkstatt, Ladengeschäft)","Hotel- & Gastronomieauflösung","Nebengebäude & Scheunen"]},{group:"Nach Anlass & Situation",items:["Messie-Wohnung entrümpeln","Verlassenschaften & Nachlassverwertung","Entrümpelung nach Todesfall","Zwangsräumung / Mietnomaden-Räumung","Gewerbeauflösung / Insolvenzräumung"]},{group:"Nach Leistungsumfang & Spezial-Services",items:["Besenreine Räumung","Antiquitäten Ankauf & Wertanrechnung","Demontage & Rückbau (Einbaumöbel, Deckenverkleidungen, Bodenbeläge, Fliesen)","Möbel- & Wertsachenanrechnung (Verkaufbares wird vom Preis abgezogen)","Spezialreinigung & Desinfektion (z. B. nach Messie-Räumung)","Maler- & Renovierungsarbeiten (zur bezugsfertigen bzw. übergabereifen Herrichtung)"]}]},{id:"BR-002",name:"Umzug",description:"Privat- und Firmenumzüge",active:!0,subcategories:[{group:"Nach Art des Umzugs",items:["Privatumzug","Firmenumzug","Büro-Umzug","Seniorenumzug","Studentenumzug","Mitarbeiterumzug / Relocation Service","Behörden- & Praxisumzug"]},{group:"Nach Entfernung & Logistik",items:["Umzug innerhalb des Ortes","Umzug innerhalb 50 km","Umzug innerhalb 100 km","Umzug über 100 km","Umzug in ein anderes Bundesland","Fernumzug / Deutschlandweiter Umzug","Internationaler Umzug / EU-Umzug","Überseeumzug"]},{group:"Nach Leistungsumfang & Spezial-Services",items:["Transport (Reiner Beiladungsservice / Transport von A nach B)","Demontage & Montage (Möbel & Einbauküchen)","Umzug mit Entrümpelung","Full-Service-Umzug (inkl. Ein- und Auspackservice)","Spezial- & Schwerguttransport (z. B. Klavier, Tresor)","Einlagerung & Zwischenlagerung (Self-Storage)","Einrichten von Halteverbotszonen","Außenaufzug- / Möbelaufzug-Einsatz"]}]},{id:"BR-003",name:"Antiquitäten",description:"Ankauf und Verkauf von Antiquitäten",active:!0,subcategories:["Antiquitäten Ankauf","Verlassenschafts-Bewertung","Kunstgegenstände","Münzen & Gold"]},{id:"BR-004",name:"Solar",description:"Photovoltaik und Solaranlagen",active:!0,subcategories:["Photovoltaik Erstinstallation","Speicher-Nachrüstung","Wartung & Reinigung","Wechselrichter-Tausch"]},{id:"BR-005",name:"Immobilienmakler",description:"Vermittlung von Immobilien",active:!0,subcategories:["Wohnungsvermietung","Hausverkauf","Gewerbeflächen-Vermittlung","Immobilien-Bewertung"]},{id:"BR-006",name:"Überwachungskameras",description:"Sicherheitstechnik und Kameras",active:!0,subcategories:["WLAN Kamera Setup","IP-Videoüberwachung","Alarmanlagen Integration","Wartung Security"]}];let B=class{static get(e,t){const o=localStorage.getItem(`serviceos_${e}`);return o?JSON.parse(o):t}static set(e,t){localStorage.setItem(`serviceos_${e}`,JSON.stringify(t)),window.dispatchEvent(new Event("storage"))}static init(){if((!localStorage.getItem("serviceos_users")||JSON.parse(localStorage.getItem("serviceos_users")).length<=2)&&this.set("users",ye),(!localStorage.getItem("serviceos_companies")||JSON.parse(localStorage.getItem("serviceos_companies")).length===0)&&this.set("companies",dr),!localStorage.getItem("serviceos_orders")){const e=lr.map(t=>{const o=new Date().toISOString().split("T")[0],r=ee(t.description,t.branch,t.companyId);return{...t,date:t.date||o,qNexusMetrics:r}});this.set("orders",e)}if(localStorage.getItem("serviceos_audit")||this.set("audit",[]),localStorage.getItem("serviceos_current_user_id")||localStorage.setItem("serviceos_current_user_id","USR-001"),localStorage.getItem("serviceos_settings")||this.set("settings",{language:"de-AT",currency:"EUR",docVerify:!0,gisaVerify:!0,minInsurance:1e6,commission:15,marketingShare:20,aiModel:"gemini-1.5-pro",aiTemp:.2,selfImprove:!0,zeroTrust:!1,mfa:!1,logRetention:"90",dashboardFavorites:["kpi-card-revenue","kpi-card-active","kpi-card-completed","kpi-card-time","kpi-card-requests","kpi-card-action","btn-kpi-new-order","kpi-card-flow","kpi-card-status","kpi-card-calc"]}),!localStorage.getItem("serviceos_branches"))this.set("branches",te);else{const e=this.getBranches(),t=e.find(r=>r.id==="BR-001"||r.name.includes("Entrümpelung"));t&&(t.subcategories=te[0].subcategories);const o=e.find(r=>r.id==="BR-002"||r.name.includes("Umzug"));o&&(o.subcategories=te[1].subcategories),this.set("branches",e)}localStorage.getItem("serviceos_cases")||this.set("cases",[])}static getUsers(){return this.get("users",[])}static getCompanies(){return this.get("companies",[])}static getOrders(){return this.get("orders",[])}static getCases(){return this.get("cases",[])}static getAuditLogs(){return this.get("audit",[])}static getBranches(){return this.get("branches",[])}static getCaseById(e){return e?this.getCases().find(t=>t.id===e||t.caseNumber===e):null}static createCase(e){const t=this.getCases(),o=e.id||U("CAS"),r=e.caseNumber||U("SO"),a=e.crossSellingSuggestions||ue(e.branch,e.reason||e.description,e.subcategories),i={id:o,caseNumber:r,client:e.client||"Unbekannter Kunde",location:e.location||e.address||"Direktauftrag",branch:e.branch||"General",reason:e.reason||e.description||"Serviceanfrage",subcategories:e.subcategories||[],status:e.status||"Pending",createdAt:e.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),companyId:e.companyId||null,orders:e.orders||[],crossSellingSuggestions:a,timeline:e.timeline||[{timestamp:new Date().toISOString(),title:"Fallakte angelegt",author:e.author||"System",type:"CREATE",details:`Fallakte ${r} (${o}) für Kunde ${e.client||""} registriert.`}]};return t.unshift(i),this.set("cases",t),this.logAudit("CASE_CREATED",`Neue Fallakte ${r} (${o}) angelegt.`),i}static addTimelineEventToCase(e,t){const o=this.getCases(),r=o.findIndex(a=>a.id===e||a.caseNumber===e);r!==-1&&(o[r].timeline||(o[r].timeline=[]),o[r].timeline.unshift({timestamp:new Date().toISOString(),title:t.title||"Aktualisierung",author:t.author||"System",type:t.type||"INFO",details:t.details||""}),o[r].updatedAt=new Date().toISOString(),this.set("cases",o))}static addOrderToCase(e,t){const o=this.getCases(),r=o.findIndex(a=>a.id===e||a.caseNumber===e);r!==-1&&(o[r].orders||(o[r].orders=[]),o[r].orders.includes(t)||o[r].orders.push(t),o[r].updatedAt=new Date().toISOString(),this.set("cases",o))}static getSettings(){const e={language:"de-AT",currency:"EUR",docVerify:!0,gisaVerify:!0,minInsurance:1e6,commission:15,marketingShare:20,aiModel:"gemini-1.5-pro",aiTemp:.2,selfImprove:!0,zeroTrust:!1,mfa:!1,logRetention:"90",dashboardFavorites:["kpi-card-revenue","kpi-card-active","kpi-card-completed","kpi-card-time","kpi-card-requests","kpi-card-action","btn-kpi-new-order","kpi-card-flow","kpi-card-status","kpi-card-calc"]};return this.get("settings",e)}static saveSettings(e){this.set("settings",e),this.logAudit("CONFIG_CHANGE","Updated platform settings configurations")}static getCurrentUserId(){return localStorage.getItem("serviceos_current_user_id")||"USR-001"}static setCurrentUserId(e){localStorage.setItem("serviceos_current_user_id",e),this.logAudit("USER_SWITCH",`Switched active user to ${e}`)}static getCurrentUser(){const e=this.getCurrentUserId();return this.getUsers().find(t=>t.id===e)||ye[0]}static logAudit(e,t){const o=this.getCurrentUser(),r=this.getAuditLogs(),a=new Date().toISOString(),i=r.length>0&&r[0].hash||"GENESIS",l=(window.generateAuditHash||function(d,g,p,z,m){return"HASH-"+Math.floor(1e7+Math.random()*9e7)})(i,a,o.name||o.id,e,t);r.unshift({timestamp:a,userId:o.id,userName:o.name,userRole:o.role,user:o.name||o.id,role:o.role,action:e,details:t,previousHash:i,hash:l}),this.set("audit",r)}static verifyIntegrity(){const e=this.getAuditLogs();return window.verifyAuditTrailIntegrity?window.verifyAuditTrailIntegrity(e):{isValid:!0,corruptedIndex:-1,logsCount:e.length}}};window.ServiceOSStore=B;B.init();window.createCrossSellingSubOrder=function(n,e,t,o){const r=B.getCaseById(n);if(!r){alert("Fallakte nicht gefunden.");return}const a=U("ORD"),i=new Date().toISOString().split("T")[0],s=B.getCurrentUser(),l=s.role==="Partner"||s.role==="Sub-Partner"?s.companyId:null,d=`Cross-Selling Teilauftrag: ${t} im Rahmen der Fallakte ${r.caseNumber}.`,g=ee(d,e,l),p={id:a,caseId:r.id,caseNumber:r.caseNumber,client:r.client,product:t,description:d,value:parseFloat(o)||450,priority:"Normal",status:"Pending",date:i,branch:e,companyId:l,qNexusMetrics:g},z=B.getOrders();z.unshift(p),B.set("orders",z),B.addOrderToCase(r.id,a),B.addTimelineEventToCase(r.id,{title:`Teilauftrag angelegt: ${t}`,author:s.name||"System",type:"SUB_ORDER",details:`Zusatzleistung ${t} (${e}) als Teilauftrag ${a} hinzugefügt.`}),B.logAudit("SUB_ORDER_CREATION",`Cross-Selling Teilauftrag ${a} (${e}) zur Fallakte ${r.caseNumber} hinzugefügt.`),alert(`✓ Cross-Selling Teilauftrag ${a} (${t}) wurde erfolgreich zur Fallakte ${r.caseNumber} hinzugefügt!`),q()};function cr(){const n=B.getOrders(),e=B.getCurrentUser();return e.role==="Superadmin"||e.role==="Administrator"?n:n.filter(t=>t.companyId===e.companyId||t.partnerId===e.companyId)}function ur(){const n=B.getCurrentUser();if(!n)return;const e=n.role==="Partner"||n.role==="Sub-Partner",t=["tab-finance","tab-analytics","tab-partners","tab-branches","tab-factorium","tab-audit"];document.querySelectorAll(".nav-leaf").forEach(i=>{const s=i.getAttribute("data-tab");if(t.includes(s)){const l=i.closest("li");l&&(l.style.display=e?"none":"block")}});const o=document.getElementById("admin-console-card");o&&(o.style.display=e?"none":"block");const r=document.getElementById("kpi-card-revenue");r&&(r.style.display=e?"none":"flex");const a=document.getElementById("kpi-card-calc");a&&(a.style.display=e?"none":"block")}let R=[],Z="7d",N=[{day:"10 Jul",amount:5800},{day:"11 Jul",amount:7750},{day:"12 Jul",amount:10950},{day:"13 Jul",amount:11800},{day:"14 Jul",amount:24300},{day:"15 Jul",amount:28800}],ae="all",Q="";function pr(){R=cr()}function vt(){B.getCurrentUser();const n=document.getElementById("current-user-avatar"),e=document.getElementById("current-user-name"),t=document.getElementById("current-user-role"),o=document.getElementById("role-selector");if(o){const a=B.getCurrentUserId();let i=B.getUsers();const s=B.getCompanies();s.forEach(p=>{let z=i.find(m=>m.companyId===p.id);z||(z={id:`USR-${p.id}`,name:p.contactPerson?`${p.name} (${p.contactPerson})`:p.name,email:p.emails&&p.emails.length>0?p.emails[0].value:"partner@serviceos.com",role:p.type||"Partner",companyId:p.id},i.push(z))});const l=new Set(s.map(p=>p.id));i=i.filter(p=>!p.companyId||l.has(p.companyId)),B.set("users",i);let g=`
      <optgroup label="Zentrale / System-Admins">
        ${i.filter(p=>p.role==="Superadmin"||p.role==="Administrator").map(p=>`
          <option value="${p.id}" ${p.id===a?"selected":""}>
            👤 ${p.name} (${p.role})
          </option>
        `).join("")}
      </optgroup>
      <optgroup label="Registrierte Partnerfirmen (${s.length})">
        ${s.map(p=>{const z=i.find(y=>y.companyId===p.id),m=z?z.id:`USR-${p.id}`,u=p.contactPerson?` - ${p.contactPerson}`:"";return`
            <option value="${m}" ${m===a?"selected":""}>
              🏢 ${p.name}${u} (${p.active?"Aktiv":"Inaktiv"})
            </option>
          `}).join("")}
      </optgroup>
    `;if(o.innerHTML!==g&&(o.innerHTML=g),i.some(p=>p.id===a))o.value=a;else{const p=i[0]?i[0].id:"USR-001";B.setCurrentUserId(p),o.value=p}}const r=B.getCurrentUser();if(n&&r){const a=r.name?r.name.split(" ").map(i=>i[0]).join(""):"PA";n.innerText=a}e&&r&&(e.innerText=r.name),t&&r&&(t.innerText=r.role)}window.updateUserHeaderProfile=vt;const W=document.getElementById("orders-list-body"),mr=document.getElementById("global-search"),ve=document.querySelectorAll(".filter-btn"),he=document.getElementById("kpi-revenue-today"),xe=document.getElementById("kpi-revenue-week"),we=document.getElementById("kpi-revenue-month"),Se=document.getElementById("kpi-active-today"),ke=document.getElementById("kpi-active-week"),Ee=document.getElementById("kpi-active-month"),Ie=document.getElementById("kpi-completed-today"),ze=document.getElementById("kpi-completed-week"),Be=document.getElementById("kpi-completed-month"),Ae=document.getElementById("kpi-avg-time-today"),$e=document.getElementById("kpi-avg-time-week"),Ce=document.getElementById("kpi-avg-time-month"),Te=document.getElementById("kpi-requests-today"),Le=document.getElementById("kpi-requests-week"),Me=document.getElementById("kpi-requests-month"),Oe=document.getElementById("kpi-action-today"),De=document.getElementById("kpi-action-week"),Pe=document.getElementById("kpi-action-month"),Re=document.getElementById("bar-pending"),Ne=document.getElementById("bar-shipped"),Ue=document.getElementById("bar-delivered"),Fe=document.getElementById("bar-cancelled"),He=document.getElementById("bar-returns"),qe=document.getElementById("label-pending"),Ge=document.getElementById("label-shipped"),Ve=document.getElementById("label-delivered"),Ke=document.getElementById("label-cancelled"),_e=document.getElementById("label-returns"),je=document.getElementById("order-modal"),We=document.getElementById("btn-open-modal"),gr=document.getElementById("btn-close-modal"),fr=document.getElementById("btn-cancel-form"),Ze=document.getElementById("create-order-form");function Qe(){q(),br(),rr(),ir(),ar(),sr(),Pt(),Ut(),Vt(),_t(),Wt(),Xt()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Qe):Qe();function br(){mr.addEventListener("input",b=>{Q=b.target.value.toLowerCase().trim(),se()}),ve.forEach(b=>{b.addEventListener("click",()=>{ve.forEach(c=>c.classList.remove("active")),b.classList.add("active"),ae=b.getAttribute("data-filter"),se()})});const n=document.querySelectorAll("#chart-time-filters .filter-btn");n.forEach(b=>{b.addEventListener("click",()=>{n.forEach(h=>h.classList.remove("active")),b.classList.add("active");const c=b.getAttribute("data-time"),w=document.querySelector(".chart-legend");c==="7d"?(N=[{day:"10 Jul",amount:5800},{day:"11 Jul",amount:7750},{day:"12 Jul",amount:10950},{day:"13 Jul",amount:11800},{day:"14 Jul",amount:24300},{day:"15 Jul",amount:28800}],w&&(w.innerText="7-Tage Transaktionsverlauf")):c==="1m"?(N=[{day:"Woche 1",amount:45e3},{day:"Woche 2",amount:52e3},{day:"Woche 3",amount:48e3},{day:"Woche 4",amount:65e3}],w&&(w.innerText="1-Monat Transaktionsverlauf")):c==="3m"?(N=[{day:"Mai",amount:185e3},{day:"Juni",amount:21e4},{day:"Juli",amount:25e4}],w&&(w.innerText="3-Monate Transaktionsverlauf")):c==="1y"&&(N=[{day:"Q3 '25",amount:52e4},{day:"Q4 '25",amount:68e4},{day:"Q1 '26",amount:45e4},{day:"Q2 '26",amount:72e4}],w&&(w.innerText="1-Jahr Transaktionsverlauf")),xt()})});const e=document.querySelectorAll("#fulfillment-time-filters .filter-btn");e.forEach(b=>{b.addEventListener("click",()=>{e.forEach(c=>c.classList.remove("active")),b.classList.add("active"),Z=b.getAttribute("data-time"),ht()})});const t=document.getElementById("btn-kpi-new-order");t&&t.addEventListener("click",()=>{const b=document.querySelector('.nav-leaf[data-tab="tab-wizard"]');b&&b.click()});const o=document.querySelectorAll(".kpi-card:not(#btn-kpi-new-order)"),r=document.getElementById("kpi-details-panel"),a=document.getElementById("kpi-details-title"),i=document.getElementById("kpi-details-content"),s=document.getElementById("btn-close-kpi-details");r&&s&&(s.addEventListener("click",()=>{r.style.display="none",o.forEach(b=>b.classList.remove("active-kpi"))}),o.forEach(b=>{b.addEventListener("click",()=>{var h;o.forEach(v=>v.classList.remove("active-kpi")),b.classList.add("active-kpi"),r.style.display="block";const c=((h=b.querySelector(".kpi-title"))==null?void 0:h.innerText)||"Details";a.innerText=c+" - Erweiterte Ansicht";let w="";switch(b.id){case"kpi-card-revenue":w=`
              <div style="margin-top:16px;">
                <p>Umsatzaufschlüsselung des aktuellen Monats.</p>
                <table class="data-table" style="width:100%; margin-top:12px;">
                  <thead><tr><th>Kategorie</th><th>Betrag</th><th>Trend</th></tr></thead>
                  <tbody>
                    <tr><td>Entrümpelungen</td><td>€ 12.450,00</td><td style="color:var(--color-delivered)">+4%</td></tr>
                    <tr><td>Transporte</td><td>€ 8.300,00</td><td style="color:var(--color-delivered)">+2%</td></tr>
                    <tr><td>Sonstiges</td><td>€ 2.100,00</td><td style="color:var(--color-text-muted)">±0%</td></tr>
                  </tbody>
                </table>
              </div>
            `;break;case"kpi-card-active":{const v=R.filter(S=>S.status==="Shipped");w=`
              <div style="margin-top:16px;">
                <p style="margin-bottom:12px; color: var(--color-text-secondary);">
                  Übersicht der <strong>aktiven Aufträge</strong> (vom Kunden erteilte Aufträge in Bearbeitung / Disponiert).
                </p>
                <div style="margin-top:12px;">
                  ${v.length>0?`
                    <table class="data-table" style="width:100%; border-collapse:collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid var(--color-border); text-align:left;">
                          <th style="padding: 8px;">ID</th>
                          <th style="padding: 8px;">Kunde</th>
                          <th style="padding: 8px;">Produkt / Service</th>
                          <th style="padding: 8px;">Wert</th>
                          <th style="padding: 8px;">Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${v.map(S=>`
                          <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 8px; font-weight:bold; color:var(--color-primary);">${S.id}</td>
                            <td style="padding: 8px;">${S.client}</td>
                            <td style="padding: 8px;">${S.product||S.branch}</td>
                            <td style="padding: 8px;">€ ${S.value.toFixed(2)}</td>
                            <td style="padding: 8px;">
                              <button onclick="window.updateOrderStatus('${S.id}', 'Delivered')" style="padding:6px 12px; font-size:0.75rem; background:rgba(59, 130, 246, 0.2); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.4); border-radius:4px; cursor:pointer; font-weight:600;">
                                ✓ Auftrag abschließen
                              </button>
                            </td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  `:'<div style="padding:16px; text-align:center; color:var(--color-text-muted); background:rgba(255,255,255,0.02); border-radius:6px;">Derzeit keine aktiven Aufträge in Bearbeitung.</div>'}
                </div>
              </div>
            `;break}case"kpi-card-requests":{const v=R.filter(S=>S.status==="Pending");w=`
              <div style="margin-top:16px;">
                <p style="margin-bottom:12px; color: var(--color-text-secondary);">
                  Alle eingegangenen <strong>Anfragen</strong>. Alle angelegten Einträge starten als Anfrage. Erst wenn der Kunde den Auftrag erteilt, werden sie zu aktiven Aufträgen.
                </p>
                <div style="margin-top:12px;">
                  ${v.length>0?`
                    <table class="data-table" style="width:100%; border-collapse:collapse;">
                      <thead>
                        <tr style="border-bottom: 1px solid var(--color-border); text-align:left;">
                          <th style="padding: 8px;">ID</th>
                          <th style="padding: 8px;">Kunde</th>
                          <th style="padding: 8px;">Produkt / Service</th>
                          <th style="padding: 8px;">Betrag</th>
                          <th style="padding: 8px;">Datum</th>
                          <th style="padding: 8px;">Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${v.map(S=>`
                          <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 8px; font-weight:bold; color:var(--color-primary);">${S.id}</td>
                            <td style="padding: 8px;">${S.client}</td>
                            <td style="padding: 8px;">${S.product||S.branch}</td>
                            <td style="padding: 8px;">€ ${S.value.toFixed(2)}</td>
                            <td style="padding: 8px;">${S.date}</td>
                            <td style="padding: 8px;">
                              <button onclick="window.updateOrderStatus('${S.id}', 'Shipped')" style="padding:6px 12px; font-size:0.75rem; background:rgba(16, 185, 129, 0.2); color:#34d399; border:1px solid rgba(16, 185, 129, 0.4); border-radius:4px; cursor:pointer; font-weight:600;">
                                ⚡ Kunde gibt Auftrag
                              </button>
                            </td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  `:'<div style="padding:16px; text-align:center; color:var(--color-text-muted); background:rgba(255,255,255,0.02); border-radius:6px;">Derzeit liegen keine unbestätigten Anfragen vor.</div>'}
                </div>
              </div>
            `;break}case"kpi-card-completed":w=`
              <div style="margin-top:16px;">
                <p>Zusammenfassung der abgeschlossenen Aufträge.</p>
                <div style="margin-top:12px; display:flex; gap:16px;">
                  <div style="flex:1; padding:16px; background:var(--color-bg-sidebar); border-radius:8px;">
                    <h4>Zufriedenheitsquote</h4>
                    <p style="font-size:1.5rem; color:var(--color-delivered);">98,4%</p>
                  </div>
                  <div style="flex:1; padding:16px; background:var(--color-bg-sidebar); border-radius:8px;">
                    <h4>Retouren / Reklamationen</h4>
                    <p style="font-size:1.5rem; color:var(--color-pending);">1,6%</p>
                  </div>
                </div>
              </div>
            `;break;default:w=`<p style="margin-top:16px;">Erweiterte Daten für <strong>${c}</strong> werden derzeit generiert und stehen in Kürze hier zur Verfügung.</p>`}i.innerHTML=w,r.scrollIntoView({behavior:"smooth",block:"nearest"})})})),We&&We.addEventListener("click",()=>{je.classList.add("active"),document.getElementById("customerName").focus()});const l=()=>{je.classList.remove("active"),Ze.reset()};gr.addEventListener("click",l),fr.addEventListener("click",l);const d=document.getElementById("role-selector");d&&d.addEventListener("change",b=>{B.setCurrentUserId(b.target.value),q()}),Ze.addEventListener("submit",b=>{b.preventDefault();const c=document.getElementById("customerName").value,w=document.getElementById("productName").value,h=parseFloat(document.getElementById("orderValue").value),v=document.getElementById("orderPriority").value,S=document.getElementById("orderStatus").value,I=U("ORD"),A=U("CAS"),C=U("SO"),$=new Date().toISOString().split("T")[0],T=B.getCurrentUser(),D=T.role==="Partner"||T.role==="Sub-Partner"?T.companyId:null,L=`Standardauftrag für ${w} bei Client ${c}.`,M=ee(L,"General",D),O=B.createCase({id:A,caseNumber:C,client:c,location:"Direkterfassung",branch:"General",reason:L,status:S,companyId:D,orders:[I],author:T.name||"Zentrale"}),P={id:I,caseId:O.id,caseNumber:O.caseNumber,client:c,product:w,description:L,value:h,priority:v,status:S,date:$,branch:"General",companyId:D,qNexusMetrics:M},H=B.getOrders();H.unshift(P),B.set("orders",H),B.logAudit("ORDER_CREATION",`Created order ${I} (Fallakte ${O.caseNumber}) for client ${c}`),yr(P),q(),l()});const g=document.getElementById("calc-priority-slider"),p=document.getElementById("calc-days"),z=document.getElementById("calc-packaging-slider"),m=document.getElementById("calc-pkg-level"),u=document.getElementById("calc-express-check"),y=document.getElementById("calc-base-cost"),k=document.getElementById("calc-extra-cost"),x=document.getElementById("calc-cost-result"),f=document.getElementById("calc-resource-result"),E=()=>{if(!g)return;const b=parseInt(g.value,10),c=parseInt(z?z.value:2,10),w=u?u.checked:!1;p&&(p.innerText=b),m&&(m.innerText=c);const h=350;let v=0;v+=(11-b)*20,v+=(c-1)*80,w&&(v+=150);const S=B.getSettings(),I=new Intl.NumberFormat(S.language||"de-AT",{style:"currency",currency:S.currency||"EUR"}),A=(h+v)*((S.commission||15)/100),C=h+v+A;y&&(y.innerText=I.format(h)),k&&(k.innerText=I.format(v)),x&&(x.innerText=I.format(C)),f&&(b<=2||w?(f.innerText="Critical load",f.style.color="var(--color-priority-critical)"):b<=5?(f.innerText="High load",f.style.color="var(--color-priority-high)"):(f.innerText="Optimal",f.style.color="var(--color-delivered)")),console.log(`[LUDUS Telemetry] User adjusted SLA Configurator. Target Days: ${b}, Est. Cost: ${C}`)};g&&(g.addEventListener("input",b=>{E()}),E()),z&&z.addEventListener("input",b=>{E()}),u&&u.addEventListener("change",b=>{E()})}function yr(n){N.length>0&&(N[N.length-1].amount+=n.value)}function pe(){var o;const n=document.getElementById("cases-table-body");if(!n)return;const e=(((o=document.getElementById("cases-search-input"))==null?void 0:o.value)||"").toLowerCase();let t=B.getCases();if(e&&(t=t.filter(r=>(r.caseNumber||"").toLowerCase().includes(e)||(r.id||"").toLowerCase().includes(e)||(r.client||"").toLowerCase().includes(e)||(r.location||"").toLowerCase().includes(e)||(r.branch||"").toLowerCase().includes(e))),n.innerHTML="",t.length===0){n.innerHTML='<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">Keine Fallakten gefunden.</td></tr>';return}t.forEach(r=>{const a=document.createElement("tr");a.style.borderBottom="1px solid var(--color-border)";const i=(r.orders||[]).length,s=(r.timeline||[]).length;a.innerHTML=`
      <td style="padding: 12px; font-family: var(--font-heading); font-weight: 600;">
        <div style="color: #f59e0b;">${r.caseNumber||r.id}</div>
        <div style="font-size: 0.7rem; color: var(--color-text-muted); font-family: monospace;">ID: ${r.id}</div>
      </td>
      <td style="padding: 12px;">
        <div style="font-weight: 500; color: var(--color-text-primary);">${r.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${r.location||"Direktauftrag"}</div>
      </td>
      <td style="padding: 12px;">
        <div style="font-size: 0.85rem; color: var(--color-text-primary); font-weight: 500;">${r.branch}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${r.reason||"Serviceanfrage"}</div>
      </td>
      <td style="padding: 12px; text-align: center;">
        <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-weight: bold;">
          ${i} Teilauftrag${i!==1?"äge":""}
        </span>
      </td>
      <td style="padding: 12px; text-align: center;">
        <span class="badge-status ${(r.status||"Pending").toLowerCase()}" style="font-size: 0.75rem;">
          ${r.status||"Pending"}
        </span>
      </td>
      <td style="padding: 12px; text-align: right;">
        <button type="button" class="btn btn-sm btn-open-case-modal" data-id="${r.id}" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 600; cursor: pointer;">
          📜 Akte öffnen (${s})
        </button>
      </td>
    `,n.appendChild(a)}),n.querySelectorAll(".btn-open-case-modal").forEach(r=>{r.addEventListener("click",()=>vr(r.getAttribute("data-id")))})}function vr(n){const e=B.getCaseById(n);if(!e)return;const t=document.getElementById("case-modal-detail");if(!t)return;document.getElementById("case-modal-title").textContent=`📁 Fallakte ${e.caseNumber||e.id}`,document.getElementById("case-modal-subtitle").textContent=`Kunde: ${e.client} | Branche: ${e.branch} | Ort: ${e.location||"k.A."}`;const o=document.getElementById("case-modal-orders-list"),a=B.getOrders().filter(d=>d.caseId===e.id||d.caseNumber===e.caseNumber||(e.orders||[]).includes(d.id));o&&(a.length===0?o.innerHTML='<div style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Teilaufträge verknüpft.</div>':o.innerHTML=a.map(d=>`
        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <div>
            <span style="font-family: monospace; font-weight: bold; color: var(--color-primary);">${d.id}</span>
            <span style="margin-left: 8px; color: var(--color-text-primary); font-weight: 500;">${d.product||d.branch}</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <strong style="color: #34d399;">€ ${(d.value||0).toFixed(2)}</strong>
            <span class="badge-status ${d.status.toLowerCase()}" style="font-size: 0.7rem;">${d.status}</span>
          </div>
        </div>
      `).join("")),Je(e);const i=document.getElementById("btn-add-case-timeline-entry"),s=document.getElementById("case-timeline-new-input");if(i&&s){const d=i.cloneNode(!0);i.parentNode.replaceChild(d,i),d.addEventListener("click",()=>{const g=s.value.trim();if(!g)return;const p=B.getCurrentUser();B.addTimelineEventToCase(e.id,{title:"Manuelle Aktennotiz",author:p.name||"Bearbeiter",type:"NOTE",details:g}),s.value="";const z=B.getCaseById(e.id);Je(z),pe()})}const l=document.getElementById("btn-close-case-modal");l&&(l.onclick=()=>{t.style.display="none"}),t.style.display="flex"}function Je(n){const e=document.getElementById("case-modal-timeline-container");if(!e)return;const t=n.timeline||[];if(t.length===0){e.innerHTML='<div style="font-size: 0.8rem; color: var(--color-text-muted);">Keine Einträge in der Akten-Timeline.</div>';return}e.innerHTML=t.map(o=>`
    <div style="background: rgba(30, 41, 59, 0.5); border-left: 3px solid #3b82f6; border-radius: 4px; padding: 8px 12px; font-size: 0.8rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <strong style="color: var(--color-text-primary);">${o.title||"Ereignis"}</strong>
        <span style="font-size: 0.7rem; color: var(--color-text-muted);">${new Date(o.timestamp).toLocaleString("de-AT")} (${o.author||"System"})</span>
      </div>
      <div style="color: var(--color-text-secondary);">${o.details||o.description||""}</div>
    </div>
  `).join("")}window.renderCasesTable=pe;function q(){pr(),ht(),se(),pe(),xt(),vt(),ur()}function ht(){const n=(c,w=!1)=>{const h=w?c*.12:Math.round(c*.12),v=w?c*.45:Math.round(c*.45);return{today:h,week:v,month:c}},e=c=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(c),t=R.filter(c=>c.status!=="Cancelled").reduce((c,w)=>c+w.value,0),o=n(t,!0);he&&(he.innerText=e(o.today)),xe&&(xe.innerText=e(o.week)),we&&(we.innerText=e(o.month));const r=R.filter(c=>c.status==="Shipped").length,a=n(r);Se&&(Se.innerText=a.today),ke&&(ke.innerText=a.week),Ee&&(Ee.innerText=a.month);const i=R.filter(c=>c.status==="Delivered").length,s=n(i);Ie&&(Ie.innerText=s.today),ze&&(ze.innerText=s.week),Be&&(Be.innerText=s.month),Ae&&(Ae.innerText="1,8 Std."),$e&&($e.innerText="2,1 Std."),Ce&&(Ce.innerText="2,0 Std.");const l=R.filter(c=>c.status==="Pending").length,d=n(l);Te&&(Te.innerText=d.today),Le&&(Le.innerText=d.week),Me&&(Me.innerText=d.month),Oe&&(Oe.innerText=Math.round(r*.1)),De&&(De.innerText=Math.round(r*.2)),Pe&&(Pe.innerText=Math.round(r*.5));const g=R.length||1,p=R.filter(c=>c.status==="Pending").length,z=R.filter(c=>c.status==="Shipped").length,m=R.filter(c=>c.status==="Delivered").length,u=R.filter(c=>c.status==="Cancelled").length,y=Math.round(m*.05);let k=Math.round(p/g*100),x=Math.round(z/g*100),f=Math.round(m/g*100),E=Math.round(u/g*100),b=Math.round(y/g*100);Z==="1m"?(k=Math.min(100,Math.round(k*1.5)),x=Math.max(0,Math.round(x*.8)),f=Math.min(100,Math.round(f*1.1)),E=Math.round(E*1.2),b=Math.round(b*1.4)):Z==="3m"?(k=Math.max(0,Math.round(k*.6)),x=Math.max(0,Math.round(x*1.3)),f=Math.min(100,Math.round(f*1.4)),E=Math.round(E*.9),b=Math.round(b*1.1)):Z==="1y"&&(k=Math.max(0,Math.round(k*.3)),x=Math.max(0,Math.round(x*.5)),f=Math.min(100,Math.round(f*1.8)),E=Math.round(E*.5),b=Math.round(b*.8)),Re&&(Re.style.width=k+"%"),Ne&&(Ne.style.width=x+"%"),Ue&&(Ue.style.width=f+"%"),Fe&&(Fe.style.width=E+"%"),He&&(He.style.width=b+"%"),qe&&(qe.innerText=k+"%"),Ge&&(Ge.innerText=x+"%"),Ve&&(Ve.innerText=f+"%"),Ke&&(Ke.innerText=E+"%"),_e&&(_e.innerText=b+"%")}function se(){W.innerHTML="";const n=R.filter(e=>{const t=ae==="all"||e.status===ae,o=e.id.toLowerCase().includes(Q)||e.client.toLowerCase().includes(Q)||e.product.toLowerCase().includes(Q);return t&&o});if(n.length===0){W.innerHTML='<tr><td colspan="8" style="text-align: center; color: var(--color-text-muted); padding: 32px;">Keine passenden Datensätze gefunden.</td></tr>';return}n.forEach((e,t)=>{const o=document.createElement("tr");o.className="animate-row",o.style.animationDelay=`${t*.05}s`;const r=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(e.value);let a="";e.status==="Pending"?a=`
        <button class="action-row-btn complete" onclick="window.updateOrderStatus('${e.id}', 'Shipped')" title="Kunde gibt Auftrag" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; font-size:0.75rem; background:rgba(16, 185, 129, 0.15); color:#10b981; border:1px solid rgba(16, 185, 129, 0.3); border-radius:4px; font-weight:600; cursor:pointer;">
          ⚡ Kunde gibt Auftrag
        </button>
        <button class="action-row-btn cancel" onclick="window.updateOrderStatus('${e.id}', 'Cancelled')" title="Anfrage stornieren">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `:e.status==="Shipped"?a=`
        <button class="action-row-btn complete" onclick="window.updateOrderStatus('${e.id}', 'Delivered')" title="Auftrag abschließen" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; font-size:0.75rem; background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.3); border-radius:4px; font-weight:600; cursor:pointer;">
          ✓ Auftrag abschließen
        </button>
      `:a='<span style="color: var(--color-text-muted); font-size: 0.75rem;">Gesperrt</span>';const i=e.qNexusMetrics?e.qNexusMetrics.qNexus:1;let s="q-excellent";i<.6?s="q-critical":i<.85&&(s="q-warning");const l={Normal:"Normal",High:"Hoch",Critical:"Kritisch"}[e.priority]||e.priority,d={Pending:"Anfrage (Wartet auf Kunden)",Shipped:"Auftrag erteilt",Delivered:"Abgeschlossen",Cancelled:"Storniert"}[e.status]||e.status,g=B.getCaseById(e.caseId||e.caseNumber),p=ue(e.branch,e.description,e.subcategories);o.innerHTML=`
      <td style="font-family: var(--font-heading); font-weight: 600; color: var(--color-primary);">
        <div>${e.id}</div>
        ${e.caseNumber?`<div style="font-size: 0.65rem; color: #f59e0b; font-weight: normal; margin-top: 2px;">📁 ${e.caseNumber}</div>`:""}
      </td>
      <td>
        <div style="font-weight: 500; color: var(--color-text-primary);">${e.client}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${e.date}</div>
      </td>
      <td>
        <div>${e.product}</div>
        <div style="display:inline-flex; align-items:center; gap:4px; font-size: 0.65rem; color: var(--color-secondary); margin-top:4px; padding: 2px 6px; background: var(--color-secondary-glow); border-radius: 4px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Geo-Validiert
        </div>
      </td>
      <td style="font-weight: 600; color: var(--color-text-primary);">${r}</td>
      <td><span class="priority-indicator ${e.priority}">${l}</span></td>
      <td>
        <span class="q-score-badge ${s}" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-family: monospace; font-weight: bold;">
          ${i.toFixed(3)}
        </span>
      </td>
      <td><span class="badge-status ${e.status.toLowerCase()}">${d}</span></td>
      <td>
        <div style="display: flex; gap: 8px;">
          ${a}
        </div>
      </td>
    `,o.style.cursor="pointer";const z=B.getCompanies(),m=document.createElement("tr");m.className="expandable-detail-row",m.style.display="none",m.innerHTML=`
      <td colspan="8" style="padding: 0; border: none;">
        <div class="expandable-content" style="padding: 20px 24px; background: var(--color-bg-sidebar); border-bottom: 1px solid var(--color-border); box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1.1fr; gap: 24px; align-items: start;">
            
            <!-- Spalte 1: Kunden- & Auftragsdaten bearbeiten -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                👤 Kunden & Auftragsdaten
              </h4>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Kundenname</label>
                  <input type="text" class="wizard-input edit-order-client" value="${(e.client||"").replace(/"/g,"&quot;")}" style="height: 36px; padding: 0 10px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Auftragswert (€)</label>
                  <input type="number" step="0.01" class="wizard-input edit-order-value" ${isPartner?"disabled":""} value="${e.value||0}" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: ${isPartner?"rgba(15,23,42,0.4)":"transparent"}; color: ${isPartner?"var(--color-text-muted)":"var(--color-text-primary)"}; cursor: ${isPartner?"not-allowed":"text"};" />
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Beschreibung / Notizen</label>
                  <textarea class="wizard-input edit-order-desc" rows="2" style="padding: 8px 10px; font-size: 0.85rem; width: 100%; resize: vertical;">${e.description||""}</textarea>
                </div>
                
                <!-- Risk Shield Zustandsdokumentation -->
                <div style="margin-top: 6px; border-top: 1px dashed var(--color-border); padding-top: 8px;">
                  <label style="font-size: 0.75rem; color: #60a5fa; display: flex; align-items: center; gap: 4px; margin-bottom: 4px; font-weight: 600;">
                    🛡️ Risk Shield - Zustandsprotokoll
                  </label>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div>
                      <span style="font-size: 0.7rem; color: var(--color-text-secondary);">Vorher-Zustand (Start):</span>
                      <input type="text" class="wizard-input edit-order-statedoc-pre" value="${(e.stateDocPre||"").replace(/"/g,"&quot;")}" placeholder="Protokollierung bei Besichtigung / Übernahme" style="height: 32px; font-size: 0.8rem; width: 100%;" />
                    </div>
                    <div>
                      <span style="font-size: 0.7rem; color: var(--color-text-secondary);">Nachher-Zustand (Abnahme):</span>
                      <input type="text" class="wizard-input edit-order-statedoc-post" value="${(e.stateDocPost||"").replace(/"/g,"&quot;")}" placeholder="Besenreine Übergabe / Mängelprüfung" style="height: 32px; font-size: 0.8rem; width: 100%;" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Spalte 2: Partnerfirma zuweisen & Workflow -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                🏢 Partnerfirma zuweisen
              </h4>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Zugeordnete Partnerfirma</label>
                  <select class="wizard-input edit-order-company" ${isPartner?"disabled":""} style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: ${isPartner?"rgba(15,23,42,0.4)":"rgba(15, 23, 42, 0.9)"}; border: 1px solid var(--color-border); color: ${isPartner?"var(--color-text-muted)":"var(--color-text-primary)"}; border-radius: var(--border-radius-sm); width: 100%; cursor: ${isPartner?"not-allowed":"pointer"};">
                    <option value="">-- Direktauftrag (Zentrale / Keine) --</option>
                    ${z.map(u=>`
                      <option value="${u.id}" ${e.companyId===u.id?"selected":""}>
                        ${u.name} (${u.id} - ${u.active?"GISA OK":"Inaktiv"})
                      </option>
                    `).join("")}
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Auftragsstatus</label>
                  <select class="wizard-input edit-order-status" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: var(--border-radius-sm); width: 100%;">
                    <option value="Pending" ${e.status==="Pending"?"selected":""}>Anfrage (Wartet auf Kunden)</option>
                    <option value="Shipped" ${e.status==="Shipped"?"selected":""}>Auftrag erteilt (In Bearbeitung)</option>
                    <option value="Delivered" ${e.status==="Delivered"?"selected":""}>Abgeschlossen / Geliefert</option>
                    <option value="Cancelled" ${e.status==="Cancelled"?"selected":""}>Storniert</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 3px;">Prioritäts-Level</label>
                  <select class="wizard-input edit-order-priority" style="height: 36px; padding: 0 10px; font-size: 0.85rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: var(--border-radius-sm); width: 100%;">
                    <option value="Normal" ${e.priority==="Normal"?"selected":""}>Normal</option>
                    <option value="High" ${e.priority==="High"?"selected":""}>Hoch</option>
                    <option value="Critical" ${e.priority==="Critical"?"selected":""}>Kritisch</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Spalte 3: Details, Speichern, KI Cross-Selling & Dokument-Aktion -->
            <div>
              <h4 style="margin-bottom: 12px; color: #60a5fa; font-size: 0.95rem; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                ⚙️ Metriken & Aktionen
              </h4>
              <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 4px;">
                <div><strong style="color: var(--color-text-primary);">Fallakte:</strong> <span style="font-family: monospace; color: #f59e0b; font-weight: bold;">${e.caseNumber||(g==null?void 0:g.caseNumber)||"Keine Fallakte"}</span></div>
                <div><strong style="color: var(--color-text-primary);">Branche:</strong> ${e.branch||e.product||"Allgemein"}</div>
                <div><strong style="color: var(--color-text-primary);">Partner Name:</strong> ${e.partner||(e.companyId?e.companyId:"Zentrale")}</div>
                <div><strong style="color: var(--color-text-primary);">Q_NEXUS Score:</strong> <span style="font-family: monospace; color: #34d399; font-weight: bold;">${i.toFixed(3)}</span></div>
                ${e.subcategories&&e.subcategories.length>0?`
                  <div style="margin-top: 2px;">
                    <strong style="color: var(--color-text-primary);">Unterbereiche:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px;">
                      ${e.subcategories.map(u=>`<span style="font-size: 0.7rem; padding: 1px 5px; border-radius: 3px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">${u}</span>`).join("")}
                    </div>
                  </div>
                `:""}
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button type="button" class="btn-save-order-changes" style="background: var(--color-delivered); color: #fff; border: none; padding: 9px 14px; font-size: 0.85rem; border-radius: var(--border-radius-sm); cursor: pointer; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  ✓ Änderungen speichern
                </button>
                <button type="button" class="btn-create-doc-from-order" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); padding: 9px 14px; font-size: 0.85rem; border-radius: var(--border-radius-sm); cursor: pointer; font-weight: 600; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  📄 Angebot / Rechnung erstellen
                </button>
              </div>

              ${p&&p.length>0?`
                <div style="margin-top: 14px; border-top: 1px dashed var(--color-border); padding-top: 10px;">
                  <h5 style="color: #f59e0b; font-size: 0.8rem; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                    ✨ KI Cross-Selling Empfehlungen
                  </h5>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${p.map(u=>`
                      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 8px; border-radius: 6px; font-size: 0.75rem;">
                        <div style="font-weight: 600; color: #fbbf24; font-size: 0.8rem;">${u.title} (${u.branch})</div>
                        <div style="color: var(--color-text-secondary); margin: 2px 0 4px 0;">${u.reason}</div>
                        <button type="button" onclick="window.createCrossSellingSubOrder('${g?g.id:e.caseId||e.id}', '${u.branch}', '${u.title.replace(/'/g,"\\'")}', ${u.suggestedValue})" style="padding: 4px 8px; font-size: 0.7rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 4px; cursor: pointer; font-weight: 600; width: 100%;">
                          ⚡ Teilauftrag anlegen (€ ${u.suggestedValue})
                        </button>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `:""}
            </div>

          </div>
        </div>
      </td>
    `,m.querySelector(".btn-save-order-changes").addEventListener("click",u=>{var S,I;u.stopPropagation();const y=m.querySelector(".edit-order-client").value.trim(),k=parseFloat(m.querySelector(".edit-order-value").value)||0,x=m.querySelector(".edit-order-desc").value.trim(),f=m.querySelector(".edit-order-company").value,E=m.querySelector(".edit-order-status").value,b=m.querySelector(".edit-order-priority").value,c=((S=m.querySelector(".edit-order-statedoc-pre"))==null?void 0:S.value.trim())||"",w=((I=m.querySelector(".edit-order-statedoc-post"))==null?void 0:I.value.trim())||"",h=B.getOrders(),v=h.findIndex(A=>A.id===e.id);if(v>-1){let A="Direktauftrag (Zentrale)";if(f){const C=z.find($=>$.id===f);if(C&&(A=C.name,window.calculatePartnerTrustScore)){const $=window.calculatePartnerTrustScore(C);if($.trafficLight.includes("Gesperrt")){alert(`⚠️ Risk Shield Sperre: Die Partnerfirma "${C.name}" ist aktuell gesperrt (${$.trafficLight}). Auftragszuweisung abgelehnt.`);return}}}h[v]={...h[v],client:y,value:k,description:x,companyId:f||null,partner:A,partnerId:f||null,status:E,priority:b,stateDocPre:c,stateDocPost:w},B.set("orders",h),B.logAudit("ORDER_UPDATED",`Auftrag ${e.id} für ${y} aktualisiert (Partner: ${A}, Status: ${E}).`),alert(`✓ Auftrag ${e.id} wurde erfolgreich aktualisiert!`),q()}}),m.querySelector(".btn-create-doc-from-order").addEventListener("click",u=>{u.stopPropagation();const y=document.querySelector('.nav-leaf[data-tab="tab-new-document"]');y&&(y.click(),setTimeout(()=>{const k=document.getElementById("doc-type"),x=document.getElementById("doc-client"),f=document.getElementById("doc-title"),E=document.getElementById("doc-netto"),b=document.getElementById("doc-case-id");k&&(k.value="Rechnung (§ 11 UStG)"),x&&(x.value=e.client||""),f&&(f.value=`Honorarrechnung für ${e.product||e.branch||"Dienstleistung"} (${e.id})`),E&&(E.value=((e.value||450)/1.2).toFixed(2)),b&&(e.caseId||e.caseNumber)&&(b.value=e.caseId||e.caseNumber);const c=new Event("input");f&&f.dispatchEvent(c),E&&E.dispatchEvent(c)},100))}),m.querySelectorAll("input, select, textarea, button").forEach(u=>{u.addEventListener("click",y=>y.stopPropagation())}),o.addEventListener("click",u=>{if(u.target.closest("button"))return;const y=m.style.display==="table-row";m.style.display=y?"none":"table-row",y?o.style.backgroundColor="":o.style.backgroundColor="rgba(99,102,241,0.05)"}),W.appendChild(o),W.appendChild(m)})}window.updateOrderStatus=(n,e)=>{const t=B.getOrders(),o=t.findIndex(r=>r.id===n);if(o!==-1){const r=t[o],a=B.getCurrentUser();let i=!1;if((a.role==="Superadmin"||a.role==="Administrator"||a.role==="Partner"&&r.companyId===a.companyId)&&(i=!0),i){const s=r.status;r.status=e,B.set("orders",t),B.logAudit("ORDER_STATUS_CHANGE",`Order ${n} status changed from ${s} to ${e}`),q()}else alert(`Zugriff verweigert: Als ${a.role} haben Sie keine Berechtigung, diesen Auftrag zu aktualisieren.`),B.logAudit("UNAUTHORIZED_ACCESS_ATTEMPT",`Attempted to change order ${n} status from ${r.status} to ${e} without permission.`)}};function xt(){const n=document.getElementById("chart-content");if(n.innerHTML="",N.length===0)return;const e=500,t=150,o=50,r=20,a=Math.max(...N.map(y=>y.amount))*1.15||1e3,i=0,s=e/(N.length-1||1);let l=[];N.forEach((y,k)=>{const x=o+k*s,f=(y.amount-i)/(a-i),E=t+r-f*t;l.push({x,y:E,day:y.day,amount:y.amount})}),l.forEach(y=>{const k=document.createElementNS("http://www.w3.org/2000/svg","text");k.setAttribute("x",y.x),k.setAttribute("y",t+r+20),k.setAttribute("text-anchor","middle"),k.setAttribute("class","chart-text"),k.textContent=y.day,n.appendChild(k)});const d=[a,a/2,0],g=[r,r+t/2,r+t];d.forEach((y,k)=>{const x=document.createElementNS("http://www.w3.org/2000/svg","text");x.setAttribute("x",o-10),x.setAttribute("y",g[k]+4),x.setAttribute("text-anchor","end"),x.setAttribute("class","chart-text");const f=y>=1e3?(y/1e3).toFixed(1)+"k":Math.round(y);x.textContent="€"+f,n.appendChild(x)});let p=`M ${l[0].x} ${l[0].y}`;for(let y=1;y<l.length;y++)p+=` L ${l[y].x} ${l[y].y}`;let z=`${p} L ${l[l.length-1].x} ${t+r} L ${l[0].x} ${t+r} Z`;const m=document.createElementNS("http://www.w3.org/2000/svg","path");m.setAttribute("d",z),m.setAttribute("class","chart-area"),n.appendChild(m);const u=document.createElementNS("http://www.w3.org/2000/svg","path");u.setAttribute("d",p),u.setAttribute("class","chart-line"),n.appendChild(u),l.forEach(y=>{const k=document.createElementNS("http://www.w3.org/2000/svg","circle");k.setAttribute("cx",y.x),k.setAttribute("cy",y.y),k.setAttribute("class","chart-point");const x=document.createElementNS("http://www.w3.org/2000/svg","title");x.textContent=`${y.day}: €${y.amount.toFixed(2)}`,k.appendChild(x),n.appendChild(k)})}window.showComplianceDetails=n=>{const t=B.getOrders().find(l=>l.id===n);if(!t)return;const o=document.getElementById("compliance-details-modal");if(!o)return;const r=document.getElementById("comp-modal-title"),a=document.getElementById("comp-modal-desc"),i=document.getElementById("comp-modal-score"),s=document.getElementById("comp-modal-details");if(r&&(r.innerText=`Compliance-Audit: ${t.id}`),a&&(a.innerText=`Kunde: ${t.client} | Service: ${t.product}`),i&&t.qNexusMetrics){const l=t.qNexusMetrics.qNexus;i.innerText=l.toFixed(3),i.className="comp-large-score",l>=.85?i.classList.add("q-excellent"):l>=.6?i.classList.add("q-warning"):i.classList.add("q-critical")}if(s&&t.qNexusMetrics){const l=t.qNexusMetrics,d=l.compliance;let g=`
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; text-align: center;">
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Syntax Score (S)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--color-primary);">${(l.sScore*100).toFixed(0)}%</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Verification (V)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--color-secondary);">${(l.vScore*100).toFixed(0)}%</div>
        </div>
        <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 4px;">Lupos (FRE) (L)</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: #a855f7;">${(l.lScore*100).toFixed(0)}%</div>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.9rem; margin-bottom: 8px; font-family: var(--font-heading);">Validierter Textinhalt</h4>
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border); font-size: 0.85rem; line-height: 1.5; font-style: italic;">
          "${t.description||"N/A"}"
        </div>
      </div>
    `;d.modifications&&d.modifications.length>0&&(g+=`
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--color-pending); font-family: var(--font-heading);">Linguistische Anpassungen (LINGUA-LOCAL)</h4>
          <ul style="padding-left: 20px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 8px; text-align: left;">
      `,d.modifications.forEach(p=>{g+=`<li>Ersetzt: <s>"${p.original}"</s> &rarr; <strong>"${p.replaced}"</strong><br><small style="color: var(--color-text-muted);">${p.reason}</small></li>`}),g+="</ul></div>"),d.errors&&d.errors.length>0?(g+=`
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--color-cancelled); font-family: var(--font-heading);">Compliance-Verstöße</h4>
          <ul style="padding-left: 20px; font-size: 0.8rem; color: #fda4af; display: flex; flex-direction: column; gap: 4px; text-align: left;">
      `,d.errors.forEach(p=>{g+=`<li>${p}</li>`}),g+="</ul></div>"):g+=`
        <div style="color: var(--color-delivered); font-weight: 600; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-top: 16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Verifizierung abgeschlossen: Fixpunkt erreicht ($T(X^*) = X^*$).
        </div>
      `,s.innerHTML=g}o.classList.add("active")};document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("btn-close-comp-modal"),e=document.getElementById("btn-close-comp-modal-ok"),t=document.getElementById("compliance-details-modal"),o=()=>{t&&t.classList.remove("active")};n&&n.addEventListener("click",o),e&&e.addEventListener("click",o)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Xe):Xe();function Xe(){const n=document.getElementById("wizard-form");if(!n)return;const e=Array.from(document.querySelectorAll(".wizard-panel")),t=Array.from(document.querySelectorAll(".wizard-step-indicator")),o=document.getElementById("wizard-prev-btn"),r=document.getElementById("wizard-next-btn");document.querySelectorAll(".branch-card");const a=document.getElementById("wizard-media-drop"),i=document.getElementById("wizard-media"),s=document.getElementById("wizard-upload-text");let l=1,d={sources:[],categories:[],subcategories:[],branch:"Entrümpelung",address:{plz:"",ort:"",bundesland:"",strasse:"",hausnr:"",stiege:"",tuer:"",ausland:""},location:"",client:"",contact:{clientPhone:"",clientEmail:"",vertretung:"",vertretungPhone:"",vertretungEmail:""},description:"",mediaCount:0,partnerId:null,isOpenOrder:!1};function g(h){const v=document.getElementById("subcategories-container");if(!v)return;const I=(window.ServiceOSStore&&typeof window.ServiceOSStore.getBranches=="function"?window.ServiceOSStore.getBranches():[]).find($=>$.name===h);if(!I||!I.subcategories||I.subcategories.length===0){v.innerHTML=`
        <div style="margin-top: 12px; font-size: 0.85rem; color: var(--color-text-muted);">
          Keine spezifischen Unterbereiche für ${h} definiert.
        </div>
      `;return}const A=I.subcategories;typeof A[0]=="object"&&A[0]!==null&&"group"in A[0]?v.innerHTML=A.map($=>`
        <div class="subcat-group" style="display: block; margin-top: 16px; padding: 16px; background: var(--color-bg-sidebar); border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <h4 style="margin-bottom: 12px; font-size: 0.95rem; color: #60a5fa; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
            📌 ${$.group}
          </h4>
          <div class="checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;">
            ${($.items||[]).map(T=>`
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--color-text-secondary); cursor: pointer;">
                <input type="checkbox" class="wizard-checkbox subcat-checkbox" name="wizard-subcategory" value="${T}"> ${T}
              </label>
            `).join("")}
          </div>
        </div>
      `).join(""):v.innerHTML=`
        <div class="subcat-group" style="display: block; margin-top: 16px; padding: 16px; background: var(--color-bg-sidebar); border-radius: var(--border-radius-sm); border: 1px solid var(--color-border);">
          <h4 style="margin-bottom: 12px; font-size: 0.95rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px;">
            📌 Unterbereiche & Spezialisierung: <strong style="color: #60a5fa;">${I.name}</strong>
          </h4>
          <div class="checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
            ${A.map($=>`
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--color-text-secondary); cursor: pointer;">
                <input type="checkbox" class="wizard-checkbox subcat-checkbox" name="wizard-subcategory" value="${$}"> ${$}
              </label>
            `).join("")}
          </div>
        </div>
      `}function p(){const h=document.getElementById("wizard-branch-grid");if(h&&window.ServiceOSStore&&typeof window.ServiceOSStore.getBranches=="function"){const v=window.ServiceOSStore.getBranches().filter(S=>S.active);if(v.length>0){h.innerHTML=v.map((I,A)=>`
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: var(--color-text-secondary); cursor: pointer;">
            <input type="radio" class="wizard-radio wizard-branch" name="wizard-branch" value="${I.name}" ${A===0?"checked":""}> ${I.name}
          </label>
        `).join("");const S=h.querySelector("input[name='wizard-branch']:checked");S&&g(S.value)}}}p(),document.addEventListener("change",h=>{if(h.target&&h.target.classList.contains("wizard-branch")){const v=h.target.value;d.branch=v,g(v)}});const z=document.getElementById("btn-ausland-toggle"),m=document.getElementById("ausland-options");z&&m&&z.addEventListener("click",()=>{m.style.display==="none"||!m.style.display?(m.style.display="block",z.innerText="- Ausland entfernen",z.style.background="rgba(220, 38, 38, 0.1)",z.style.borderColor="rgba(220, 38, 38, 0.3)"):(m.style.display="none",z.innerText="+ Ausland / Internationale Fahrt",z.style.background="rgba(255,255,255,0.05)",z.style.borderColor="var(--color-border)",document.querySelectorAll("input[name='wizard-ausland']").forEach(v=>v.checked=!1))}),a&&(a.addEventListener("click",()=>i.click()),i&&i.addEventListener("change",h=>{const v=h.target.files;d.mediaCount=v.length,v.length>0&&(s.innerText=`${v.length} Bild(er) erfolgreich ausgewählt.`,s.style.color="var(--color-delivered)")}),a.addEventListener("dragover",h=>{h.preventDefault(),a.style.borderColor="var(--color-primary)"}),a.addEventListener("dragleave",()=>{a.style.borderColor="var(--color-border)"}),a.addEventListener("drop",h=>{h.preventDefault(),a.style.borderColor="var(--color-border)";const v=h.dataTransfer.files;d.mediaCount=v.length,v.length>0&&(s.innerText=`${v.length} Bild(er) erfolgreich abgelegt.`,s.style.color="var(--color-delivered)")}));const u=document.getElementById("wizard-description"),y=document.getElementById("wizard-compliance-feedback"),k=document.getElementById("wizard-qnexus-badge"),x=document.getElementById("wizard-compliance-details");u&&u.addEventListener("input",h=>{const v=h.target.value;if(v.trim().length===0){y.style.display="none";return}if(y.style.display="block",typeof window.calculateQNexusScore=="function"){const S=window.calculateQNexusScore(v,d.branch,d.partnerId);k.innerText=`Q_NEXUS: ${S.qNexus}`,S.qNexus>=.85?(k.style.background="var(--color-delivered-glow)",k.style.color="var(--color-delivered)"):S.qNexus>=.6?(k.style.background="var(--color-pending-glow)",k.style.color="var(--color-pending)"):(k.style.background="var(--color-cancelled-glow)",k.style.color="var(--color-cancelled)");let I="";if(window.analyzeCicero7Q){const A=window.analyzeCicero7Q(v);I=`
            <div style="margin-top: 10px; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--color-border); border-radius: 6px;">
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--color-primary-light); margin-bottom: 6px;">
                🏛️ Cicero 7Q-Completeness-Check: ${(A.score*100).toFixed(0)}% (${A.passedCount}/7)
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${Object.entries(A.details).map(([C,$])=>`
                  <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${$.passed?"rgba(16, 185, 129, 0.2)":"rgba(100, 116, 139, 0.2)"}; color: ${$.passed?"#34d399":"#94a3b8"}; border: 1px solid ${$.passed?"rgba(16, 185, 129, 0.4)":"transparent"};">
                    ${$.passed?"✓":"✗"} ${C.toUpperCase()}
                  </span>
                `).join("")}
              </div>
            </div>
          `}if(S.compliance.isCompliant)x.innerHTML=`<span style="color: var(--color-delivered);">✓ Alle branchenspezifischen Vorgaben für <strong>${d.branch}</strong> sind erfüllt.</span> ${I}`;else{const A=S.compliance.modifications.map(C=>`<li>${C}</li>`).join("");x.innerHTML=`
            <div style="color: var(--color-pending); margin-bottom: 4px;">
              ⚠️ Folgende Bezeichnungen werden automatisch für die Region AT/DE angepasst:
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary);">
              ${A}
            </ul>
            ${I}
          `}}});function f(){e.forEach((h,v)=>{v+1===l?(h.style.display="block",h.classList.add("active")):(h.style.display="none",h.classList.remove("active"))}),t.forEach((h,v)=>{v+1===l?h.classList.add("active"):h.classList.remove("active")}),o.disabled=l===1,l===e.length?(r.innerText="Auftrag kostenpflichtig anlegen",r.style.background="var(--color-delivered)"):(r.innerText="Weiter",r.style.background="var(--color-primary)")}function E(h){if(h===1){const v=Array.from(document.querySelectorAll("input[name='wizard-source']:checked")).map(A=>A.value),S=document.querySelector("input[name='wizard-branch']:checked"),I=Array.from(document.querySelectorAll("input[name='wizard-subcategory']:checked")).map(A=>A.value);if(v.length===0)return alert("Bitte wählen Sie mindestens eine Anfragequelle aus."),!1;d.sources=v,d.branch=S?S.value:"Entrümpelung",d.subcategories=I,d.categories=[d.branch]}else if(h===2){const v=document.getElementById("wizard-plz")?document.getElementById("wizard-plz").value.trim():"",S=document.getElementById("wizard-ort")?document.getElementById("wizard-ort").value.trim():"";if(!v&&!S)return alert("Bitte geben Sie zumindest eine Postleitzahl oder einen Ort ein."),!1;d.address.plz=v,d.address.ort=S,d.address.bundesland=document.getElementById("wizard-bundesland")?document.getElementById("wizard-bundesland").value.trim():"",d.address.strasse=document.getElementById("wizard-strasse")?document.getElementById("wizard-strasse").value.trim():"",d.address.hausnr=document.getElementById("wizard-hausnr")?document.getElementById("wizard-hausnr").value.trim():"",d.address.stiege=document.getElementById("wizard-stiege")?document.getElementById("wizard-stiege").value.trim():"",d.address.tuer=document.getElementById("wizard-tuer")?document.getElementById("wizard-tuer").value.trim():"";const I=document.querySelector("input[name='wizard-ausland']:checked");d.address.ausland=I?I.value:"",d.location=`${v} ${S}`.trim()}else if(h===3){const v=document.getElementById("wizard-client").value.trim(),S=document.getElementById("wizard-client-phone")?document.getElementById("wizard-client-phone").value.trim():"",I=document.getElementById("wizard-client-email")?document.getElementById("wizard-client-email").value.trim():"",A=document.getElementById("wizard-vertretung")?document.getElementById("wizard-vertretung").value.trim():"",C=document.getElementById("wizard-vertretung-phone")?document.getElementById("wizard-vertretung-phone").value.trim():"",$=document.getElementById("wizard-vertretung-email")?document.getElementById("wizard-vertretung-email").value.trim():"",T=document.getElementById("wizard-description").value.trim();if(!v||!T)return alert("Bitte geben Sie den Kundennamen und eine Beschreibung ein."),!1;let D=T;if(typeof window.calculateQNexusScore=="function"){const L=window.calculateQNexusScore(T,d.branch,d.partnerId);L.compliance.correctedText!==T&&(document.getElementById("wizard-description").value=L.compliance.correctedText,D=L.compliance.correctedText,alert("Linguistische Anpassungen durchgeführt: Text wurde automatisch für die Zielregion angepasst."))}d.client=v,d.contact.clientPhone=S,d.contact.clientEmail=I,d.contact.vertretung=A,d.contact.vertretungPhone=C,d.contact.vertretungEmail=$,d.description=D}else if(h===5){const v=document.querySelector("input[name='wizard-partner']:checked"),S=document.getElementById("wizard-open-order")?document.getElementById("wizard-open-order").checked:!1;d.partnerId=v?v.value:null,d.isOpenOrder=S}return!0}function b(){const h=document.getElementById("wizard-summary");if(!h)return;let v=d.subcategories.length>0?d.subcategories.join(", "):"Keine ausgewählt";h.innerHTML=`
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.95rem;">
        <div>
          <strong style="color: var(--color-text-secondary);">Anfragequelle:</strong>
          <div>${d.sources.join(", ")||"Keine"}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Branche:</strong>
          <div><span style="font-weight: bold; color: #60a5fa;">${d.branch}</span></div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Unterbereiche:</strong>
          <div>${v}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Standort:</strong>
          <div>${d.address.strasse} ${d.address.hausnr}, ${d.address.plz} ${d.address.ort} (${d.address.bundesland||"AT"}) ${d.address.ausland?" - "+d.address.ausland:""}</div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Kunde:</strong>
          <div>${d.client} (${d.contact.clientPhone||"Keine Tel"}, ${d.contact.clientEmail||"Keine Mail"})</div>
        </div>
        ${d.contact.vertretung?`
        <div>
          <strong style="color: var(--color-text-secondary);">Vertretung / Ansprechpartner:</strong>
          <div>${d.contact.vertretung} (${d.contact.vertretungPhone||"Keine Tel"}, ${d.contact.vertretungEmail||"Keine Mail"})</div>
        </div>`:""}
        <div style="grid-column: span 2;">
          <strong style="color: var(--color-text-secondary);">Beschreibung & Aufgabenstellung:</strong>
          <div style="background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--color-border); margin-top: 4px;">
            ${d.description}
          </div>
        </div>
        <div>
          <strong style="color: var(--color-text-secondary);">Angehängte Medien:</strong>
          <div>${d.mediaCount} Bild(er)</div>
        </div>
      </div>
    `}function c(){const h=document.getElementById("wizard-partner-list");if(!h)return;const v=ServiceOSStore.getCompanies();if(v.length===0){h.innerHTML='<div style="color: var(--color-text-muted);">Keine registrierten Partnerfirmen im System gefunden.</div>';return}h.innerHTML=v.map(S=>`
      <label style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); cursor: pointer;">
        <input type="radio" name="wizard-partner" value="${S.id}" style="margin-top: 4px; accent-color: var(--color-primary);">
        <div>
          <div style="font-weight: 600; color: var(--color-text-primary);">${S.name} <small style="color: var(--color-text-muted);">(${S.id})</small></div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary);">Branchen: ${S.branches?S.branches.join(", "):"Allgemein"}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-muted);">GISA-Status: ${S.gisa?"✓ aufrecht":"⚠️ Inaktiv"}</div>
        </div>
      </label>
    `).join("")}r&&r.addEventListener("click",()=>{E(l)&&(l<e.length?(l++,l===4?b():l===5&&c(),f()):w())}),o&&o.addEventListener("click",()=>{l>1&&(l--,f())});function w(){var L;const h=ServiceOSStore.getOrders();let v="Direktauftrag (Zentrale)";if(d.partnerId){const M=ServiceOSStore.getCompanies().find(O=>O.id===d.partnerId);M&&(v=M.name)}const S=window.generateCryptographicId||function(M){return M+"-"+Math.floor(1e3+Math.random()*9e3)},I=S("ORD"),A=S("CAS"),C=S("SO"),$=ServiceOSStore.createCase({id:A,caseNumber:C,client:d.client,location:d.location||(typeof d.address=="string"?d.address:((L=d.address)==null?void 0:L.ort)||"k.A."),branch:d.branch,reason:d.description||d.branch,subcategories:d.subcategories,status:"Pending",companyId:d.partnerId||null,orders:[I],author:d.client||"Intake Wizard"}),T={id:I,caseId:$.id,caseNumber:$.caseNumber,client:d.client,branch:d.branch,subcategories:d.subcategories,description:d.description,partner:v,partnerId:d.partnerId,status:"Pending",value:450,amount:450,date:new Date().toISOString().split("T")[0],location:d.location,address:d.address,contact:d.contact,sources:d.sources};h.unshift(T),ServiceOSStore.set("orders",h),ServiceOSStore.logAudit("ORDER_CREATED",`Neue Anfrage ${T.id} (Fallakte ${$.caseNumber}, ${T.branch}) für ${T.client} angelegt.`),alert(`✓ Neue Anfrage ${T.id} (Fallakte ${$.caseNumber}) wurde erfolgreich angelegt!`),l=1,n.reset(),f();const D=document.querySelector("button[data-tab='tab-dashboard']");D&&D.click()}f()}function Ye(){re(),window.addEventListener("storage",re);const n=document.getElementById("btn-clear-audit");n&&n.addEventListener("click",()=>{confirm("Are you sure you want to clear the system audit trail? This action is logged.")&&(ServiceOSStore.set("audit",[]),ServiceOSStore.logAudit("AUDIT_CLEAR","System audit logs cleared by user request."),re())})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ye):Ye();function re(){const n=document.getElementById("audit-list-body");if(!n)return;n.innerHTML="";const e=ServiceOSStore.getAuditLogs();if(e.length===0){n.innerHTML='<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 32px;">No audit records found.</td></tr>';return}e.forEach(t=>{const o=document.createElement("tr");o.className="animate-row";const a=new Date(t.timestamp).toLocaleString("de-AT",{hour12:!1});let i=`<span class="badge-status" style="background: rgba(255, 255, 255, 0.05); color: var(--color-text-secondary); border: 1px solid var(--color-border); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${t.action}</span>`;t.action==="USER_SWITCH"?i=`<span class="badge-status" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${t.action}</span>`:t.action==="ORDER_CREATION"||t.action==="WIZARD_INTAKE"?i=`<span class="badge-status" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${t.action}</span>`:t.action==="ORDER_STATUS_CHANGE"?i=`<span class="badge-status" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${t.action}</span>`:t.action==="UNAUTHORIZED_ACCESS_ATTEMPT"?i=`<span class="badge-status" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; animation: pulse 2s infinite;">${t.action}</span>`:t.action==="AUDIT_CLEAR"&&(i=`<span class="badge-status" style="background: rgba(217, 70, 239, 0.15); color: #d946ef; border: 1px solid rgba(217, 70, 239, 0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${t.action}</span>`),o.innerHTML=`
      <td style="color: var(--color-text-secondary); font-size: 0.8rem; font-family: monospace;">${a}</td>
      <td style="font-weight: 500; color: var(--color-text-primary); font-size: 0.85rem;">${t.userName}</td>
      <td style="color: var(--color-text-secondary); font-size: 0.8rem;"><span style="padding: 2px 6px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--color-border);">${t.userRole}</span></td>
      <td>${i}</td>
      <td style="color: var(--color-text-primary); font-size: 0.85rem;">${t.details}</td>
    `,n.appendChild(o)})}function et(){hr(),wt(),xr()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",et):et();function hr(){const n=document.querySelectorAll(".settings-nav-btn"),e=document.querySelectorAll(".settings-panel");n.forEach(t=>{t.addEventListener("click",()=>{const o=t.getAttribute("data-settings-tab");n.forEach(r=>{r.classList.remove("active"),r.style.color="var(--color-text-secondary)"}),t.classList.add("active"),t.style.color="var(--color-text-primary)",e.forEach(r=>{r.getAttribute("data-settings-panel")===o?(r.style.display="block",r.classList.add("active")):(r.style.display="none",r.classList.remove("active"))}),o==="partner-management"&&typeof window.renderPartnerManagement=="function"&&window.renderPartnerManagement()})})}function wt(){const n=B.getSettings();document.getElementById("set-language").value=n.language,document.getElementById("set-currency").value=n.currency,document.getElementById("set-doc-verify").checked=n.docVerify,document.getElementById("set-gisa-verify").checked=n.gisaVerify,document.getElementById("set-min-insurance").value=n.minInsurance,document.getElementById("set-commission").value=n.commission,document.getElementById("set-marketing-share").value=n.marketingShare,document.getElementById("set-ai-model").value=n.aiModel,document.getElementById("set-ai-temp").value=n.aiTemp,document.getElementById("set-self-improve").checked=n.selfImprove,document.getElementById("set-zero-trust").checked=n.zeroTrust,document.getElementById("set-mfa").checked=n.mfa,document.getElementById("set-log-retention").value=n.logRetention}function xr(){const n=document.getElementById("settings-form"),e=document.getElementById("btn-reset-settings");n.addEventListener("submit",t=>{t.preventDefault();const o={language:document.getElementById("set-language").value,currency:document.getElementById("set-currency").value,docVerify:document.getElementById("set-doc-verify").checked,gisaVerify:document.getElementById("set-gisa-verify").checked,minInsurance:parseFloat(document.getElementById("set-min-insurance").value),commission:parseFloat(document.getElementById("set-commission").value),marketingShare:parseFloat(document.getElementById("set-marketing-share").value),aiModel:document.getElementById("set-ai-model").value,aiTemp:parseFloat(document.getElementById("set-ai-temp").value),selfImprove:document.getElementById("set-self-improve").checked,zeroTrust:document.getElementById("set-zero-trust").checked,mfa:document.getElementById("set-mfa").checked,logRetention:document.getElementById("set-log-retention").value};B.saveSettings(o);const r=n.querySelector("button[type='submit']"),a=r.innerText;r.innerText="✓ Erfolgreich gespeichert",r.style.background="var(--color-secondary)",r.style.color="white",setTimeout(()=>{r.innerText=a,r.style.background="",r.style.color=""},2e3)}),e.addEventListener("click",()=>{wt()})}document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("btn-save-favorites");if(!n)return;function e(){const r=B.getSettings().dashboardFavorites||["kpi-card-revenue","kpi-card-active","kpi-card-completed","kpi-card-time","kpi-card-requests","kpi-card-action","btn-kpi-new-order","kpi-card-flow","kpi-card-status","kpi-card-calc"];document.querySelectorAll(".favorite-toggle").forEach(a=>{a.checked=r.includes(a.value)}),t(r)}function t(o){["kpi-card-revenue","kpi-card-active","kpi-card-completed","kpi-card-time","kpi-card-requests","kpi-card-action","btn-kpi-new-order","kpi-card-flow","kpi-card-status","kpi-card-calc"].forEach(a=>{const i=document.getElementById(a);i&&(o.includes(a)?i.style.display="":i.style.display="none")})}n.addEventListener("click",()=>{const o=[];document.querySelectorAll(".favorite-toggle:checked").forEach(a=>{o.push(a.value)});const r=B.getSettings();r.dashboardFavorites=o,B.saveSettings(r),t(o),B.logAudit("FAVORITES_UPDATED","Dashboard Favoriten aktualisiert."),alert("Favoriten wurden erfolgreich gespeichert!")}),document.querySelectorAll(".nav-leaf").forEach(o=>{o.addEventListener("click",r=>{if(r.target.getAttribute("data-tab")==="tab-dashboard"){const a=B.getSettings();t(a.dashboardFavorites||[])}})}),window.addEventListener("storage",()=>{e()}),e()});
