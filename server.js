require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const helmet = require('helmet');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');

const connectDB = require('./config/db');
const { seoDefaults } = require('./middleware/seo');

// ─── i18next setup ───────────────────────────────────────
i18next
    .use(i18nextBackend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: path.join(__dirname, 'locales', '{{lng}}', 'translation.json')
        },
        fallbackLng: 'ca',
        supportedLngs: ['ca', 'en', 'de'],
        preload: ['ca', 'en', 'de'],
        detection: {
            order: ['querystring', 'cookie', 'header'],
            lookupQuerystring: 'lang',
            lookupCookie: 'i18next',
            caches: ['cookie']
        },
        interpolation: {
            escapeValue: false
        }
    });

// ─── Express app ─────────────────────────────────────────
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security headers (relaxed for dev with inline styles/scripts)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE from HTML forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// i18next middleware
app.use(i18nextMiddleware.handle(i18next));

// ─── Configure and start ─────────────────────────────────
async function startServer() {
    const dbConnected = await connectDB();

    // Sessions — use MongoStore if DB available, otherwise memory
    const sessionConfig = {
        secret: process.env.SESSION_SECRET || 'dev-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
    };

    if (dbConnected) {
        sessionConfig.store = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions'
        });
    }

    app.use(session(sessionConfig));

    // ─── Global template locals ──────────────────────────────
    app.use((req, res, next) => {
        // User session data available in all views
        res.locals.user = req.session.userId ? {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.userRole
        } : null;

        // Flash messages
        res.locals.flash = req.session.flash || null;
        delete req.session.flash;

        // Translation helper
        res.locals.t = req.t;
        res.locals.currentLang = req.language || 'ca';

        // Current path for active nav
        res.locals.currentPath = req.path;

        next();
    });

    // SEO defaults middleware
    app.use(seoDefaults);

    // ─── Routes ──────────────────────────────────────────────
    app.use('/', require('./routes/homeRoutes'));
    app.use('/', require('./routes/bookingRoutes'));
    app.use('/', require('./routes/contactRoutes'));
    app.use('/', require('./routes/authRoutes'));
    app.use('/intranet', require('./routes/noteRoutes'));

    // Sitemap.xml
    app.get('/sitemap.xml', (req, res) => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const langs = ['ca', 'en', 'de'];
        const pages = ['/', '/login', '/register'];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

        pages.forEach(page => {
            langs.forEach(lang => {
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}${page}?lang=${lang}</loc>\n`;
                langs.forEach(altLang => {
                    xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${page}?lang=${altLang}" />\n`;
                });
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>0.8</priority>\n';
                xml += '  </url>\n';
            });
        });

        xml += '</urlset>';
        res.type('application/xml').send(xml);
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).render('index', {
            currentPage: 'home'
        });
    });

    // ─── Start server ────────────────────────────────────────
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🫒 Son Mullet servidor en marxa → http://localhost:${PORT}`);
        if (!dbConnected) {
            console.log('⚠️  Mode sense base de dades — només pàgina principal disponible');
        }
        console.log('');
    });
}

startServer();
