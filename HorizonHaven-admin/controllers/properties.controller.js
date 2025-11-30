// controllers/properties.controller.js
import { supabase } from '../config/supabase.js';

// GET /api
export async function getAllProperties(req, res) {
  try {
    const { data, error } = await supabase.from('destinations').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load destinations" });
  }
}

//GET api/search
export async function searchProperties(req, res) {
  const { destination, guests } = req.query; // guests can be used later if needed

  if (!destination) {
    return res.status(400).json({ message: "Destination is required" });
  }

  try {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .ilike('city', `%${destination}%`); // case-insensitive search

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to search hotels" });
  }
}

/*
export async function searchProperties(req, res) {
  try {
    const { destination = '', guests = '' } = req.query;

    const dest = destination.trim().toLowerCase();
    const guestCount = parseInt(guests, 10) || 1;

    if (!dest) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const { data, error } = await supabase
      .from('hotels_rooms_search')
      .select('*')
      .gte('max_guests', guestCount)
      .or(`(hotel_city.ilike.%${dest}%,hotel_name.ilike.%${dest}%)`);

    if (error) {
      console.error("Supabase search error:", error.message);
      return res.status(500).json({ message: "Search failed" });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("searchProperties error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}*/

// GET /api/details/:destination
export async function getPropertyDetails(req, res) {
  try {
    const destination = req.params.destination?.trim() || '';

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    // Step 1: Find hotel by name
    const { data: hotels, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .ilike('name', destination);

    if (hotelError) throw hotelError;

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const hotel = hotels[0];

    // Step 2: Fetch rooms for that hotel
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        room_type,
        price_per_night,
        max_guests,
        is_available,
        room_amenities (
          amenities (
            id,
            name
          )
        )
      `)
      .eq('hotel_id', hotel.id);

    if (roomError) throw roomError;

    // Normalize amenities
    const formattedRooms = rooms.map((room) => ({
      ...room,
      amenities: (room.room_amenities || []).map((ra) => ra.amenities)
    }));

    res.json({
      ...hotel,
      rooms: formattedRooms
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
