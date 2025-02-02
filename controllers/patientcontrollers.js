import { asynchandler } from "../utils/asynchandler.js"
import { doctor } from "../models/doctor.model.js"
import { patient } from "../models/patient.model.js"
import { Medicine } from "../models/medicine.model.js"



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



const getemail=asynchandler(async(req,res)=>{
const user = await req.user
console.log("inside getemail")
console.log(user)
console.log("ended patient verification.....")
res.json({details:user})
})


const login = asynchandler(async (req, res) => {

    res.render('patientlogin.ejs')
})


const main=asynchandler(async(req,res)=>{

    res.render('patientmain.ejs')
})


const login_details = asynchandler(async (req, res) => {

    const { email,password } = req.body
    console.log(email,password)
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



const getmed=async (req,res) => {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};
    if (query) {
      filter = {$or: [
        { medical_condition: { $regex: query, $options: "i" } },
        { drug_name: { $regex: query, $options: "i" } }
      ]}
    }

    const results = await Medicine.find(filter).lean()
    .sort({
        normalized_score: -1, // Sort by normalized score
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compute normalized score dynamically since MongoDB doesn't support sorting by computed values
    results.forEach(medicine => {
      medicine.normalized_score = medicine.rating * Math.log10(medicine.no_of_reviews + 1);
    });

    results.sort((a, b) => b.normalized_score - a.normalized_score);
    const totalRecords = await Medicine.countDocuments(filter);

    res.render("patientdrugs.ejs", {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      results,
      query: query || "All Medicines",
    });
}




const write=asynchandler(async(req,res)=>{
    const roomid=req.query.r;
    const patientid=req.user._id
    console.log(roomid,patient,'.........///////////////')
    res.render("writeReview.ejs",{"roomid":roomid,"pid":patientid})
})

export { getmed,write,logoutuser,categories,main,getemail,phome,login,login_details,signup_details}