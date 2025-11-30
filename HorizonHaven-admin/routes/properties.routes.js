// routes/properties.routes.js
import { Router } from 'express';
import {
  getAllProperties,
  searchProperties,
  getPropertyDetails,
} from '../controllers/properties.controller.js';

const router = Router();

// GET /api -> all properties
router.get('/', getAllProperties);

// GET /api/search?destination=Goa&guests=2
router.get('/search', searchProperties);

// GET /api/details/:destination
router.get('/details/:destination', getPropertyDetails);

export default router;
