import multer from "multer";

export const localsMiddlewares = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){ // 로그인 상태일경우 접속허용
        return next()
    } else { // 비로그인상태일경우 login 페이지로 이동
        req.flash("error", "Login First."); // 메시지타입과 내용
        return res.redirect("/login")
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){ // 로그인 상태가 아닐경우 접속 허용
        return next()
    } else {
        req.flash("error", "Not authorized"); // 메시지타입과 내용
        return res.redirect("/") // 로그인상태일경우 home 으로 이동
    }
}

export const avatarUpload = multer({ dest: "uploads/avatars/", limits: {
    fileSize: 3000000,
}}) // dest: 저장하고싶은 파일의경로
export const videoUpload = multer({ dest: "uploads/videos/", limits: {
    fileSize: 50000000,
}})