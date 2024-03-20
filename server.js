const mongoose = require('mongoose');


//6️⃣7️⃣.) Environment variable-----------------

const dotenv = require('dotenv');



dotenv.config({ path: './config.env' });

const app = require('./app');
//----------------------------

//8️⃣3️⃣.) Connecting database------------
const DB=process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  // useUnifiedTopology: true 
}).then(con => {
  console.log('DB connection success')
}) ;
//---------------------------------------------

//8️⃣5️⃣.) Create Simple Tour----------------
// const tourSchema= new mongoose.Schema({
//   name:{
//     type: String,
//     required: [true, 'A tour must have a name'],
//     unique: true
//   },
//   rating: {
//     type: Number,
//     default: 4.5
//   },
//   price: {
//     type: Number,
//     required: [true, 'A tour must have a price']
//   }
// });
// const Tour=mongoose.model('Tour', tourSchema);

//8️⃣6️⃣ Create Document--------------------------
// const testTour= new Tour({
//   name: 'The Park Camper',
//   // rating: 4.7,
//   price: 990
// });

// testTour.save().then(doc => {
//   console.log(doc)
// }).catch(err => {
//   console.log('ERROR❌', err)
// });
//---------------------------------





const port = process.env.PORT || 3000;

app.listen(port, () => {

  console.log('App is running on port');

});
