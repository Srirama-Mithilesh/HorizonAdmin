
// --- APP LOGIC ---

// --- DATA FETCHING ---

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        const container = document.getElementById('stats-container');
        container.innerHTML = `
            <div class="card">
                <div class="stat-title">Total Revenue</div>
                <div class="stat-value">₹${data.revenue.toLocaleString()}</div>
            </div>
            <div class="card">
                <div class="stat-title">Active Bookings</div>
                <div class="stat-value">${data.activeBookings}</div>
            </div>
            <div class="card">
                <div class="stat-title">Total Properties</div>
                <div class="stat-value">${data.totalProperties}</div>
            </div>
        `;

        // Load Recent Bookings
        const booksRes = await fetch('/api/bookings');
        const bookings = await booksRes.json();
        const tbody = document.getElementById('recent-bookings-list');
        
        tbody.innerHTML = bookings.slice(0, 5).map(b => `
            <tr>
                <td>
                    <div style="font-weight:700; color:#0F172A">${b.guest}</div>
                    <div style="font-size:0.75rem; color:#64748B">ID: ${b.id}</div>
                </td>
                <td>${b.propertyName}</td>
                <td>${b.date}</td>
                <td style="font-family:monospace; font-weight:600">₹${b.amount.toLocaleString()}</td>
                <td><span class="badge ${b.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${b.status}</span></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error("Error loading stats:", e);
    }
}

async function loadProperties() {
    try {
        const res = await fetch('/api/properties');
        const properties = await res.json();
        
        const container = document.getElementById('property-list');
        
        if(properties.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 60px; background:white; border-radius:16px; border:1px dashed #E2E8F0;">
                    <h3 style="margin-bottom:8px; font-weight:700;">No properties found</h3>
                    <p style="color:#64748B;">Get started by adding your first hotel.</p>
                </div>`;
            return;
        }

        // Render Modern Cards
        container.innerHTML = properties.map(p => `
            <div class="property-card-modern">
                <div class="prop-img-wrapper">
                    <img src="${p.imageUrl}" alt="${p.name}">
                    <div class="badge-overlay">ID: ${p.id}</div>
                    <div class="rating-overlay">
                        <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        4.8
                    </div>
                </div>
                
                <div class="prop-content">
                    <div>
                        <div class="prop-header">
                            <div>
                                <h3 class="prop-title">${p.name}</h3>
                                <div class="prop-location">
                                    <svg class="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    ${p.location || 'Unknown Location'}
                                </div>
                            </div>
                            <div class="price-block">
                                <div class="price-label">Starting From</div>
                                <div class="price-amount">₹25,000</div>
                            </div>
                        </div>
                        <p class="prop-desc">${p.description || 'No description provided.'}</p>
                    </div>

                    <div class="prop-footer">
                        <div class="room-tags">
                            <div class="room-tag"><div class="dot-indicator"></div> Active</div>
                            ${(p.rooms || []).map(r => `
                                <div class="room-tag">${r.type}</div>
                            `).join('')}
                            ${(!p.rooms || p.rooms.length === 0) ? '<div class="room-tag">No Rooms</div>' : ''}
                        </div>
                        
                        <div class="action-buttons">
                            <button onclick="switchToFormView(${p.id})" class="btn btn-outline btn-sm">Edit Details</button>
                            <button onclick="deleteProperty(${p.id})" class="btn btn-danger-subtle btn-sm">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch(e) {
        console.error("Failed to load properties", e);
    }
}

async function loadBookings() {
    try {
        const res = await fetch('/api/bookings');
        const bookings = await res.json();
        
        const tbody = document.getElementById('bookings-list');
        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td>
                    <div style="font-weight:700; color:#0F172A">${b.guest}</div>
                </td>
                <td>${b.propertyName}</td>
                <td>${b.date}</td>
                <td style="font-family:monospace; font-weight:600">₹${b.amount.toLocaleString()}</td>
                <td><span class="badge ${b.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${b.status}</span></td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

// --- FORM LOGIC ---

async function initForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        document.getElementById('form-title').innerText = 'Edit Property';
        document.getElementById('propId').value = id;
        
        try {
            const res = await fetch(`/api/properties/${id}`);
            const data = await res.json();
            
            document.getElementById('name').value = data.name;
            document.getElementById('location').value = data.location;
            document.getElementById('priceRange').value = data.priceRange;
            document.getElementById('description').value = data.description;
            document.getElementById('imageUrl').value = data.imageUrl;
            
            // Render existing rooms
            if(data.rooms && Array.isArray(data.rooms)) {
                data.rooms.forEach(r => addRoomField(r));
            }
        } catch(e) { console.error("Err loading prop", e); }
    } else {
        addRoomField(); // Add default room
    }

    document.getElementById('propertyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const jsonData = Object.fromEntries(formData.entries());
        
        // Manual Room Collection
        const roomDivs = document.querySelectorAll('.room-item');
        const rooms = [];
        roomDivs.forEach(div => {
            rooms.push({
                type: div.querySelector('.room-type').value,
                price: div.querySelector('.room-price').value,
                capacity: div.querySelector('.room-capacity').value
            });
        });
        jsonData.rooms = JSON.stringify(rooms);

        try {
            await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });
            loadProperties();
            switchToListView();
        } catch(e) {
            alert("Error saving property");
        }
    });
}

function addRoomField(data = { type: '', price: '', capacity: '' }) {
    const container = document.getElementById('rooms-container');
    const div = document.createElement('div');
    div.className = 'room-item';
    // Using inline styles for simplicity in JS injection, but classes would be better
    div.innerHTML = `
        <div style="flex:2">
            <label style="font-size:0.75rem; color:#6B7280; font-weight:600; display:block; margin-bottom:4px">Room Type</label>
            <input type="text" class="form-control room-type" value="${data.type}" placeholder="e.g. Deluxe Suite">
        </div>
        <div style="flex:1">
            <label style="font-size:0.75rem; color:#6B7280; font-weight:600; display:block; margin-bottom:4px">Price</label>
            <input type="number" class="form-control room-price" value="${data.price}" placeholder="5000">
        </div>
        <div style="flex:1">
            <label style="font-size:0.75rem; color:#6B7280; font-weight:600; display:block; margin-bottom:4px">Capacity</label>
            <input type="number" class="form-control room-capacity" value="${data.capacity}" placeholder="2">
        </div>
        <button type="button" class="btn-danger-subtle btn-sm" style="height:42px; align-self:flex-end" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

async function deleteProperty(id) {
    if(confirm('Are you sure you want to remove this property?')) {
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        loadProperties();
    }
}
