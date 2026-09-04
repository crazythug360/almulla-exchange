const LOCATIONS = [
  { id: "souq-sharq", type: "branch", name: "Souq Sharq", area: "Kuwait City", address: "Arabian Gulf Street, Shop 29, Souq Sharq Mall", hours: "8:00 AM – 9:30 PM", phone: "+965 5145 5733", lat: 29.3874, lng: 47.9986 },
  { id: "mubarakiya", type: "branch", name: "Mubarakiya", area: "Qibla", address: "Ahmad Al Jaber Street, Block 8, Building 53, Shop 5–7", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0443", lat: 29.3756, lng: 47.9738 },
  { id: "watiya", type: "branch", name: "Watiya", area: "Kuwait City", address: "Fahad Al Salem Street, Block 13, Burgan Bank Building", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0444", lat: 29.3752, lng: 47.9784 },
  { id: "qibla", type: "branch", name: "Qibla", area: "Kuwait City", address: "Block 13, Fahad Al Salem St., Building G27, Shop 7", hours: "8:00 AM – 9:30 PM", phone: "+965 1840 123", lat: 29.3728, lng: 47.9761 },
  { id: "shuwaikh", type: "branch", name: "Shuwaikh", area: "Shuwaikh", address: "Alzima Street, Shop 18, Ground Floor, Panda Mall", hours: "8:00 AM – 9:30 PM", phone: "+965 9559 2685", lat: 29.3408, lng: 47.9304 },
  { id: "al-rai", type: "branch", name: "Al Rai", area: "Al Rai", address: "Street 28, Block 3, Sky Bros Complex, Shop 1", hours: "8:00 AM – 9:30 PM", phone: "+965 9091 0040", lat: 29.3058, lng: 47.9392 },
  { id: "avenues", type: "branch", name: "The Avenues", area: "Al Rai", address: "Avenues Mall, Phase 4, Al Rai", hours: "8:00 AM – 8:00 PM", phone: "+965 5083 9989", lat: 29.3031, lng: 47.9366 },
  { id: "salmiya-amman", type: "branch", name: "Salmiya — Amman Street", area: "Salmiya", address: "Amman Street, Block 10, Building 10", hours: "8:00 AM – 9:30 PM", phone: "+965 5561 2892", lat: 29.3336, lng: 48.0764 },
  { id: "salmiya-salem", type: "branch", name: "Salmiya — Salem Al Mubarak", area: "Salmiya", address: "Salem Al Mubarak Street, Block 4, Kit Kat Building", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0456", lat: 29.3391, lng: 48.0712 },
  { id: "hawally-beirut", type: "branch", name: "Hawally — Beirut Street", area: "Hawally", address: "Beirut Street, 128 St, Block 8, Shop 3, Building 9", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0445", lat: 29.3378, lng: 48.0286 },
  { id: "hawally-ibn", type: "branch", name: "Hawally — Ibn Khaldoun", area: "Hawally", address: "Ibn Khaldoun Street, Block 2, Al Mulla Commercial Complex", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0446", lat: 29.3324, lng: 48.0261 },
  { id: "jabriya", type: "branch", name: "Jabriya", area: "Jabriya", address: "Street 7, Block 3B, Building 39, Ground Floor, Shop 1", hours: "8:00 AM – 9:30 PM", phone: "+965 9800 3290", lat: 29.3164, lng: 48.0282 },
  { id: "salwa", type: "branch", name: "Salwa", area: "Salwa", address: "Street 2, Block 1, Shop 2", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0466", lat: 29.2958, lng: 48.0794 },
  { id: "mishref", type: "branch", name: "Mishref", area: "Mishref", address: "Street 321, Block 6, Shop 50, Mubarak Al Abdullah Co-op", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0417", lat: 29.2762, lng: 48.0751 },
  { id: "farwaniya", type: "branch", name: "Farwaniya", area: "Farwaniya", address: "Al Jordan Street, Block 1, Building 170", hours: "8:00 AM – 9:30 PM", phone: "+965 9800 3276", lat: 29.2774, lng: 47.9586 },
  { id: "khaitan", type: "branch", name: "Khaitan — Sama Complex", area: "Khaitan", address: "Street 24, Block 9, Shop 20, Sama Complex", hours: "8:00 AM – 9:30 PM", phone: "+965 5565 9752", lat: 29.2912, lng: 47.9954 },
  { id: "jleeb", type: "branch", name: "Jleeb Al-Shuyoukh", area: "Jleeb", address: "Street 160, Block 3, Basman Commercial Complex, Shop 25–26", hours: "8:00 AM – 9:30 PM", phone: "+965 9800 3275", lat: 29.2571, lng: 47.9284 },
  { id: "sabah-salem", type: "branch", name: "Sabah Al Salem", area: "Mubarak Al Kabeer", address: "Street 300, Block 3, Building 11", hours: "8:00 AM – 9:30 PM", phone: "+965 5255 3724", lat: 29.2578, lng: 48.0572 },
  { id: "qurain", type: "branch", name: "Qurain", area: "Mubarak Al Kabeer", address: "Street 21, Block 1, Aswaq Al Qurain, Shop Q-2", hours: "8:00 AM – 9:30 PM", phone: "+965 5593 4887", lat: 29.2034, lng: 48.0756 },
  { id: "fintas", type: "branch", name: "Fintas", area: "Ahmadi", address: "Street 1, Block 1, Building 162", hours: "8:00 AM – 9:30 PM", phone: "+965 9800 3282", lat: 29.1736, lng: 48.1214 },
  { id: "mahboula", type: "branch", name: "Mahboula", area: "Ahmadi", address: "Al Ranize Street, Street 10, Block 1, Building 30 & 31", hours: "8:00 AM – 9:30 PM", phone: "+965 9722 9069", lat: 29.1452, lng: 48.1306 },
  { id: "mangaf", type: "branch", name: "Mangaf", area: "Ahmadi", address: "Street 14, Block 4, Al Sayer Commercial Complex", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0463", lat: 29.0974, lng: 48.1322 },
  { id: "fahaheel", type: "branch", name: "Fahaheel — Souk Sabah", area: "Ahmadi", address: "Tarafa Bin Al Abd Street, Block 8, Building 10, Souk Sabah", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0462", lat: 29.0826, lng: 48.1308 },
  { id: "abu-halifa", type: "branch", name: "Abu Halifa", area: "Ahmadi", address: "Street 301, Block 3, Al Mutawa Building", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0440", lat: 29.1354, lng: 48.1261 },
  { id: "jahra", type: "branch", name: "Jahra", area: "Jahra", address: "Daabal Al Khuzaei Street, Block 3, Building 3", hours: "8:00 AM – 9:30 PM", phone: "+965 5178 0437", lat: 29.3372, lng: 47.6584 },
  { id: "jahra-oyoun", type: "branch", name: "Jahra Oyoun", area: "Jahra", address: "Street 104, Block 4, Shop 5, Oyoun Co-operative Society", hours: "8:00 AM – 9:30 PM", phone: "+965 5668 1590", lat: 29.3486, lng: 47.6772 },
  { id: "sulaibiya", type: "branch", name: "Sulaibiya", area: "Jahra", address: "Sulaibiya Fruit and Vegetable Market, Ground Floor, Shop 1", hours: "8:00 AM – 8:00 PM", phone: "+965 5597 0227", lat: 29.2864, lng: 47.8248 },
  { id: "kiosk-tsc-salmiya", type: "kiosk", name: "TSC Boulevard Salmiya", area: "Salmiya", address: "Qatar Street, Street 113, Boulevard Mall, Sultan Center", hours: "9:00 AM – 8:00 PM", phone: "+965 5154 4341", lat: 29.3348, lng: 48.0791 },
  { id: "kiosk-tsc-dajeej", type: "kiosk", name: "TSC Dajeej", area: "Farwaniya", address: "Airport Road, 6th Ring Road, Sultan Center Al-Dajeej", hours: "9:00 AM – 8:00 PM", phone: "+965 5166 4311", lat: 29.2611, lng: 47.9658 },
  { id: "kiosk-tsc-fahaheel", type: "kiosk", name: "TSC Fahaheel", area: "Ahmadi", address: "Sultan Center Fahaheel, Fahaheel", hours: "9:00 AM – 8:00 PM", phone: "+965 1840 123", lat: 29.0892, lng: 48.1336 },
  { id: "kiosk-avenues", type: "kiosk", name: "Avenues Kiosk", area: "Al Rai", address: "The Avenues Mall, Grand Avenue", hours: "9:00 AM – 8:00 PM", phone: "+965 5083 9989", lat: 29.3018, lng: 47.9408 },
  { id: "kiosk-360", type: "kiosk", name: "360 Mall Kiosk", area: "South Surra", address: "360 Mall, 6th Ring Road, South Surra", hours: "9:00 AM – 8:00 PM", phone: "+965 1840 123", lat: 29.2686, lng: 47.9924 },
  { id: "kiosk-city-centre", type: "kiosk", name: "City Centre Kiosk", area: "Sharq", address: "City Centre Kuwait, Sharq", hours: "9:00 AM – 8:00 PM", phone: "+965 1840 123", lat: 29.3788, lng: 47.9902 },
];


const mapEl = document.getElementById("branchMap");
const pinsEl = document.getElementById("mapPins");
const mapFrame = document.querySelector(".branches-map");
const listEl = document.getElementById("branchList");
const detailEl = document.getElementById("branchDetail");
const countEl = document.getElementById("branchCount");
const searchEl = document.getElementById("branchSearch");
let activeId = LOCATIONS[0].id;
let filterType = "all";
let query = "";
let mapView = null;

function dict() {
  return window.copy?.[document.documentElement.lang === "ar" ? "ar" : "en"] || {
    branch: "Branch",
    kiosk: "Kiosk",
    hours: "Working hours",
    address: "Address",
    phone: "Phone",
    directions: "Get directions",
    noBranchMatch: "No locations match your search.",
    selectLocation: "Select a location to see hours and address.",
    locationsCount: "locations",
    showAllMap: "Show all",
  };
}

function pinSvg(type) {
  return `<svg class="map-pin map-pin--${type}" viewBox="0 0 24 36" aria-hidden="true"><path d="M12 1.2C6.15 1.2 1.4 6 1.4 11.9c0 8.4 10.6 22.5 10.6 22.5S22.6 20.3 22.6 11.9C22.6 6 17.85 1.2 12 1.2z"/><circle cx="12" cy="12" r="4.2" fill="#fff"/></svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}

function telHref(phone) {
  return `tel:${String(phone).replace(/\s/g, "")}`;
}

function pinPopup(place) {
  const t = dict();
  const typeLabel = place.type === "kiosk" ? t.kiosk : t.branch;
  return `<div class="map-popup map-pin-popup" role="dialog">
      <span class="branch-type branch-type--${place.type}">${escapeHtml(typeLabel)}</span>
      <strong>${escapeHtml(place.name)}</strong>
      <p class="map-popup__address">${escapeHtml(place.address)}</p>
      <a class="map-popup__phone" href="${telHref(place.phone)}">${escapeHtml(place.phone)}</a>
      <a class="map-popup__directions" href="${directionsUrl(place)}" target="_blank" rel="noopener">${escapeHtml(t.directions)}</a>
    </div>`;
}

function popupAlign(left, top) {
  let extra = "";
  if (left > 72) extra += " is-left";
  else if (left < 28) extra += " is-right";
  if (top < 38) extra += " is-below";
  return extra;
}

function mapLang() {
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

function mapSize() {
  const box = mapFrame?.getBoundingClientRect();
  return { width: Math.max(1, box?.width || 800), height: Math.max(1, box?.height || 500) };
}

function worldSize(zoom) {
  return 256 * 2 ** zoom;
}

function lngToX(lng, world) {
  return ((lng + 180) / 360) * world;
}

function latToY(lat, world) {
  const s = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  return y * world;
}

function computeView() {
  const { width, height } = mapSize();
  const pts = visiblePlaces();
  const pool = pts.length ? pts : LOCATIONS;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  pool.forEach((place) => {
    minLat = Math.min(minLat, place.lat);
    maxLat = Math.max(maxLat, place.lat);
    minLng = Math.min(minLng, place.lng);
    maxLng = Math.max(maxLng, place.lng);
  });
  const center = { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  const pad = 72;
  let zoom = 9;
  for (let z = 13; z >= 8; z -= 1) {
    const world = worldSize(z);
    const dx = Math.abs(lngToX(maxLng, world) - lngToX(minLng, world));
    const dy = Math.abs(latToY(maxLat, world) - latToY(minLat, world));
    zoom = z;
    if (dx + pad * 2 <= width && dy + pad * 2 <= height) break;
  }
  return { center, zoom, width, height };
}

function overviewSrc(view) {
  return `https://maps.google.com/maps?ll=${view.center.lat.toFixed(5)},${view.center.lng.toFixed(5)}&z=${view.zoom}&hl=${mapLang()}&t=m&output=embed`;
}

function pinStyle(place, view) {
  const world = worldSize(view.zoom);
  const x = lngToX(place.lng, world) - lngToX(view.center.lng, world) + view.width / 2;
  const y = latToY(place.lat, world) - latToY(view.center.lat, world) + view.height / 2;
  const left = (x / view.width) * 100;
  const top = (y / view.height) * 100;
  return { css: `left:${left}%;top:${top}%`, left, top };
}

function matches(place) {
  if (filterType !== "all" && place.type !== filterType) return false;
  if (!query) return true;
  const hay = `${place.name} ${place.area} ${place.address} ${place.type}`.toLowerCase();
  return hay.includes(query);
}

function visiblePlaces() {
  return LOCATIONS.filter(matches);
}

function updateMap() {
  if (!mapEl) return;
  mapView = computeView();
  const next = overviewSrc(mapView);
  if (mapEl.getAttribute("src") !== next) mapEl.src = next;
}

function renderPins() {
  if (!pinsEl) return;
  const places = visiblePlaces();
  const view = mapView || computeView();
  pinsEl.classList.add("is-overview");
  pinsEl.innerHTML = places.map((place) => {
    const pos = pinStyle(place, view);
    const on = place.id === activeId;
    const label = `${place.name}. ${place.address}. ${place.phone}`;
    return `<div class="map-pin-wrap${on ? " is-on" : ""}${on ? popupAlign(pos.left, pos.top) : ""}" data-id="${place.id}" style="${pos.css}">
      <button type="button" class="map-pin-btn" aria-label="${escapeHtml(label)}">${pinSvg(place.type)}</button>
      ${on ? pinPopup(place) : ""}
    </div>`;
  }).join("");
}

function renderDetail(place) {
  const t = dict();
  const typeLabel = place.type === "kiosk" ? t.kiosk : t.branch;
  detailEl.innerHTML = `
    <div class="branch-card__head">
      <span class="branch-type branch-type--${place.type}">${typeLabel}</span>
      <h2>${escapeHtml(place.name)}</h2>
      <p>${escapeHtml(place.area)}</p>
    </div>
    <dl class="branch-meta">
      <div>
        <dt>${t.address}</dt>
        <dd>${escapeHtml(place.address)}</dd>
      </div>
      <div>
        <dt>${t.hours}</dt>
        <dd>${escapeHtml(place.hours)}</dd>
      </div>
      <div>
        <dt>${t.phone}</dt>
        <dd><a href="${telHref(place.phone)}">${escapeHtml(place.phone)}</a></dd>
      </div>
    </dl>
    <a class="branch-directions" href="${directionsUrl(place)}" target="_blank" rel="noopener">${t.directions}</a>
  `;
}

function renderList() {
  const t = dict();
  const places = visiblePlaces();
  countEl.textContent = `${places.length} ${t.locationsCount}`;
  if (!places.length) {
    listEl.innerHTML = `<li class="branch-empty">${t.noBranchMatch}</li>`;
    return;
  }
  listEl.innerHTML = places.map((place) => {
    return `<li>
      <button class="branch-row${place.id === activeId ? " is-on" : ""}" type="button" data-id="${place.id}">
        ${pinSvg(place.type)}
        <span>
          <strong>${escapeHtml(place.name)}</strong>
          <small>${escapeHtml(place.address)}</small>
        </span>
      </button>
    </li>`;
  }).join("");
}

function selectPlace(id) {
  const place = LOCATIONS.find((item) => item.id === id);
  if (!place) return;
  const same = activeId === id;
  activeId = id;
  renderList();
  renderDetail(place);
  renderPins();
  if (!same) {
    listEl.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ block: "nearest" });
  }
}

function refresh(keepPlace) {
  const places = visiblePlaces();
  updateMap();
  renderList();
  renderPins();
  if (!places.length) return;
  if (!keepPlace || !places.some((place) => place.id === activeId)) {
    selectPlace(places[0].id);
  } else {
    renderDetail(LOCATIONS.find((place) => place.id === activeId));
  }
}

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (btn) selectPlace(btn.dataset.id);
});

pinsEl?.addEventListener("click", (e) => {
  if (e.target.closest("a")) return;
  const wrap = e.target.closest("[data-id]");
  if (wrap) selectPlace(wrap.dataset.id);
});

searchEl.addEventListener("input", () => {
  query = searchEl.value.trim().toLowerCase();
  refresh(true);
});

document.querySelectorAll(".branches-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    filterType = chip.dataset.filter;
    document.querySelectorAll(".branches-chip").forEach((btn) => {
      btn.classList.toggle("is-on", btn === chip);
    });
    refresh(true);
  });
});

document.addEventListener("ame:lang", () => {
  const place = LOCATIONS.find((item) => item.id === activeId);
  renderList();
  renderPins();
  if (place) {
    renderDetail(place);
    updateMap();
  }
});

if (typeof ResizeObserver !== "undefined" && mapFrame) {
  let resizeTimer = 0;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      updateMap();
      renderPins();
    }, 160);
  });
  observer.observe(mapFrame);
}

renderList();
renderDetail(LOCATIONS[0]);
updateMap();
renderPins();
