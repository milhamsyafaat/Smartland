// ================================================
// SMARTLAND v2 — Main Application Script (Leaflet + OSM)
// ================================================

const APP_STATE = {
  currentPage: 'home',
  map: null,
  mapMode: 'browse',
  measurementPoints: [],
  measurementLayer: null,
  searchMarker: null,
  isMobileMenuOpen: false,
  historyData: [],
};

// ================================================
// INITIALIZATION
// ================================================

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  updateActiveNavLink();
  loadHistory();

  var path = window.location.pathname;

  if (path.includes('ukur')) {
    setTimeout(function () { initMap(); }, 200);
    initMeasurementPanel();
  }

  initModalHandlers();
});

// ================================================
// NAVIGATION & ROUTING
// ================================================

function initNavigation() {
  var mt = document.getElementById('menu-toggle');
  var no = document.getElementById('nav-overlay');
  document.querySelectorAll('.nav-overlay-link, .navbar-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (mt) {
        APP_STATE.isMobileMenuOpen = false;
        mt.classList.remove('open');
        if (no) no.classList.remove('open');
      }
    });
  });

  updateActiveNavLink();
}

function updateActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.classList.remove('active');
    const dp = link.dataset.page;
    if ((path === '/' || path.includes('index')) && dp === 'index') link.classList.add('active');
    else if (path.includes('ukur') && dp === 'ukur') link.classList.add('active');
    else if (path.includes('laporan') && dp === 'laporan') link.classList.add('active');
    else if (path.includes('tentang') && dp === 'tentang') link.classList.add('active');
    else if (path.includes('dashboard') && dp === 'dashboard') link.classList.add('active');
    else if (path.includes('estimasi') && dp === 'estimasi') link.classList.add('active');
    else if (path.includes('alur') && dp === 'alur') link.classList.add('active');
    else if (path.includes('bisnis') && dp === 'bisnis') link.classList.add('active');
    else if (path.includes('kesimpulan') && dp === 'kesimpulan') link.classList.add('active');
    else if (path.includes('mockup') && dp === 'mockup') link.classList.add('active');
    else if (path.includes('admin') && dp === 'admin') link.classList.add('active');
  });
  document.querySelectorAll('.nav-overlay-link').forEach(link => {
    link.classList.remove('active');
    const dp = link.dataset.page;
    if ((path === '/' || path.includes('index')) && dp === 'index') link.classList.add('active');
    else if (path.includes('ukur') && dp === 'ukur') link.classList.add('active');
    else if (path.includes('laporan') && dp === 'laporan') link.classList.add('active');
    else if (path.includes('tentang') && dp === 'tentang') link.classList.add('active');
    else if (path.includes('dashboard') && dp === 'dashboard') link.classList.add('active');
    else if (path.includes('estimasi') && dp === 'estimasi') link.classList.add('active');
    else if (path.includes('alur') && dp === 'alur') link.classList.add('active');
    else if (path.includes('bisnis') && dp === 'bisnis') link.classList.add('active');
    else if (path.includes('kesimpulan') && dp === 'kesimpulan') link.classList.add('active');
    else if (path.includes('mockup') && dp === 'mockup') link.classList.add('active');
    else if (path.includes('admin') && dp === 'admin') link.classList.add('active');
  });
}

// ================================================
// LEAFLET MAP — INITIALIZATION
// ================================================

