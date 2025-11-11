import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    dob: {
        type: Date,
        default: ""
    },
    location: {
        type: String,
    },
    allergys: {
        type: [String],
        default: []
    },
    bloodGroup: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: 'https://placehold.co/150x150/cbd5e1/1f2937?text=User'
    },
    fav_doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }]
    ,
    socketid: {
        type: String
    },
    resetCode: String,
    preferences: {
        remindertime: {
            type: Number,
            default: null,
        },
        channels: {
            type: [String],
            default: [],    
        },
        whatsappNumber: {
            type: String,
            default: null,
        },
        smsNumber: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
    },

    resetCodeExpires: Date,
    refreshtoken: {
        type: String,
        default: null
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
    else {
        next()
    }
})

userSchema.methods.isPasswordCorrect = function (password) {
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        role: 'patient'
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const Patient = mongoose.model('Patient', userSchema);
