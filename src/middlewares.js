import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID, // AWS에서 생성한 KEY
        secretAccessKey: process.env.AWS_SECRET // AWS에서 생성한 비밀키
    }
});

const multerUploader = multerS3({
    s3: s3,
    acl: 'public-read', // 누구나 우리의 파일을 읽을수있게 설정
    bucket: 'wetube-dani' // 아마존 AWS에서 생성한 버킷이름
});

export const localsMiddlewares = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) { // 로그인 상태일경우 접속허용
        return next()
    } else { // 비로그인상태일경우 login 페이지로 이동
        req.flash("error", "Login First."); // 메시지타입과 내용
        return res.redirect("/login")
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) { // 로그인 상태가 아닐경우 접속 허용
        return next()
    } else {
        req.flash("error", "Not authorized"); // 메시지타입과 내용
        return res.redirect("/") // 로그인상태일경우 home 으로 이동
    }
}

export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    },
    storage: multerUploader
}); // dest: 저장하고싶은 파일의경로

export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 50000000,
    },
    storage: multerUploader
});