
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- MOCK DATABASE ---
let properties = [
    {
        id: 1,
        name: 'The Royal Lake Palace',
        location: 'Udaipur, Rajasthan',
        priceRange: '₹25,000 - ₹80,000',
        imageUrl: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=800&auto=format&fit=crop',
        description: 'Floating on the serene waters of Lake Pichola, this white marble palace offers a taste of royal heritage.',
        rooms: [
            { type: 'Lake View', price: 28000, capacity: 2 },
            { type: 'Royal Suite', price: 55000, capacity: 2 }
        ]
    },
    {
        id: 2,
        name: 'Goa Beachfront Resort',
        location: 'Candolim, Goa',
        priceRange: '₹12,000 - ₹30,000',
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-68cfd31b17b2?q=80&w=800&auto=format&fit=crop',
        description: 'Step directly onto the golden sands of Candolim. Features a massive pool and beach shack.',
        rooms: [
            { type: 'Garden Villa', price: 15000, capacity: 4 }
        ]
    }
];

let bookings = [
    { id: 'BK-1001', propertyId: 1, guest: 'Arjun Kumar', date: '2024-05-12', amount: 84000, status: 'Confirmed' },
    { id: 'BK-1002', propertyId: 2, guest: 'Sarah Jenkins', date: '2024-06-01', amount: 45000, status: 'Pending' },
    { id: 'BK-1003', propertyId: 1, guest: 'Rahul Dravid', date: '2024-05-20', amount: 28000, status: 'Confirmed' }
];

// --- API ROUTES ---

// Get Stats
app.get('/api/stats', (req, res) => {
    const totalRevenue = bookings
        .filter(b => b.status === 'Confirmed')
        .reduce((sum, b) => sum + b.amount, 0);
    
    res.json({
        revenue: totalRevenue,
        activeBookings: bookings.filter(b => b.status === 'Confirmed').length,
        totalProperties: properties.length
    });
});

// Get All Properties
app.get('/api/properties', (req, res) => {
    res.json(properties);
});

// Get Single Property
app.get('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const prop = properties.find(p => p.id === id);
    if (prop) res.json(prop);
    else res.status(404).json({ error: 'Not found' });
});

// Create or Update Property
app.post('/api/properties', (req, res) => {
    const data = req.body;
    
    // Parse rooms from JSON string if sent as form data
    if (typeof data.rooms === 'string') {
        try { data.rooms = JSON.parse(data.rooms); } catch(e) { data.rooms = []; }
    }

    if (data.id && data.id != 0) {
        // Edit
        const index = properties.findIndex(p => p.id == data.id);
        if (index !== -1) {
            properties[index] = { ...properties[index], ...data, id: parseInt(data.id) };
        }
    } else {
        // Create
        const newId = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
        properties.push({ ...data, id: newId });
    }
    res.json({ success: true });
});

// Delete Property
app.delete('/api/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    properties = properties.filter(p => p.id !== id);
    res.json({ success: true });
});

// Get Bookings
app.get('/api/bookings', (req, res) => {
    // Enrich with property names
    const enriched = bookings.map(b => ({
        ...b,
        propertyName: properties.find(p => p.id === b.propertyId)?.name || 'Unknown Property'
    }));
    res.json(enriched);
});

// --- PAGE ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/properties', (req, res) => res.sendFile(path.join(__dirname, 'public', 'properties.html')));
app.get('/bookings', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bookings.html')));
app.get('/property-form', (req, res) => res.sendFile(path.join(__dirname, 'public', 'property-form.html')));

app.listen(PORT, () => {
    console.log(`Admin Dashboard running at http://localhost:${PORT}`);
});
