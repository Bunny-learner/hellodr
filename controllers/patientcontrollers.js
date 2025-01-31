import { asynchandler } from "../utils/asynchandler.js"
import { doctor } from "../models/doctor.model.js"
import { patient } from "../models/patient.model.js"



const generate = async (userid) => {

    try {


        const user = await patient.findById(userid)
        console.log(user)
        const accesstoken = user.generateaccesstoken()
        const refreshtoken = user.generaterefreshtoken()

        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refreshtoken }

    } catch (error) {
        console.log(error);
        console.log("accestoken failed to generate!!")

    }

}

const patientwelcome = asynchandler(async (req, res) => {
    res.render("patientwelcome.ejs")

})

const getemail=asynchandler(async(req,res)=>{
const user = await req.user
console.log("inside getemail")
console.log(user)
console.log("ended patient verification.....")
res.json({details:user})
})

const signup = asynchandler(async (req, res) => {


    res.render('patientsignup.ejs')
})

const login = asynchandler(async (req, res) => {

    res.render('patientlogin.ejs')
})


const main=asynchandler(async(req,res)=>{

    res.render('patientmain.ejs')
})


const login_details = asynchandler(async (req, res) => {

    const { email,password } = req.body
    const doesuser = await patient.findOne({ email: email })
    const id = doesuser._id
    if (!doesuser) {
        return res.redirect('/patient/signup?alert=Please signup, account not found!');
    }
    const ans=await doesuser.isPasswordcorrect(password)
    
    
    if (!ans){
        return res.redirect('/patient/signup?alert=Please signup ,account not found!!')

    }
        
    
        const { accesstoken, refreshtoken } = await generate(id);
        console.log("accesstoken:" + accesstoken)
        console.log("refreshtoken:" + refreshtoken)
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accesstoken", accesstoken)
            .cookie("refreshtoken", refreshtoken, options)
            .cookie("who","patient")
            .redirect('/patient/main?alert=Successfully Logged in!!')
})


const signup_details = asynchandler(async (req, res) => {

    const {Username,email, password ,age} = req.body

    const output = await patient.findOne({ email: email })
    console.log(output)
    if (output) {
        console.log('already there')
        res.redirect('/patient/signup?User already Present!!')
    }

    const newuser = new patient({
        email: email,
        age:age,
        Username:Username,
        password: password
    })
    await newuser.save()
    res.redirect('/patient/login?alert=SignUp was succesfull!\n please Login')





})

const logoutuser=asynchandler(async(req,res)=>{
    await patient.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshtoken:1,
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
    .redirect('/patient?alert=successfully logged out!!')
})


const phome=asynchandler(async(req,res)=>{
    const category=req.params.category
    const doctors=await doctor.find({specality:category})
    const Username=req.user.Username
    const email=req.user.email
    res.render("patientconsult.ejs",{doctors:doctors,email:email,username:Username})
})

const categories=asynchandler(async(req,res)=>{

    res.render("categories.ejs")
})



export { patientwelcome, logoutuser,categories,main,getemail,phome,signup,login,login_details,signup_details}