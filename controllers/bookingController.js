const Booking = require('../models/Booking');

// POST /booking — save a reservation
exports.createBooking = async (req, res) => {
    try {
        const { name, email, checkin, checkout, guests, type, notes } = req.body;
        const booking = await Booking.create({ name, email, checkin, checkout, guests, type, notes });
        console.log('📌 Nova reserva:', booking.name, '—', booking.checkin);

        // Return JSON for AJAX or redirect
        if (req.xhr || req.headers['accept']?.includes('json')) {
            return res.json({ success: true, message: req.t('booking.success') });
        }
        req.session.flash = { type: 'success', message: req.t('booking.success') };
        return res.redirect('/#reservas');
    } catch (err) {
        console.error('❌ Error reserva:', err.message);
        if (req.xhr || req.headers['accept']?.includes('json')) {
            return res.status(400).json({ success: false, message: req.t('booking.error') });
        }
        req.session.flash = { type: 'error', message: req.t('booking.error') };
        return res.redirect('/#reservas');
    }
};