function initMap() {
  if (APP_STATE.map) return;

  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Tile alternatif (gratis, tanpa API key):
  // OpenStreetMap default: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  // CartoDB light (mirip Google): https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
  // CartoDB dark: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png

  APP_STATE.map = L.map('map', {
    center: [-2.5, 118],
    zoom: 5,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(APP_STATE.map);

  APP_STATE.measurementLayer = L.featureGroup().addTo(APP_STATE.map);

  APP_STATE.map.on('move', updateReticle);
  APP_STATE.map.on('zoom', updateReticle);
  APP_STATE.map.on('click', handleMapClick);

  updateReticle();
  activateReticle();
}

function updateReticle() {
  if (!APP_STATE.map) return;
  const center = APP_STATE.map.getCenter();
  const reticleData = document.getElementById('reticle-data');
  if (reticleData) {
    reticleData.innerHTML = `LAT: ${center.lat.toFixed(6)}<br>LNG: ${center.lng.toFixed(6)}`;
  }
}

function activateReticle() {
  const reticle = document.getElementById('reticle');
  if (reticle) {
    reticle.classList.toggle('active', APP_STATE.mapMode === 'measure');
  }
}

// ================================================
// MAP CLICK — MEASUREMENT
// ================================================

function handleMapClick(e) {
  if (APP_STATE.mapMode !== 'measure') return;
  addMeasurementPoint(e.latlng.lat, e.latlng.lng);
}

function createPointMarker(lat, lng, idx) {
  var icon = L.divIcon({
    className: 'measure-point',
    html: '<div class="measure-point-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  var marker = L.marker([lat, lng], {
    icon: icon,
    draggable: true,
  }).addTo(APP_STATE.measurementLayer);

  marker._pointIdx = idx;
  marker.bindPopup('Titik ' + (idx + 1), { closeButton: false, className: 'measure-point-popup' }).openPopup();

  marker.on('dragend', function () {
    var pos = marker.getLatLng();
    APP_STATE.measurementPoints[marker._pointIdx] = { lat: pos.lat, lng: pos.lng };
    refreshMeasurementVisuals();
  });

  return marker;
}

function addMeasurementPoint(lat, lng) {
  var idx = APP_STATE.measurementPoints.length;
  APP_STATE.measurementPoints.push({ lat, lng });

  createPointMarker(lat, lng, idx);

  if (APP_STATE.measurementPoints.length > 1) {
    var prev = APP_STATE.measurementPoints[APP_STATE.measurementPoints.length - 2];
    L.polyline([[prev.lat, prev.lng], [lat, lng]], {
      color: '#d97706',
      weight: 3,
      opacity: 0.9,
    }).addTo(APP_STATE.measurementLayer);
  }

  if (APP_STATE.measurementPoints.length >= 3) {
    redrawPolygon();
  }

  updateMeasurementInfo();
}

function refreshMeasurementVisuals() {
  if (!APP_STATE.measurementLayer) return;
  var toRemove = [];
  APP_STATE.measurementLayer.eachLayer(function (layer) {
    if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
      toRemove.push(layer);
    }
  });
  toRemove.forEach(function (layer) { APP_STATE.measurementLayer.removeLayer(layer); });

  for (var i = 1; i < APP_STATE.measurementPoints.length; i++) {
    var p = APP_STATE.measurementPoints;
    L.polyline([[p[i - 1].lat, p[i - 1].lng], [p[i].lat, p[i].lng]], {
      color: '#d97706',
      weight: 3,
      opacity: 0.9,
    }).addTo(APP_STATE.measurementLayer);
  }

  if (APP_STATE.measurementPoints.length >= 3) {
    redrawPolygon();
  }

  updateMeasurementInfo();
}

function redrawPolygon() {
  APP_STATE.measurementLayer.eachLayer(layer => {
    if (layer instanceof L.Polygon) {
      APP_STATE.measurementLayer.removeLayer(layer);
    }
  });

  const coords = APP_STATE.measurementPoints.map(p => [p.lat, p.lng]);
  L.polygon(coords, {
    color: '#16a34a',
    fillColor: '#16a34a',
    fillOpacity: 0.1,
    weight: 2,
  }).addTo(APP_STATE.measurementLayer);
}

// ================================================
// AREA & PERIMETER CALCULATION
// ================================================

function calculateArea() {
  if (APP_STATE.measurementPoints.length < 3) return { area: 0, perimeter: 0 };

  const points = APP_STATE.measurementPoints;
  let area = 0;
  let perimeter = 0;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += (p1.lng * p2.lat - p2.lng * p1.lat);
    perimeter += haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
  }

  area = Math.abs(area) / 2;
  const midLat = (points.reduce((s, p) => s + p.lat, 0) / points.length) * Math.PI / 180;
  area = area * (111320 * 111320) * Math.cos(midLat);

  return { area: Math.max(0, area), perimeter };
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// ================================================
// MEASUREMENT INFO DISPLAY
// ================================================

function updateMeasurementInfo() {
  const pointCount = document.getElementById('point-count');
  const measurementInfo = document.getElementById('measurement-info');
  const areaResult = document.getElementById('area-result');
  const completeActions = document.getElementById('complete-actions');

  if (pointCount) {
    pointCount.textContent = `${APP_STATE.measurementPoints.length} titik`;
  }
  if (measurementInfo) {
    measurementInfo.style.display = APP_STATE.measurementPoints.length > 0 ? 'block' : 'none';
  }

  if (APP_STATE.measurementPoints.length >= 3) {
    const { area, perimeter } = calculateArea();
    const areaValue = document.getElementById('area-value');
    const perimeterValue = document.getElementById('perimeter-value');
    if (areaValue) {
      areaValue.textContent = area > 10000 ? (area / 10000).toFixed(2) + ' ha' : area.toFixed(0) + ' m²';
    }
    if (perimeterValue) {
      perimeterValue.textContent = (perimeter / 1000).toFixed(2) + ' km';
    }
    if (areaResult) areaResult.style.display = 'block';
    if (completeActions) completeActions.style.display = 'flex';
  } else {
    if (areaResult) areaResult.style.display = 'none';
    if (completeActions) completeActions.style.display = 'none';
  }
}

// ================================================
// CLEAR / UNDO
// ================================================

function clearMeasurement() {
  APP_STATE.measurementPoints = [];
  if (APP_STATE.measurementLayer) {
    APP_STATE.measurementLayer.clearLayers();
  }
  updateMeasurementInfo();
}

function undoLastPoint() {
  if (APP_STATE.measurementPoints.length === 0) return;
  APP_STATE.measurementPoints.pop();
  if (APP_STATE.measurementLayer) {
    APP_STATE.measurementLayer.clearLayers();
    redrawAllPoints();
  }
  updateMeasurementInfo();
}

function redrawAllPoints() {
  APP_STATE.measurementPoints.forEach(function (point, index) {
    createPointMarker(point.lat, point.lng, index);
  });

  for (var i = 1; i < APP_STATE.measurementPoints.length; i++) {
    var p = APP_STATE.measurementPoints;
    L.polyline([[p[i - 1].lat, p[i - 1].lng], [p[i].lat, p[i].lng]], {
      color: '#d97706',
      weight: 3,
      opacity: 0.9,
    }).addTo(APP_STATE.measurementLayer);
  }

  if (APP_STATE.measurementPoints.length >= 3) {
    redrawPolygon();
  }
}

// ================================================
// MEASUREMENT PANEL (Bottom Sheet)
// ================================================

function initMeasurementPanel() {
  const modeBrowse = document.getElementById('mode-browse');
  const modeMeasure = document.getElementById('mode-measure');
  const btnUndo = document.getElementById('btn-undo');
  const btnClear = document.getElementById('btn-clear');
  const btnEstimate = document.getElementById('btn-estimate');
  const btnSave = document.getElementById('btn-save');
  const searchInput = document.getElementById('search-input');

  if (modeBrowse) {
    modeBrowse.addEventListener('click', () => {
      APP_STATE.mapMode = 'browse';
      modeBrowse.classList.add('btn-primary');
      modeBrowse.classList.remove('btn-secondary');
      modeMeasure.classList.remove('btn-primary');
      modeMeasure.classList.add('btn-secondary');
      activateReticle();
    });
  }

  if (modeMeasure) {
    modeMeasure.addEventListener('click', () => {
      APP_STATE.mapMode = 'measure';
      modeMeasure.classList.add('btn-primary');
      modeMeasure.classList.remove('btn-secondary');
      modeBrowse.classList.remove('btn-primary');
      modeBrowse.classList.add('btn-secondary');
      activateReticle();
    });
  }

  if (btnUndo) btnUndo.addEventListener('click', undoLastPoint);

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Hapus semua titik? Ini tidak bisa dibatalkan.')) clearMeasurement();
    });
  }

  if (btnEstimate) btnEstimate.addEventListener('click', openEstimateModal);

  if (btnSave) btnSave.addEventListener('click', saveMeasurement);

  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleLocationSearch, 300));
  }
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

