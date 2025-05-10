import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const schema=new mongoose.Schema({
email:{
    type:String,
    required:true
},
password:{
    type:String,
    required:true
},
refreshtoken:{
    type:String
}
},{timestamps:true})

schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)//for encrypting password
    next()


})



schema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)//this will not work in arrow functions
}



schema.methods.generateAccessToken=function(){

    return jwt.sign(   
    {
        _id:this._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:"1d"
    })
}


schema.methods.generateRefreshToken=function(){

    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:"15d"
    })
}

const chat= mongoose.model("chatApp", schema)


export {chat}