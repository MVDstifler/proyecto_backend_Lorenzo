const mongoose = require('mongoose');

// URL de conexión a MongoDB (puedes usar variables de entorno para mayor seguridad)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mi_base_de_datos';

const connectDB = async () => {
  try { 
    console.log('Mongo URI:', process.env.MONGO_URI);

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1); // Salir del proceso si no se puede conectar
  }
};

module.exports = connectDB;


