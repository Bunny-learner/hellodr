import { asynchandler } from "../utils/asynchandler.js"
import {doctor} from "../models/doctor.model.js"
import { ObjectId } from 'mongodb';
import { patient } from "../models/patient.model.js";

import dotenv from "dotenv"
dotenv.config()

const doctorwelcome=asynchandler(async(req,res)=>{
res.render("doctorwelcome.ejs")

})

const login = asynchandler(async (req, res) => {

    res.render('doctorlogin.ejs')
})


const lookdb = asynchandler(async (req, res) => {
    console.log("came to lookdb");
    const email = req.user?.email; // Safe check for email
    if (email) {
        console.log(email);
        const pidToRemove = req.headers["pid"];

        if (!pidToRemove) {
            return res.status(400).json({ message: 'No pid provided' });
        }

        try {
            const doc = await doctor.findOne({ email: email });

            if (!doc) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            // Filter the pendingrequests to remove the object with the matching psocketid
            doc.pendingrequests = doc.pendingrequests.filter(
                request => request.psocketid !== pidToRemove
            );

            await doc.save();
            console.log(doc);
            console.log("Deleted successfully");

            res.json({ message: 'Pending request deleted successfully' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Failed to delete pending request' });
        }

    } else {
        console.log("email in req.user.email not found!!");
        res.status(400).json({ message: 'Email not found in request' });
    }
});


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


const uploadprofile=asynchandler(async(req,res)=>{
console.log(process.env.CLOUDINARY_CLOUD_NAME)
res.json({cloudname:process.env.CLOUDINARY_CLOUD_NAME})
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
  
    const doc=await doctor.findOne({email:req.user.email})
    
    res.render("profile.ejs",{doc:doc})
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


const dbupload=asynchandler(async(req,res)=>{
console.log("99999999999999999999999999999999999999999999999999999999999")
    const email=req.user.email
    
    if(email){
        console.log(email)
console.log(req.body.url)
        try {

            const doc=await doctor.findOne({email:email})
            doc.profilepic=req.body.url
            console.log(doc.profilepic)
            await doc.save()
            console.log(doc)
            res.json({message:'saved inside db'})

        } catch (error) {
            console.log(error)
        }
       
    }
    else{
        console.log("email in req.user.email not there!!")
    }
    
    
})




const writereview=asynchandler(async(req,res)=>{
    const roomid=req.query.r
    const pid=req.query.p
    const review=req.body.review
    console.log(roomid,pid,review)
    try {
        console.log(roomid,"//////////////////////////////")
        console.log(typeof roomid, roomid)
        console.log([`${roomid}`], [`${roomid.trim()}`]);
        const exists = await doctor.findOne({ roomid: { $exists: true } });
console.log(exists ? "Field exists" : "Field missing");
console.log(await doctor.find({ roomid: roomid }));


const user = await doctor.findOne({ roomid: roomid });
    console.log(user)
    console.log(user)
    
    const patient1=await patient.findById(pid)
    user.reviews.push({
        patientname:patient1.Username,
        text:review,
        date:new Date()
    })
    await user.save()
    res.redirect('/patient/main/consult')
    } catch (error) {
        console.log(error)
    }
    
   
})
const history=asynchandler(async (req,res) => {
    const pname=req.body.pname
    const condition=req.body.condition
    const id=req.user._id
    const user=await doctor.findById(id)
    user.history.push({
        patientname:pname,
        condition:condition,
        date:new Date()
    })
    await user.save()
    console.log(user)
    res.json({"message":"success"})
})


const reviews=asynchandler(async(req,res)=>{
    const id=req.user._id
    console.log("reviews000000000000000000000000000000000")
    const user=await doctor.findById(id)
    const reviews=user.reviews
    console.log(reviews)
    res.render("Reviews.ejs",{doctor:reviews})
})

const gethistory=asynchandler(async (req,res) => {
    const id=req.user._id
    const user=await doctor.findById(id)
    res.render('history.ejs',{patient:user.reviews})
})

export {doctorwelcome,dbupload,history,gethistory,writereview,lookdb,logoutuser,uploadprofile,getsocketid,profile,pendingrequests,reviews,login,dhome,getemail,logindata}