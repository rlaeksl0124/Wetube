import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"}); 
export const postJoin = async(req, res) => {
    const {name,username,email,password, password2,location} = req.body;
    if(password !== password2){
        return res.status(400).render("join", {pageTitle: "Join", errorMessage:"Password confirmation does not match."}); 
    }
    const exists = await User.exists({$or: [{username},{email}] });
    if(exists){
        return res.status(400).render("join", {pageTitle: "Join", errorMessage:"This username/email is already taken."}); 
    }
    try{
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login")    
    } catch(error){
        return res.status(400).render("join", {pageTitle: "Join", errorMessage: error._message})
    }
}

export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "login"
    const user = await User.findOne({username, socialOnly: false});
    if(!user){
        return res.status(400).render("login", {pageTitle, errorMessage: "An account with this username does not exists."})
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {pageTitle, errorMessage: "Wrong password."})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => { // step 1
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope : "read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl)
}

export const finishGithubLogin = async(req, res) => { // step 2
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,

    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept: "application/json",
        }
    })).json();
    if("access_token" in tokenRequest){ // step 3
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await(await fetch(`${apiUrl}/user`, { // 유저의 public 정보를 받아온다
            headers: {
                Authorization: `token ${access_token}`
            }
        })).json();
        const emailData = await(await fetch(`${apiUrl}/user/emails`, { // 유저의 private email을 가져오기
            headers: {
                Authorization: `token ${access_token}`
            }
        })).json();
        const emailObj = emailData.find( // 유저의 private의 email을 가져와서 primary와 verified가 true인것을 찾는다
            (email) => email.primary === true && email.verified === true);
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email})
        if(!user){
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name : userData.name,
                username : userData.login,
                email : emailObj.email,
                password : "",
                socialOnly: true,
                location : userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;    
        return res.redirect("/")    
    } else {
        return res.redirect("/login")
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/")
}

export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
}

export const postEdit = async(req, res) => {
    const {
        session : {
            user : { _id, avatarUrl }, // req.session으로 id 찾기
        },
        body : { name, email, username, location }, // form에있는정보 가져오기
        file,
    } = req;
    const updateUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email,
        username,
        location,
    }, { new: true });
    req.session.user = updateUser;
    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly === true){
        return res.redirect("/")
    }
    return res.render("users/change-password", {pageTitle: "Change Password"})
};
export const postChangePassword = async(req, res) => {
    const { 
        session: {
            user : { _id },
        },
        body: { oldPassword, newPassword, newPassword1 },
    } = req;
    const user = await User.findById(_id)
    const ok = await bcrypt.compare(oldPassword, user.password)
    if(!ok){
        return res.status(400).render("users/change-password", {pageTitle: "Change Password", errorMessage: "기존 비밀번호가 일치하지 않습니다." })
    }
    if(newPassword !== newPassword1){
        return res.status(400).render("users/change-password", {pageTitle: "Change Password", errorMessage: "새 비밀번호가 일치하지않습니다." })
    }
    user.password = newPassword
    await user.save()
    return res.redirect("/users/logout")
};


export const see = async(req, res) => {
    const {id} = req.params; // url의 id 가져오기
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if(!user){ // 유저를 찾지못할경우 status 상태표시를 404설정후 404페이지를 렌더해준다
        return res.status(404).render("404", {pageTitle:"User not Found."})
    }
    return res.render("users/profile", {pageTitle:user.name, user})
}