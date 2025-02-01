import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";



const history=new Schema({
    patientid:{
        type:Schema.Types.ObjectId,
        ref:"patient"
    },
    condition:{
        type:String,
    },
    status:{
        type:String,
    }
})

const userschema=new Schema({
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
    specality:{
        type:String
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    profilepic:{
        type:String
    },
    refreshtoken:{
        type:String
    },
    info:[{
        experience:{
            type:String},
        phonenumber:{
            type:String
        },
        Hospitals:{
            type:String
        },
        Rating:{
            type:String
        }


}],
    socketid:{
        type:String,
        default:""
    },
    roomid:{
        type:String,
        default:""
    },
    status:{
        type:String,
        defalut:"offline"
    },
    reviews:[
        {
          patientid:{
            type:String,
            required:true
          },
          text:{
            type:String,
            required:true
          },
          date:{
            type:Date
          }
        }
    ],
    pendingrequests:[
{
  psocketid:{
    type:String
  },
  pname:{
    type:String
  },
  pcondition:{
    type:String
  }
}
    ],
    history:[history]
    },{
        timestamps:true
    }
)




// userschema.pre("save",async function (next) {
//     if(this.isModified("password")){
//         this.password=await bcrypt.hash(this.password,10)
//         next()
//     }
//     else{
//         next()
//     }
// })

userschema.methods.ispasswordcorrect=function(passwd){
    return bcrypt.compare(passwd,this.password)
}

userschema.methods.generateaccesstoken=function(){

    return jwt.sign(   
    {
        _id:this._id,
        email:this.email,
        Username:this.Username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:"1d"
    })
}

userschema.methods.generaterefreshtoken=function () {
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const doctor=mongoose.model("doctor",userschema)