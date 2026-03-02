const Contact = require('../models/Contact');

// POST /contact — save a contact message
exports.createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await Contact.create({ name, email, subject, message });
        console.log('📬 Nou missatge de contacte:', contact.name);

        if (req.xhr || req.headers['accept']?.includes('json')) {
            return res.json({ success: true, message: req.t('contact.success') });
        }
        req.session.flash = { type: 'success', message: req.t('contact.success') };
        return res.redirect('/#contacto');
    } catch (err) {
        console.error('❌ Error contacte:', err.message);
        if (req.xhr || req.headers['accept']?.includes('json')) {
            return res.status(400).json({ success: false, message: req.t('contact.error') });
        }
        req.session.flash = { type: 'error', message: req.t('contact.error') };
        return res.redirect('/#contacto');
    }
};