function handleLocationSearch(e) {
  const query = e.target.value.trim();
  const searchResults = document.getElementById('search-results');
  if (query.length < 2) {
    if (searchResults) searchResults.classList.add('hidden');
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=id`)
    .then(r => r.json())
    .then(data => {
      if (!searchResults) return;
      if (data.length === 0) {
        searchResults.innerHTML = '<div style="padding: 0.75rem; font-size: 0.85rem; color: var(--text-tertiary);">Lokasi tidak ditemukan</div>';
        searchResults.classList.remove('hidden');
        return;
      }

      searchResults.innerHTML = data.map(item => `
        <div class="search-result-item" data-lat="${item.lat}" data-lng="${item.lon}" data-name="${item.display_name}" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); cursor: pointer;">
          <div style="font-size: 0.9rem; font-weight: 500;">${item.display_name.split(',')[0]}</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">${item.display_name.split(',').slice(1).join(',').trim().substring(0, 60)}</div>
        </div>
      `).join('');
      searchResults.classList.remove('hidden');

      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          if (APP_STATE.map) {
            APP_STATE.map.flyTo([lat, lng], 16);
            if (APP_STATE.searchMarker) APP_STATE.map.removeLayer(APP_STATE.searchMarker);
            APP_STATE.searchMarker = L.marker([lat, lng]).addTo(APP_STATE.map);
            e.target.value = item.dataset.name.split(',')[0];
            searchResults.classList.add('hidden');
          }
        });
      });
    })
    .catch(() => {
      if (searchResults) {
        searchResults.innerHTML = '<div style="padding: 0.75rem; color: var(--accent);">Gagal mencari lokasi</div>';
      }
    });
}

// ================================================
// ESTIMATION MODAL
// ================================================

function openEstimateModal() {
  const modal = document.getElementById('estimate-modal');
  const estimateArea = document.getElementById('estimate-area');
  const { area } = calculateArea();

  if (estimateArea) {
    estimateArea.textContent = area > 10000 ? (area / 10000).toFixed(2) + ' ha' : area.toFixed(0) + ' m²';
  }

  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeEstimateModal() {
  const modal = document.getElementById('estimate-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function initModalHandlers() {
  var closeBtn = document.getElementById('close-modal');
  var confirmBtn = document.getElementById('confirm-estimate');
  var hargaInput = document.getElementById('harga-permeter');
  var estimateValue = document.getElementById('estimate-value');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeEstimateModal);
  }

  if (hargaInput) {
    hargaInput.addEventListener('input', function () {
      var area = calculateArea().area;
      var harga = parseFloat(hargaInput.value) || 0;
      var nilai = area * harga;
      if (estimateValue) {
        estimateValue.textContent = 'Rp ' + nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 });
      }
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      closeEstimateModal();
    });
  }

  var modal = document.getElementById('estimate-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeEstimateModal();
    });
  }
}

// ================================================
// SAVE & HISTORY
// ================================================

function saveMeasurement() {
  const { area, perimeter } = calculateArea();
  const harga = parseFloat(document.getElementById('harga-permeter')?.value) || 500000;
  const nilai = area * harga;

  const measurement = {
    id: Date.now(),
    lokasi: document.getElementById('search-input')?.value || 'Lokasi Tidak Diketahui',
    luas: area,
    perimeter: perimeter,
    nilai: nilai,
    tanggal: new Date().toLocaleDateString('id-ID'),
    waktu: new Date().toLocaleTimeString('id-ID'),
    points: APP_STATE.measurementPoints.map(p => ({ ...p })),
  };

  let history = JSON.parse(localStorage.getItem('smartland_measurements') || '[]');
  history.push(measurement);
  localStorage.setItem('smartland_measurements', JSON.stringify(history));

  showToast('Pengukuran berhasil disimpan!', 'success');
  clearMeasurement();
  closeEstimateModal();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('smartland_measurements') || '[]');
  APP_STATE.historyData = history;

  const tbody = document.getElementById('reports-body');
  const emptyState = document.getElementById('empty-state');

  if (tbody) {
    if (history.length === 0) {
      const colCount = tbody.closest('table')?.querySelectorAll('thead th').length || 6;
      tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">Belum ada pengukuran. <a href="ukur.html" style="color: var(--primary); text-decoration: underline;">Mulai ukur tanah sekarang</a>.</td></tr>`;
      if (emptyState) emptyState.style.display = 'block';
    } else {
      tbody.innerHTML = [...history].reverse().map(item => `
        <tr>
          <td>${item.lokasi}</td>
          <td class="font-mono">${item.luas > 10000 ? (item.luas / 10000).toFixed(2) + ' ha' : item.luas.toFixed(0) + ' m²'}</td>
          <td class="font-mono">${(item.perimeter / 1000).toFixed(2)} km</td>
          <td class="font-mono" style="color: var(--accent);">Rp ${item.nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
          <td>${item.tanggal}</td>
          <td>
            <button onclick="exportReport(${item.id})" class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">PDF</button>
            <button onclick="deleteReport(${item.id})" class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; color: #ef4444; border-color: #fecaca;">Hapus</button>
          </td>
        </tr>
      `).join('');
      if (emptyState) emptyState.style.display = 'none';
    }
  }
}

