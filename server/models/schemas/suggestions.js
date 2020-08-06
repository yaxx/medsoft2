const mongoose = require('../db') ;
const Schema = mongoose.Schema;
const SuggestionSchema = new Schema({
        name: String,
        category: String
});
const Suggestion = mongoose.model('Suggestion', SuggestionSchema);
module.exports  = Suggestion;




