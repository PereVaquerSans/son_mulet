const Note = require('../models/Note');

// GET /intranet — list all notes
exports.getDashboard = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.priority) filter.priority = req.query.priority;

        const notes = await Note.find(filter)
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.render('intranet/dashboard', {
            currentPage: 'intranet',
            notes,
            filterCategory: req.query.category || '',
            filterPriority: req.query.priority || ''
        });
    } catch (err) {
        console.error('❌ Error carregant notes:', err.message);
        res.render('intranet/dashboard', {
            currentPage: 'intranet',
            notes: [],
            filterCategory: '',
            filterPriority: '',
            error: req.t('intranet.load_error')
        });
    }
};

// GET /intranet/new — create form
exports.getCreateNote = (req, res) => {
    res.render('intranet/create', {
        currentPage: 'intranet',
        error: null
    });
};

// POST /intranet — save note
exports.postCreateNote = async (req, res) => {
    try {
        const { title, content, category, priority } = req.body;
        await Note.create({
            title,
            content,
            category,
            priority,
            author: req.session.userId
        });
        console.log('📝 Nova nota creada per:', req.session.username);
        return res.redirect('/intranet');
    } catch (err) {
        console.error('❌ Error creant nota:', err.message);
        return res.render('intranet/create', {
            currentPage: 'intranet',
            error: req.t('intranet.create_error')
        });
    }
};

// GET /intranet/:id/edit — edit form
exports.getEditNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.redirect('/intranet');
        res.render('intranet/edit', {
            currentPage: 'intranet',
            note,
            error: null
        });
    } catch (err) {
        console.error('❌ Error carregant nota:', err.message);
        return res.redirect('/intranet');
    }
};

// PUT /intranet/:id — update note
exports.putUpdateNote = async (req, res) => {
    try {
        const { title, content, category, priority } = req.body;
        await Note.findByIdAndUpdate(req.params.id, { title, content, category, priority });
        console.log('✏️ Nota actualitzada:', req.params.id);
        return res.redirect('/intranet');
    } catch (err) {
        console.error('❌ Error actualitzant nota:', err.message);
        return res.redirect(`/intranet/${req.params.id}/edit`);
    }
};

// DELETE /intranet/:id — delete note
exports.deleteNote = async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        console.log('🗑️ Nota eliminada:', req.params.id);
        return res.redirect('/intranet');
    } catch (err) {
        console.error('❌ Error eliminant nota:', err.message);
        return res.redirect('/intranet');
    }
};