function deleteReport(id) {
  if (!confirm('Hapus laporan ini?')) return;
  APP_STATE.historyData = APP_STATE.historyData.filter(h => h.id !== id);
  localStorage.setItem('smartland_measurements', JSON.stringify(APP_STATE.historyData));
  loadHistory();
}

function exportReport(id) {
  var item = APP_STATE.historyData.find(function (h) { return h.id === id; });
  if (!item) return;

  var luas = item.luas > 10000 ? (item.luas / 10000).toFixed(2) + ' ha' : item.luas.toFixed(0) + ' m\u00B2';
  var w = window.open('', '_blank');
  w.document.write('<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Pengukuran - SmartLand</title>' +
    '<style>' +
    'body{font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#1a1a2e;max-width:720px;margin:40px auto;padding:0 20px}' +
    'h1{font-size:22px;font-weight:700;margin-bottom:4px;letter-spacing:1px}' +
    '.sub{color:#666;font-size:13px;margin-bottom:24px}' +
    'hr{border:none;border-top:2px solid #1a1a2e;margin:20px 0}' +
    'table{width:100%;border-collapse:collapse;margin:16px 0}' +
    'td{padding:8px 6px;border-bottom:1px solid #ddd}' +
    'td:first-child{font-weight:600;width:140px;color:#555}' +
    '.value{font-weight:700;font-size:15px}' +
    '.total{font-size:18px;color:#16a34a}' +
    'ol{font-family:"Courier New",monospace;font-size:12px;line-height:1.8;background:#f8f9fa;padding:16px 16px 16px 36px;border-radius:6px}' +
    '.footer{text-align:center;font-size:11px;color:#999;margin-top:32px;border-top:1px solid #ddd;padding-top:16px}' +
    '@media print{body{margin:0;padding:0 15px}}' +
    '</style></head><body>' +
    '<h1>LAPORAN PENGUKURAN TANAH</h1>' +
    '<div class="sub">SMARTLand &mdash; Kelompok 4 &bull; ' + item.tanggal + ' ' + item.waktu + '</div>' +
    '<hr>' +
    '<table>' +
    '<tr><td>Lokasi</td><td class="value">' + item.lokasi + '</td></tr>' +
    '<tr><td>Luas Tanah</td><td class="value">' + luas + '</td></tr>' +
    '<tr><td>Perimeter</td><td class="value">' + (item.perimeter / 1000).toFixed(2) + ' km</td></tr>' +
    '<tr><td>Estimasi Nilai</td><td class="value total">Rp ' + item.nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 }) + '</td></tr>' +
    '<tr><td>Tanggal Ukur</td><td class="value">' + item.tanggal + '</td></tr>' +
    '</table>' +
    '<hr>' +
    '<div style="font-weight:600;margin-bottom:6px">Koordinat Titik Batas:</div>' +
    '<ol>' + item.points.map(function (p, i) { return '<li>' + p.lat.toFixed(6) + ', ' + p.lng.toFixed(6) + '</li>'; }).join('') + '</ol>' +
    '<div class="footer">Laporan ini dihasilkan oleh SMARTLand &copy; 2026 Kelompok 4 &mdash; ' + item.tanggal + '</div>' +
    '</body></html>');
  w.document.close();

  setTimeout(function () {
    w.focus();
    w.print();
  }, 300);
}


