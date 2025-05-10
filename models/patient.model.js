import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const history=new Schema({
    doctorid:{
        type:Schema.Types.ObjectId,
        ref:"doctor"
    },
    condition:{
        type:String,
        required:true,
        enum: ["worst", "intermediate", "juststarted"]
    } 
})

const patientschema=new Schema({
    Username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshtoken:{
        type:String
    },
    socketid:{
        type:String,
        default:""
    },
    roomid:{
        type:String,
        default:""
    },
    age:{
        type:Number,
        default:17
    },
    condition:{
        type:String,
        enum: ["worst", "intermediate", "juststarted"]
    },
    history:[history]
    },{
        timestamps:true
    }
)




patientschema.pre("save",async function (next) {
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10)
        next()
    }
    else{
        next()
    }
})

patientschema.methods.isPasswordcorrect=function(passwd){
    return bcrypt.compare(passwd,this.password)
}

patientschema.methods.generateaccesstoken=function () {
    return jwt.sign({
        _id:this._id,
        email:this.email,
        name:this.name
    },process.env.ACCESS_TOKEN_SECRET,{
<<<<<<< HEAD
        expiresIn:'1d'
=======
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
>>>>>>> 19a8a3ff58c4aeca85ef2101a65f30388bf42d5c
    })
}
patientschema.methods.generaterefreshtoken=function () {
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const patient=mongoose.model("patient",patientschema)