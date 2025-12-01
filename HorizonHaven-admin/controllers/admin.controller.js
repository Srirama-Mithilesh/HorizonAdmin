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

export const getStats = (req, res) => {
    const totalRevenue = bookings
        .filter(b => b.status === 'Confirmed')
        .reduce((sum, b) => sum + b.amount, 0);

    res.json({
        revenue: totalRevenue,
        activeBookings: bookings.filter(b => b.status === 'Confirmed').length,
        totalProperties: properties.length
    });
};

export const getAllProperties = (req, res) => {
    res.json(properties);
};

export const getPropertyById = (req, res) => {
    const id = parseInt(req.params.id);
    const prop = properties.find(p => p.id === id);
    if (prop) res.json(prop);
    else res.status(404).json({ error: 'Not found' });
};

export const createOrUpdateProperty = (req, res) => {
    const data = req.body;

    if (typeof data.rooms === 'string') {
        try { data.rooms = JSON.parse(data.rooms); } catch(e) { data.rooms = []; }
    }

    if (data.id && data.id != 0) {
        const index = properties.findIndex(p => p.id == data.id);
        if (index !== -1) {
            properties[index] = { ...properties[index], ...data, id: parseInt(data.id) };
        }
    } else {
        const newId = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
        properties.push({ ...data, id: newId });
    }
    res.json({ success: true });
};

export const deleteProperty = (req, res) => {
    const id = parseInt(req.params.id);
    properties = properties.filter(p => p.id !== id);
    res.json({ success: true });
};

export const getAllBookings = (req, res) => {
    const enriched = bookings.map(b => ({
        ...b,
        propertyName: properties.find(p => p.id === b.propertyId)?.name || 'Unknown Property'
    }));
    res.json(enriched);
};
