const User = require('../models/User');

// GET /register
exports.getRegister = (req, res) => {
    res.render('auth/register', {
        currentPage: 'register',
        error: null
    });
};

// POST /register
exports.postRegister = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('auth/register', {
                currentPage: 'register',
                error: req.t('auth.password_mismatch')
            });
        }

        // Check if user exists
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.render('auth/register', {
                currentPage: 'register',
                error: req.t('auth.user_exists')
            });
        }

        const user = await User.create({ username, email, password });
        console.log('👤 Nou usuari registrat:', user.username);
        req.session.flash = { type: 'success', message: req.t('auth.register_success') };
        return res.redirect('/login');
    } catch (err) {
        console.error('❌ Error registre:', err.message);
        return res.render('auth/register', {
            currentPage: 'register',
            error: req.t('auth.register_error')
        });
    }
};

// GET /login
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        currentPage: 'login',
        error: null
    });
};

// POST /login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', {
                currentPage: 'login',
                error: req.t('auth.invalid_credentials')
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.userRole = user.role;

        console.log('🔐 Inici de sessió:', user.username);
        return res.redirect('/intranet');
    } catch (err) {
        console.error('❌ Error login:', err.message);
        return res.render('auth/login', {
            currentPage: 'login',
            error: req.t('auth.login_error')
        });
    }
};

// GET /logout
exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('❌ Error tancant sessió:', err);
        res.redirect('/');
    });
};
