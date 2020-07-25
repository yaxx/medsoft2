const mongoose = require('../db') ;
const Schema = mongoose.Schema;


const InventorySchema = new Schema({
    socks: [{
        product: {
        name: String,
        conc: String,
        size: Number,
        unit: String,
        expiry: Date,
        category: String
    },
    stockInfo: {
        expiry: Date,
        price: Number,
        expired: Boolean,
        status: Boolean,
        quantity: Number,
        inStock: Number 
    },
    stamp: {
            addedBy: {
                type: Schema.Types.ObjectId,
                ref: 'Person'
            },
            facility: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            },
            selected: Boolean,
            dateAdded: Date
        }
    }]
   
},{timestamps: true, strict: false})

const Inventory = mongoose.model('Inventrory', InventorySchema);
module.exports = Inventory;