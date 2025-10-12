import { asynchandler } from "../utils/asynchandler.js"
import { user} from "../models/schema.js"
import {dash} from '../models/dashboard.js'
import dotenv from 'dotenv'
import { posts } from "../models/posts.js"
import { notifydb } from "../models/notifications.js"
import {cloudinary} from "../utils/cloudinary.js"
dotenv.config()

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const logout = asynchandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshtoken;
console.log(req.cookies.accesstoken,"logging out")
    res.clearCookie('accesstoken', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "None" : "Lax",
    });
    res.clearCookie('refreshtoken', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? "None" : "Lax",
    });

    if (refreshToken) {
        try {
            const foundUser = await user.findOne({ refreshtoken: refreshToken });

            if (foundUser) {
                foundUser.refreshtoken = null;
                await foundUser.save({ validateBeforeSave: false });

                if (req.user && req.user.username && req.user.role) {
                    console.log("Logging out user:", req.user.username, "with role:", req.user.role);
                    const newdashEntry = new dash({
                        username: req.user.username,
                        status: "logged out",
                        role: req.user.role,
                        time: new Date()
                    });
                    await newdashEntry.save();
                }
            }
        } catch (error) {
            console.error("Backend: Error during refresh token invalidation or dashboard log:", error);
        }
    }

    return res.status(200).json({ m: "success" });
});


const changerole = asynchandler(async (req, res, next) => {
    const { username, role } = req.body
    console.log(username, role)
    try {
        const who = await user.findOne({ username: username })     
    if (who) {  
        who.role=role
        await who.save()
        res.json({ message: "success" ,currentUser:req.user.username})
       }
    else{
        res.json({ message: "usernotfound"})
    }}
        catch(error) {
        res.json({ message: "error" })
    console.log(error)
}
})

const allposts = asynchandler(async (req, res, next) => {
    try {
        
        const all=await posts.find({status:"approved"}).sort({createdAt:-1})
        if(all)
        {   console.log(all)
            res.json({ message: "success", data: all,username:req.user.username,role:req.user.role })
        }
        else {
            res.json({ message: "failure" })
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "error fetching posts" })
    }
})

const users=asynchandler(async(req,res,next)=>{
    try {
        const data=await user.find()
        if(data)
        {   console.log(req.user.username,":::",req.user)
            res.json({message:"success",data:data,currentUser:req.user.username})
        }
        else{
            res.json({message:"failure"})
        }
    } catch (error) {
        console.log(error)
    }
})
const logs=asynchandler(async(req,res,next)=>{
    try {
        const data=await dash.find()
        if(data)
        {   console.log(data)
            res.json({message:"success",data:data})
        }
        else{
            res.json({message:"failure"})
        }
    } catch (error) {
        console.log(error)
    }
})


const generate = async (userid,status) => {

    try {

        const newuser = await user.findById(userid)
        const accesstoken = newuser.generateAccessToken()
        const refreshtoken = newuser.generateRefreshToken()
        newuser.refreshtoken = refreshtoken
        await newuser.save({ validateBeforeSave: false })
        const newdash=new dash({
            username:newuser.username,
            status:status,
            role:newuser.role,
            time:new Date()
        })
        await newdash.save()
        console.log("pushed to the dash db")
        return { accesstoken, refreshtoken }

    } catch (error) {
        console.log(error);
        console.log("accestoken failed to generate!!")

    }

}

const addpost = asynchandler(async (req, res, next) => {
    const { title,description,content,status,prevtitle ,urls} = req.body
    console.log(title,prevtitle)
        if(req.user&&title&&content){

console.log("inside the addpost handler")
        if(prevtitle!=""){
            console.log('old timeline deleted')
            const post=await posts.deleteOne({username:req.user.username,title:prevtitle})
            console.log(post)
        console.log("above one is the deleted post")
     }
        console.log("saved with status:",status)
        
        const newpost = new posts({
            username: req.user.username,
            title: title,
            urls:urls,
            status:status,
            description:description,
            content: content,
        })
        await newpost.save()
        console.log("finally here")
        res.json({ message: "saved " ,username:req.user.username,role:req.user.role})
    }
    else {
        res.json({ message: "error" })
    }
})

