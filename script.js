// script.js - Single shared JS for demo project

const API_BASE = 'http://localhost:3000';

// Simple mobile menu toggles
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'mobileMenuBtn') {
    const m = document.getElementById('mobileMenu');
    if (m) m.classList.toggle('hidden');
  }
  if (e.target && e.target.id === 'mobileMenuBtn2') {
    const m = document.getElementById('mobileMenu');
    if (m) m.classList.toggle('hidden');
  }
});

// Utility: fetch JSON with error handling
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Fetch error', err);
    return null;
  }
}

/* HOME: show a few vehicles */
async function loadHomeVehicles() {
  const container = document.getElementById('homeVehicles');
  if (!container) return;
  const data = await fetchJSON(`${API_BASE}/vehicles?_limit=6`);
  if (!data) {
    container.innerHTML = '<p class="text-red-500">Failed to load vehicles.</p>';
    return;
  }
  container.innerHTML = data.map(v => `
    <article class="bg-white p-3 rounded shadow flex items-center gap-3">
      <img src="${v.image}" alt="${v.name}" class="w-20 h-14 object-cover rounded">
      <div>
        <h3 class="font-semibold">${v.name}</h3>
        <div class="text-sm text-gray-500">${v.type} • ₹${v.price}/day</div>
        <a href="vehicle-details.html?id=${v.id}" class="text-indigo-600 text-sm">View</a>
      </div>
    </article>
  `).join('');
}

/* VEHICLE LIST: render grid and filters */
async function loadVehicleList() {
  const grid = document.getElementById('vehicleGrid');
  if (!grid) return;
  let data = await fetchJSON(`${API_BASE}/vehicles`);
  if (!data) {
    grid.innerHTML = '<p class="text-red-500">Failed to load vehicles.</p>';
    return;
  }

  // filter controls
  const typeSel = document.getElementById('filterType');
  const sortSel = document.getElementById('sortBy');
  const searchInput = document.getElementById('searchInput');

  function render(list) {
    grid.innerHTML = list.map(v => `
    <article class="bg-white rounded shadow overflow-hidden">
      <img loading="lazy" src="${v.image}" alt="${v.name}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-semibold">${v.name}</h3>
        <p class="text-sm text-gray-500">${v.type}</p>
        <p class="mt-2 font-bold">₹${v.price}/day</p>
        <div class="mt-4 flex gap-2">
          <a class="px-3 py-2 border rounded text-sm" href="vehicle-details.html?id=${v.id}">Details</a>
          <a class="px-3 py-2 bg-indigo-600 text-white rounded text-sm" href="booking.html?vehicleId=${v.id}">Book</a>
        </div>
      </div>
    </article>
    `).join('');
  }

  // initial render
  render(data);

  // event handlers
  typeSel && typeSel.addEventListener('change', () => {
    let filtered = data.filter(d => !typeSel.value || d.type === typeSel.value);
    if (searchInput.value) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    }
    if (sortSel.value === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
    if (sortSel.value === 'price-desc') filtered.sort((a,b)=>b.price-a.price);
    render(filtered);
  });

  sortSel && sortSel.addEventListener('change', () => {
    let list = [...data];
    if (typeSel.value) list = list.filter(d => d.type === typeSel.value);
    if (searchInput.value) list = list.filter(d => d.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    if (sortSel.value === 'price-asc') list.sort((a,b)=>a.price-b.price);
    if (sortSel.value === 'price-desc') list.sort((a,b)=>b.price-a.price);
    render(list);
  });

  searchInput && searchInput.addEventListener('input', () => {
    let list = [...data];
    if (typeSel.value) list = list.filter(d => d.type === typeSel.value);
    if (searchInput.value) list = list.filter(d => d.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    if (sortSel.value === 'price-asc') list.sort((a,b)=>a.price-b.price);
    if (sortSel.value === 'price-desc') list.sort((a,b)=>b.price-a.price);
    render(list);
  });
}

/* VEHICLE DETAILS: read ?id and render */
async function loadVehicleDetails() {
  const el = document.getElementById('vehicleDetails');
  if (!el) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || params.get('vehicleId'); // accept either
  if (!id) {
    el.innerHTML = '<p class="text-red-500">No vehicle selected.</p>';
    return;
  }
  const v = await fetchJSON(`${API_BASE}/vehicles/${id}`);
  if (!v) {
    el.innerHTML = '<p class="text-red-500">Vehicle not found.</p>';
    return;
  }

  el.innerHTML = `
    <div class="md:flex gap-6">
      <div class="md:w-1/2">
        <img src="${v.image}" alt="${v.name}" class="w-full h-64 object-cover rounded">
      </div>
      <div class="md:w-1/2">
        <h2 class="text-2xl font-bold">${v.name}</h2>
        <p class="text-sm text-gray-500">${v.type} • ₹${v.price}/day</p>
        <p class="mt-4 text-gray-700">${v.description}</p>
        <ul class="mt-4 list-disc ml-5 text-gray-600">
          ${v.features.map(f=>`<li>${f}</li>`).join('')}
        </ul>
        <div class="mt-6 flex gap-3">
          <a href="booking.html?vehicleId=${v.id}" class="px-4 py-2 bg-indigo-600 text-white rounded">Book Now</a>
          <a href="vehicles.html" class="px-4 py-2 border rounded">Back</a>
        </div>
      </div>
    </div>
  `;
}

/* BOOKING FORM submit */
async function attachBookingHandler() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = {
      vehicleId: form.vehicleId.value,
      pickup: form.pickup.value,
      drop: form.drop.value,
      pickupDate: form.pickupDate.value,
      dropDate: form.dropDate.value,
      passengers: +form.passengers.value,
      fullname: form.fullname.value,
      contactInfo: form.contactInfo.value,
      createdAt: new Date().toISOString()
    };

    // Basic validation: drop after pickup
    if (new Date(data.dropDate) <= new Date(data.pickupDate)) {
      document.getElementById('bookingResult').innerHTML = '<p class="text-red-500">Drop date/time must be after pickup.</p>';
      return;
    }

    // POST to dummy endpoint
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      const result = await res.json();
      document.getElementById('bookingResult').innerHTML = `<p class="text-green-600">Booking confirmed (id: ${result.id}). We emailed a fake receipt.</p>`;
      form.reset();
    } catch (err) {
      console.error(err);
      document.getElementById('bookingResult').innerHTML = `<p class="text-red-500">Failed to book. Try again later.</p>`;
    }
  });
}

