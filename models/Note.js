const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: ['incidencia', 'observacio', 'general'], default: 'general' },
    priority: { type: String, enum: ['alta', 'mitjana', 'baixa'], default: 'mitjana' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

noteSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Note', noteSchema);
