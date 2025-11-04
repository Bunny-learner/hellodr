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
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    hospital:{
        type:String,
        default:""
    },
    medicallicense:{
        type:String,
        required:true
    },
    address: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: 'https://res.cloudinary.com/decmqqc9n/image/upload/v1761300266/dp_copsbu.png'
    },
    rating:{
        type:Number
    },
    languages:{
        type:[String],
        default:["Hindi"]
    },
    refreshtoken: {
        type: String,
        default: null
    }
}, { timestamps: true });

userSchema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10)
        next()
    }
    else{
        next()
    }
})

userSchema.methods.isPasswordCorrect=function(passwd){
    return bcrypt.compare(passwd,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        role:'doctor'
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken=function () {
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const Doctor=mongoose.model('Doctor', userSchema);
