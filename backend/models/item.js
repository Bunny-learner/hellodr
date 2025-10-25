import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true
    },

    manfacturer: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availablequantity: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

export const Item = mongoose.model('Items', itemSchema);
