const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connectat: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  MongoDB no disponible: ${err.message}`);
    console.warn('   El servidor funcionarà sense base de dades.');
    console.warn('   Les funcionalitats de reserva, contacte i autenticació no estaran disponibles.');
    return false;
  }
};

module.exports = connectDB;
