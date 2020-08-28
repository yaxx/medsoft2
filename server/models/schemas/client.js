const mongoose = require( '../db');
var Schema = mongoose.Schema;
var ClientSchema = new Schema({
        info: {
            name: String,
            category: String, 
            ownership: String,
            specialization: String,
            mobile: Number,
            email: String,
            dp: String ,
            city: String,
            zipcode: String,
            address: String,
            expiry: Date
        },
        departments: [{
            name: String,
            category: String,
            hasWard: Boolean,
            numbOfRooms: Number,
            numbOfBeds: Number
        }],    
        inventory: [{
                category: String,
                stockItem: {
                    category: String,
                    name: String,
                    size: Number,
                    unit: String,
                    form: String
                },
                stockInfo: {
                    price: Number,
                    category: String,
                    quantity: Number,
                    sold: Number,
                    expiry: Date
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
                },
                signature: String
            }],
        staffs: [
            { type: Schema.Types.ObjectId, ref: 'Person'}
       ]
    },
    {timestamps: true}
)

const Client = mongoose.model('Client', ClientSchema);
module.exports =  Client;
