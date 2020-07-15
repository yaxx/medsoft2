const mongoose = require('../db') ;
const Scheema = mongoose.Schema
const SuggestionScheema = new Scheema({
        category: String,
        name: String
})
const Suggestion = mongoose.model('Suggestion', SuggestionScheema)
module.exports  = Suggestion