const logindata = asynchandler(async (req, res, next) => {
    const { username, password } = req.body
    console.log(username, password)
    if (username && password) {
        const who = await user.findOne({ username: username })

        if (who) {
            const check = await who.isPasswordCorrect(password)
            console.log(check)
            if (check) {
                console.log("new token created while login")
                const { accesstoken, refreshtoken } = await generate(who._id,"logged in")
                res.cookie("refreshtoken", refreshtoken, {
                    httpOnly: true,
                    secure: IS_PRODUCTION,
                    maxAge: 15 * 24 * 60 * 60 * 1000,
                    sameSite: IS_PRODUCTION ? "None" : "Lax"

                })
                res.cookie("accesstoken", accesstoken, {
                    httpOnly: true,
                    secure: IS_PRODUCTION,
                    maxAge: 60 * 60 * 1000,
                    sameSite: IS_PRODUCTION ? "None" : "Lax"
                })
                res.json({ message: "success" })
            }

            else
                res.json({ message: "error" })

        }
        else {
            res.json({ message: "error" })
        }
    }
    else {
        res.json({ message: "error" })
    }
})


const role = asynchandler(async (req, res, next) => {
    console.log(".............................")
    if (req.user) {
        console.log(req.user.role,".............")
        res.json({ message: "success", role: req.user.role,username:req.user.username })
    }
    else
        res.json({ message: "failure" })
})



const signdata = asynchandler(async (req, res, next) => {

    const { username, password } = req.body
    try {
        if (username && password) {

            console.log(username, password)
            const newuser = new user({
                username: username,
                password: password,
                roomid:username+password
            })
           
            await newuser.save()
           
            const { accesstoken, refreshtoken } = await generate(newuser._id,"signed in")
            console.log(accesstoken,refreshtoken)
            res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure:true,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: "None",
            })
            res.cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure:true,
                maxAge: 60* 60 * 1000,
                sameSite: "None",
            })
            res.json({ message: "success" })

        }

    } catch (error) {
        res.json({ message: "failure" })
    }
})

const dashdata=asynchandler(async(req,res,next)=>{

    const data=await dash.find()
    if(data)
    {   console.log(data)
        res.json({message:"success",data:data})
    }
    else{
        res.json({message:"failure"})
    }

})

const viewpost = asynchandler(async (req, res, next) => {
    const { username,title} = req.body
    console.log(username,title)
    try {
        const post = await posts.findOne({ username: username,title:title})
        console.log("......",post)
        if (post) {
            console.log(post)
            res.json({ message: "success", data: post })
        }
        else {
            res.json({ message: "failure" })
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "error fetching posts" })
    }
})

const getreqposts = asynchandler(async (req, res, next) => {
    
    const {username, status} = req.body
    
    try {
        const post = await posts.find({ username:username,status:status})
        console.log("......",post)
        if (post) {
            console.log(post)
            res.json({ message: "success", data: post })
        }
        else {
            res.json({ message: "failure" })
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "error fetching posts" })
    }
})
const posturls = asynchandler(async (req, res, next) => {
    const { urls } = req.body
    console.log(urls)
    try {

        const uploadPromises = urls.map(url => cloudinary.uploader.upload(url, { upload_preset: 'urls_cmsapp' }));
        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map(result => result.secure_url);
        console.log(imageUrls)

        try {
            const post=await posts.findOne({username:username,title:title})
            post.urls=imageUrls
            await post.save()
            res.json({ message: "success"})
        } catch (error) {
            console.log("error in saving urls to db")
            res.json({ message: "error saving urls to db" })
            
        }
        res.json({ message: "success"});
        
    } catch (error) {
        console.log(error)
        res.json({ message: "error  posts urls to cloudinary" })
    }

   })


const searchresults = asynchandler(async (req, res, next) => {

    const q=req.query.query
    console.log("search query: ",q)
    try {
        const results = await posts.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
            ]
        });
        
        console.log("Search results:", results);
        if (results.length > 0) {
            res.json({ message: "success", data: results });
        } else {
            res.json({ message: "no results found" });
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.json({ message: "error fetching search results" });
    }
})
const getdraftpost = asynchandler(async (req, res, next) => {
    const {time,status} = req.body
    const username = req.user.username
    console.log(username," ",time)
    try {
const start = new Date(time);
const end = new Date(time);
end.setMinutes(end.getMinutes() + 1);

const post = await posts.findOne({
  username:username,
  status: status,
  createdAt: { $gte: start, $lt: end },
});

        console.log("......", post)
        if (post) {
            console.log(post)
            res.json({ message: "success", data: post })
        }
        else {
            res.json({ message: "failure" })
        }
    } catch (error) {
        console.log(error)
        res.json({ message: "error fetching posts" })
    }
})

