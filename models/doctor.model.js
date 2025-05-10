import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";



const history=new Schema({
    patientname:{
        type:String,
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
        type:String,
        default:"data:image/png;base64,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"
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
          patientname:{
            type:String,

          },
          text:{
            type:String,
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