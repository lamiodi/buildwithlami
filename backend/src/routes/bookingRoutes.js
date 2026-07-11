import { Router } from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Public — rate-limited at the app level
router.post('/', createBooking);

// Admin — requires authentication
router.get('/', verifyToken, requireRole('Owner', 'Administrator', 'Survey Manager', 'Drone Manager'), getBookings);
router.patch('/:id/status', verifyToken, requireRole('Owner', 'Administrator', 'Survey Manager', 'Drone Manager'), updateBookingStatus);

export default router;
