import { asynchandler } from "../utils/asynchandler.js"
import {doctor} from "../models/doctor.model.js"

const doctorwelcome=asynchandler(async(req,res)=>{
res.render("doctorwelcome.ejs")

})

const login = asynchandler(async (req, res) => {

    res.render('doctorlogin.ejs')
})


const getaccesstokenandrefreshtoken=async (User)=>{
    const accesstoken=await User.generateaccesstoken()
    const refreshtoken=await User.generaterefreshtoken()
    User.refreshtoken=refreshtoken
    await User.save({validateBeforeSave:false})
    return {accesstoken,refreshtoken}
}


// const registeruser=asynchandler(async (req,res) => {

//     const {name,email,password}=req.body
//     if (
//         [name,email,password].some((value)=>value?.trim() === "")
//     ) {
//     const olduser=await doctor.findOne({
//         $or:[{name},{email}]
//     })}

//     if(olduser){
//         throw new apierr(409,"User already exists")
//     }
    
//         const newuser=await user.create({
//             name,
//             email,
//             password
//         })
//         const creatednewuser=await user.findById(newuser._id).select("-password -refreshtoken")
//         if(creatednewuser){
//             return res.status(201).json(
//                 new apires(200,creatednewuser,"Successfully created user")
//             )
//         }
//         else{
//             throw new apierr(500,"Something went wrong while registering the user please try after sometime")
//         }
    
// })


const logindata=asynchandler( async(req,res)=>{
    const {email,password}=req.body
    const currentuser=await doctor.findOne({email:email
    })
    if(!currentuser){
        res.redirect('/doctor/login?alert=please enter correct credentials')
    }
    const passwordcheck=currentuser.password
    if(passwordcheck!==password){
        res.redirect('/doctor/login?alert=Invalid password,please enter correct credentials')
    }
    else{
    const options={
        httpOnly:true,
        secure:true
    }
    const {refreshtoken,accesstoken}=await getaccesstokenandrefreshtoken(currentuser)
    // console.log("this is accesstoken of doctor:",accesstoken)

    currentuser.status="online";
    await currentuser.save()
    return res.status(200)
    .cookie("accesstoken",accesstoken)
    .cookie("refreshtoken",refreshtoken,options)
    .cookie("who","doctor")
    .redirect("/doctor/dhome?alert=successfully logged in!!")
    }
})

const logoutuser=asynchandler(async(req,res)=>{


    const doc=await doctor.findById(req.user._id)
    doc.pendingrequests=[]
    await doc.save()

    await doctor.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1,
            },
            $set: {
                status: "offline",
                socketid:"" 
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .clearCookie("who",options)
    .json({message:"logout done"})
})

const dhome=asynchandler(async(req,res)=>{
    const mail=req.user.email

    if(mail){

    try{
  const load= await doctor.findOne({email:mail})
  const data=load.pendingrequests
  res.render("dhome.ejs",{data})}
  catch(error){
    console.log(error)
    res.json({message:"failed in getting the load"})
  }}
  else{
    res.json({message:"failed in getting the load"})
  }
})


const profile=asynchandler(async(req,res)=>{
  

    res.render("profile.ejs")
})

const reviews=asynchandler(async(req,res)=>{
  

    res.render("reviews.ejs")
})



const getemail=asynchandler(async(req,res)=>{
    const user=await req.user
    console.log(user)
    console.log("ended doctor verification.....")
    res.json({details:user})
    })


    const getsocketid=asynchandler(async(req,res)=>{
        const doctorname=req.headers["name"]
        const user=await doctor.findOne({Username:doctorname})
        console.log(user)
        console.log("ended doctor verification...............")
        res.json({details:user})
        })
    
const pendingrequests=asynchandler(async(req,res)=>{

    const {data,docname}=req.body
console.log(data)
console.log(docname)
    if(!docname){
        console.log("-----no doctor name provided--------")
        res.json({message:"failure"})
    }
    else{
        try {
            const doc=await doctor.findOne({Username:docname})
            doc.pendingrequests=data
            await doc.save()
            console.log("pending requests saved in db!!!!!!!!!!!")
            res.json({message:"success"})

        } catch (error) {
            console.log(error)
            res.json({message:"failure"})
        }
        
    }
    
})

export {doctorwelcome,logoutuser,getsocketid,profile,pendingrequests,reviews,login,dhome,getemail,logindata}