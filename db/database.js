require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://marcohuitron1327:AHOx9bXYMx96ehmB@cluster0.0qfdwzk.mongodb.net/finance?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

module.exports = mongoose;
