import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    getStats,
    getAllProperties,
    getPropertyById,
    createOrUpdateProperty,
    deleteProperty,
    getAllBookings
} from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/stats', authenticateToken, getStats);
router.get('/properties', authenticateToken, getAllProperties);
router.get('/properties/:id', authenticateToken, getPropertyById);
router.post('/properties', authenticateToken, createOrUpdateProperty);
router.delete('/properties/:id', authenticateToken, deleteProperty);
router.get('/bookings', authenticateToken, getAllBookings);

export default router;
