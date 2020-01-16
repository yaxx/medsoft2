const mongoose = require('../db') ;
const Scheema = mongoose.Schema
const CaptureScheema = new Scheema({
        category: String,
        name: String
})
const Capture = mongoose.model('Capture', CaptureScheema)
module.exports  = Capture