const msgs=asynchandler(async(req,res,next)=>{
    let {role,typer,type,name}=req.body
    console.log(role,typer,type,name)

     type=type.toLowerCase().trim()
     typer=typer.toLowerCase().trim()
    let msgs=[];
    let seenmark=0;
    try {
        
        if(role=='viewer' && typer!=='notifications'){
         msgs=await notifydb.find({role:'viewer',from:name,'message.status':"pending"})}

        else if(role=='viewer'){
        console.log("seen will be marked true here because viewer sees notifications only")
        seenmark=1
        msgs = await notifydb.find({  role:'editor',to:name
})
}


        else{
        if(type=='notifications')
    {
        msgs=await notifydb.find({role:'viewer','message.status':"pending"})
        seenmark=1
    console.log("seen will be marked true here because editor sees those only ")}
        else{
        msgs=await notifydb.find({role:'viewer','message.status':type!=='approved'?"rejected":"approved"})
    console.log("here")}
}

console.log(msgs)
if(seenmark==1){
await Promise.all(
      msgs.map(async(item)=>{
        item.seen=true;
        await item.save()

    })
)}
  

       console.log("these messages are seen:\n",msgs)
        if(msgs)
        res.json({message:'success',msgs:msgs})
        else
        res.status(401).json({message:'failure'})
    } catch(error) {
        console.log(error)
        res.status(401).json({message:'failure'})
    }
})
const changestatus=asynchandler(async(req,res,next)=>{
    const {title,username,status}=req.body
    try {
        const post=await notifydb.findOne({'message.title':title,from:username})
        console.log('post status changed from ',post.message.status)
        post.message.status=status
        console.log(' to status successfully.')
        await post.save()
        
        res.json({message:'success'})
    } catch (error) {
        console.log(error)
    }
})

const addingnotif=asynchandler(async(req,res,next)=>{
    const {title,msg,desc,status,author}=req.body

    try{
    console.log("adding notif to db")
    console.log(msg)
    const newpost=new notifydb({
        from:req.user.username,
        role:'editor',
        'message.title':title,
        'message.description':desc,
        'message.status':status,
        'message.msg':msg,
        to:author
    })

    await newpost.save()
    res.json({message:"success"})}
    catch(error){
        console.log(error)
    }


})

const unseen=asynchandler(async(req,res,next)=>{

    const{name}=req.body
    console.log(name,"love")
    try {
        
        console.log("inside unseen .....")
        const role=req.user.role=='viewer'?'editor':'viewer'
        var temp=[];
        if(role=="viewer"){
         temp=await notifydb.find({role:role,seen:false})}
        else{
         temp=await notifydb.find({role:role,seen:false,to:name})}
        console.log(temp)
        res.json({unseennotifications:temp})
    } catch (error) {
        console.log(error)
        res.json({msg:"failure"})
    }
})


const addcomment = asynchandler(async (req, res, next) => {
    const { username, title, comment,likes,dislikes } = req.body  
    console.log(username, title, comment)
    try {
        const post = await posts.find({ username: username, title: title })

        if (post.length > 0) {
            console.log("post found")
            const newcomment = {
                name: req.user.username,
                data: comment,
                likes: likes,
                dislikes: dislikes
            }
            post[0].comments.push(newcomment)
            await post[0].save()    
            console.log("comment added successfully")
            res.json({ message: "success" })}
        else{
                res.json({ message: "post not found" })
            }}
            catch (error) {
        console.log(error)}
})

const likeordislike = asynchandler(async (req, res, next) => {
    const { username, title, commentId,likes,dislikes } = req.body  
    console.log(username, title, commentId)
    try {
        const post = await posts.find({ username: username, title: title })

        if (post.length > 0) {
            console.log("post found")
            const commentIndex = post[0].comments.findIndex(comment => comment._id.toString() === commentId);
            if (commentIndex === -1) {
                return res.json({ message: "comment not found" });
            }
            post[0].comments[commentIndex].likes = likes;
            post[0].comments[commentIndex].dislikes = dislikes;
            await post[0].save();
            console.log("comment added successfully")
            res.json({ message: "success" })}
        else{
                res.json({ message: "post not found" })
            }}
            catch (error) {
        console.log(error)}
})


export { signdata,likeordislike,searchresults,addcomment,getdraftpost,viewpost,changestatus,msgs,getreqposts,unseen,addingnotif, posturls,logindata,logs, allposts,addpost,changerole,users,dashdata,role,logout }





