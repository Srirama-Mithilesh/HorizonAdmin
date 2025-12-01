import express from 'express';
import {
    getStats,
    getAllProperties,
    getPropertyById,
    createOrUpdateProperty,
    deleteProperty,
    getAllBookings
} from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/properties', getAllProperties);
router.get('/properties/:id', getPropertyById);
router.post('/properties', createOrUpdateProperty);
router.delete('/properties/:id', deleteProperty);
router.get('/bookings', getAllBookings);

export default router;
