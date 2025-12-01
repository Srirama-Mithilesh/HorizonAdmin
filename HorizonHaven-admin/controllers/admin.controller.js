import { supabase } from '../config/supabase.js';
import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern } from '../utils/cache.js';

export const getStats = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `admin:stats:${adminId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id')
      .eq('owner_id', adminId);

    if (hotelsError) throw hotelsError;

    const hotelIds = hotels?.map(h => h.id) || [];

    if (hotelIds.length === 0) {
      const stats = { revenue: 0, activeBookings: 0, totalProperties: 0 };
      await cacheSet(cacheKey, stats, 300);
      return res.json(stats);
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_price, status, room_id')
      .in('room_id',
        (await supabase.from('rooms').select('id').in('hotel_id', hotelIds)).data?.map(r => r.id) || []
      );

    if (bookingsError) throw bookingsError;

    const totalRevenue = (bookings || [])
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => parseFloat(b.total_price || 0) + sum, 0);

    const activeBookings = (bookings || []).filter(b => b.status === 'confirmed').length;
    const totalProperties = hotels.length;

    const stats = {
      revenue: Math.round(totalRevenue),
      activeBookings,
      totalProperties
    };

    await cacheSet(cacheKey, stats, 300);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `admin:properties:${adminId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id, name, city, address, image')
      .eq('owner_id', adminId);

    if (hotelsError) throw hotelsError;

    const hotelIds = hotels?.map(h => h.id) || [];
    let allRooms = [];

    if (hotelIds.length > 0) {
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, hotel_id, room_type, price_per_night, max_guests, is_available, images')
        .in('hotel_id', hotelIds);

      if (roomsError) throw roomsError;
      allRooms = rooms || [];
    }

    const properties = hotels.map(hotel => {
      const hotelRooms = allRooms.filter(r => r.hotel_id === hotel.id);
      return {
        id: hotel.id,
        name: hotel.name,
        location: hotel.city,
        address: hotel.address,
        imageUrl: hotel.image,
        description: `${hotelRooms.length} rooms available`,
        rooms: hotelRooms.map(r => ({
          id: r.id,
          type: r.room_type,
          price: r.price_per_night,
          capacity: r.max_guests,
          available: r.is_available
        }))
      };
    });

    await cacheSet(cacheKey, properties, 300);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const hotelId = req.params.id;

    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `admin:property:${hotelId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, city, address, image, owner_id')
      .eq('id', hotelId)
      .maybeSingle();

    if (hotelError) throw hotelError;
    if (!hotel || hotel.owner_id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, hotel_id, room_type, price_per_night, max_guests, is_available, images')
      .eq('hotel_id', hotelId);

    if (roomsError) throw roomsError;

    const property = {
      id: hotel.id,
      name: hotel.name,
      location: hotel.city,
      address: hotel.address,
      imageUrl: hotel.image,
      rooms: (rooms || []).map(r => ({
        id: r.id,
        type: r.room_type,
        price: r.price_per_night,
        capacity: r.max_guests,
        available: r.is_available
      }))
    };

    await cacheSet(cacheKey, property, 300);
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

export const createOrUpdateProperty = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, name, location, address, imageUrl, description, rooms } = req.body;

    let roomsData = rooms;
    if (typeof rooms === 'string') {
      try { roomsData = JSON.parse(rooms); } catch(e) { roomsData = []; }
    }

    if (id && id !== '0') {
      const { data: hotel, error: checkError } = await supabase
        .from('hotels')
        .select('id, owner_id')
        .eq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!hotel || hotel.owner_id !== adminId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { error: updateError } = await supabase
        .from('hotels')
        .update({
          name,
          city: location,
          address,
          image: imageUrl
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await cacheDeletePattern(`admin:property:${id}*`);
      await cacheDeletePattern(`admin:properties:${adminId}*`);
      await cacheDeletePattern(`admin:stats:${adminId}*`);

      res.json({ success: true, id });
    } else {
      const { data: newHotel, error: createError } = await supabase
        .from('hotels')
        .insert({
          name,
          city: location,
          address,
          image: imageUrl,
          owner_id: adminId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      if (roomsData && roomsData.length > 0) {
        const roomsToInsert = roomsData.map(r => ({
          hotel_id: newHotel.id,
          room_type: r.type,
          price_per_night: r.price,
          max_guests: r.capacity,
          is_available: true
        }));

        const { error: roomsError } = await supabase
          .from('rooms')
          .insert(roomsToInsert);

        if (roomsError) throw roomsError;
      }

      await cacheDeletePattern(`admin:properties:${adminId}*`);
      await cacheDeletePattern(`admin:stats:${adminId}*`);

      res.json({ success: true, id: newHotel.id });
    }
  } catch (error) {
    console.error('Error creating/updating property:', error);
    res.status(500).json({ error: 'Failed to save property' });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const hotelId = req.params.id;

    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: hotel, error: checkError } = await supabase
      .from('hotels')
      .select('id, owner_id')
      .eq('id', hotelId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!hotel || hotel.owner_id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error: deleteError } = await supabase
      .from('hotels')
      .delete()
      .eq('id', hotelId);

    if (deleteError) throw deleteError;

    await cacheDelete(`admin:property:${hotelId}`);
    await cacheDeletePattern(`admin:properties:${adminId}*`);
    await cacheDeletePattern(`admin:stats:${adminId}*`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `admin:bookings:${adminId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id')
      .eq('owner_id', adminId);

    if (hotelsError) throw hotelsError;

    const hotelIds = hotels?.map(h => h.id) || [];

    if (hotelIds.length === 0) {
      await cacheSet(cacheKey, [], 300);
      return res.json([]);
    }

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .in('hotel_id', hotelIds);

    if (roomsError) throw roomsError;

    const roomIds = rooms?.map(r => r.id) || [];

    if (roomIds.length === 0) {
      await cacheSet(cacheKey, [], 300);
      return res.json([]);
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        status,
        created_at,
        room:rooms(room_type, hotel:hotels(name))
      `)
      .in('room_id', roomIds);

    if (bookingsError) throw bookingsError;

    const enrichedBookings = (bookings || []).map(b => ({
      id: b.id,
      propertyName: b.room?.hotel?.name || 'Unknown Property',
      roomType: b.room?.room_type || 'Unknown Room',
      checkIn: b.check_in,
      checkOut: b.check_out,
      amount: parseFloat(b.total_price),
      status: b.status,
      date: b.check_in
    }));

    await cacheSet(cacheKey, enrichedBookings, 300);
    res.json(enrichedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};