/* CONTACT form */
function attachContactHandler() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMessage').value;
    // fake submit - just show success
    document.getElementById('contactResult').textContent = `Thanks ${name}. We received your message.`;
    form.reset();
  });
}

/* AUTH - localStorage mock */
function attachAuthHandlers() {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const pass = document.getElementById('signupPassword').value;
      // store user in localStorage (demo only)
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      if (users.find(u => u.email === email)) {
        document.getElementById('signupMsg').textContent = 'Email already used.';
        return;
      }
      users.push({name,email,pass});
      localStorage.setItem('users', JSON.stringify(users));
      document.getElementById('signupMsg').textContent = 'Account created. You can log in now.';
      signupForm.reset();
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      const u = users.find(x => x.email === email && x.pass === pass);
      if (!u) {
        document.getElementById('loginMsg').textContent = 'Invalid credentials.';
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(u));
      document.getElementById('loginMsg').textContent = 'Logged in. Redirecting...';
      setTimeout(()=> location.href = 'index.html', 800);
    });
  }
}

/* Quick search on home */
function attachQuickSearch() {
  const form = document.getElementById('quickSearch');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pickup = form.pickup.value;
    const drop = form.drop.value;
    // keep it simple: go to vehicles page
    const params = new URLSearchParams({pickup, drop});
    location.href = `vehicles.html?${params.toString()}`;
  });
}

/* Init depending on page */
document.addEventListener('DOMContentLoaded', () => {
  loadHomeVehicles();
  loadVehicleList();
  loadVehicleDetails();
  attachBookingHandler();
  attachContactHandler();
  attachAuthHandlers();
  attachQuickSearch();
});
//----------------------------------------------------
// 🔹 CAR API INTEGRATION - API Ninjas + VinAudit
//----------------------------------------------------
const API_NINJA_KEY = "YOUR_API_KEY_HERE"; // 🟣 Replace with your real API Ninjas key
const VINAUDIT_API_KEY = "YOUR_VINAUDIT_KEY_HERE"; // optional, if you have one

async function fetchCarData(make, model) {
  try {
    const url = `https://api.api-ninjas.com/v1/cars?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    const res = await fetch(url, {
      headers: { "X-Api-Key": API_NINJA_KEY }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Car data error:", err);
    alert("Error fetching car data. Check console for details.");
    return [];
  }
}

async function fetchCarImage(make, model) {
  try {
    const url = `https://api.vinaudit.com/v1/vehicle-images?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&key=${VINAUDIT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.images && data.images.length > 0) return data.images[0];
    return null;
  } catch (err) {
    console.error("Image fetch failed:", err);
    return null;
  }
}

function renderCarResults(cars, imageUrl) {
  const container = document.getElementById("vehiclesContainer");
  if (!container) return;
  if (!cars.length) {
    container.innerHTML = `<p class="text-red-500">No cars found.</p>`;
    return;
  }

  container.innerHTML = cars.map(c => `
    <div class="p-4 bg-white shadow rounded">
      <h3 class="font-semibold">${c.make} ${c.model} (${c.year || ""})</h3>
      <p>Horsepower: ${c.horsepower || "N/A"}</p>
      <p>Fuel: ${c.fuel_type || "N/A"}</p>
      <p>Transmission: ${c.transmission || "N/A"}</p>
    </div>
  `).join("");

  if (imageUrl) {
    const img = document.getElementById("carImage");
    img.src = imageUrl;
    img.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("searchBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      const make = document.getElementById("makeInput").value.trim();
      const model = document.getElementById("modelInput").value.trim();
      if (!make) return alert("Please enter car make.");
      document.getElementById("vehiclesContainer").innerHTML = `<p>Loading...</p>`;
      const data = await fetchCarData(make, model);
      const image = await fetchCarImage(make, model);
      renderCarResults(data, image);
    });
  }
});
