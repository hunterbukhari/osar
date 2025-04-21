let families = [];
let userCoords = null;
let map, markersLayer;

window.onload = init;

function init() {
  fetch('families.json')
    .then(res => res.json())
    .then(data => {
      families = data;
      initMap();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setView([userCoords.lat, userCoords.lng], 10);
          renderFamilies();
        }, () => {
          renderFamilies();
        });
      } else {
        renderFamilies();
      }
    });
  document.getElementById('search').addEventListener('input', renderFamilies);
  document.getElementById('backBtn').addEventListener('click', showListView);
}

function initMap() {
  map = L.map('map').setView([24.7136, 46.6753], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function renderFamilies() {
  const query = document.getElementById('search').value.trim();
  let filtered = families.filter(f => 
    (!query || f.name.includes(query) || f.city.includes(query))
  );
  if (userCoords) {
    filtered = filtered.filter(f => {
      const d = distance(userCoords.lat, userCoords.lng, f.location.lat, f.location.lng);
      return d <= 10; // within 10 km
    });
  }
  updateList(filtered);
  updateMap(filtered);
}

function updateList(list) {
  const container = document.querySelector('.list-view');
  container.innerHTML = '';
  list.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => showProducts(f);
    card.innerHTML = `
      <img src="${f.image}" alt="${f.name}" />
      <div>
        <h3>${f.name}</h3>
        <p>${f.city}</p>
      </div>`;
    container.appendChild(card);
  });
}

function updateMap(list) {
  markersLayer.clearLayers();
  list.forEach(f => {
    const marker = L.marker([f.location.lat, f.location.lng]);
    marker.bindPopup(f.name);
    marker.addTo(markersLayer);
  });
}

function showProducts(family) {
  document.querySelector('.container').style.display = 'none';
  const pv = document.getElementById('productsView');
  pv.style.display = 'block';
  document.getElementById('familyName').textContent = 'منتجات ' + family.name;
  const ul = document.getElementById('productsList');
  ul.innerHTML = '';
  family.products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = \`
      <span>\${p.name}</span> - <span>\${p.price} ر.س</span>
      <button onclick="alert('تم إضافة \${p.name} إلى السلة')">إضافة للسلة</button>\`;
    ul.appendChild(li);
  });
}

function showListView() {
  document.getElementById('productsView').style.display = 'none';
  document.querySelector('.container').style.display = 'flex';
}

function distance(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
