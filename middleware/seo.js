// SEO middleware — injects res.locals.seo for dynamic meta tags per page

function seoDefaults(req, res, next) {
    const t = req.t ? req.t.bind(req) : (k) => k;
    const lang = req.language || 'ca';
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const currentUrl = `${baseUrl}${req.originalUrl}`;

    res.locals.seo = {
        title: 'Son Mullet — Agroturisme a Mallorca',
        description: t('seo.home_description'),
        canonicalUrl: currentUrl,
        baseUrl: baseUrl,
        ogType: 'website',
        ogImage: `${baseUrl}/images/header_background.png`,
        twitterCard: 'summary_large_image',
        lang: lang,
        hreflangLinks: [
            { lang: 'ca', url: `${baseUrl}${req.path}?lang=ca` },
            { lang: 'en', url: `${baseUrl}${req.path}?lang=en` },
            { lang: 'de', url: `${baseUrl}${req.path}?lang=de` },
            { lang: 'x-default', url: `${baseUrl}${req.path}?lang=ca` }
        ],
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'LodgingBusiness',
            'name': 'Son Mullet Agroturisme',
            'description': 'Agroturisme autèntic a la Serra de Tramuntana, Mallorca.',
            'url': baseUrl,
            'image': `${baseUrl}/images/header_background.png`,
            'telephone': '+34 971 123 456',
            'email': 'hola@sonmullet.com',
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Camí de Son Mullet, s/n',
                'addressLocality': 'Serra de Tramuntana',
                'addressRegion': 'Illes Balears',
                'addressCountry': 'ES'
            },
            'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 39.76,
                'longitude': 2.79
            },
            'priceRange': '€€',
            'openingHoursSpecification': {
                '@type': 'OpeningHoursSpecification',
                'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'opens': '09:00',
                'closes': '20:00'
            }
        }
    };

    next();
}

// Override default SEO for a specific page
function setSeo(overrides) {
    return (req, res, next) => {
        const t = req.t ? req.t.bind(req) : (k) => k;
        // Evaluate functions in overrides
        const evaluated = {};
        for (const [key, value] of Object.entries(overrides)) {
            evaluated[key] = typeof value === 'function' ? value(t, req) : value;
        }
        Object.assign(res.locals.seo, evaluated);
        next();
    };
}

module.exports = { seoDefaults, setSeo };
