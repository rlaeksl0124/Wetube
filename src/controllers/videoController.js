import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";


export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt:-1}).populate("owner");
    res.render("home", {pageTitle: "Home", videos}); 
}
export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video Not Found."})
    }
    return res.render("watch", {pageTitle: video.title, video});
}
export const getEdit = async(req, res) => {
    const { id } = req.params;
    const { user: {_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video Not Found."})
    }
    if(String(video.owner) !== String(_id)){
        req.flash("error", "You are not the woner of the video."); // 메시지타입과 내용
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle: `Edit: ${video.title}`, video});
}


export const postEdit = async(req, res) => {
    const { user: {_id}} = req.session;
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({_id:id});
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video Not Found."})
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    })
    req.flash("success", "Changes saved.")
    return res.redirect(`/videos/${id}`)
}


export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle : "Upload Video"});
}

export const postUpload = async(req, res) => {
    const { user: {_id} } = req.session;
    const {video, thumb} = req.files;
    const {title, description, hashtags} = req.body;
    try{
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: video[0].path,
            thumbUrl: `/uploads/videos/${thumb[0].filename}`,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch(error){
        return res.status(400).render("upload", {pageTitle : "Upload Video", errorMessage: error._message});
    }
}

export const deleteVideo = async(req, res) => {
    const { id } = req.params;
    const { user: {_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle: "Video Not Found."})
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async(req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword){
        videos = await Video.find({
            title: {$regex: new RegExp(keyword, "i")},
        }).populate("owner");
    }
    return res.render("search", {pageTitle:"Search", videos})
}

export const registerView = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404)
    }
    video.meta.views += 1
    await video.save();
    return res.status(200)
}

export const createComment = async(req, res) => {
    const {
        session : { user }, // 유저의 정보
        body : { text }, // 코멘트 내용
        params : { id }, // 비디오의 id
    } = req

    const video = await Video.findById(id);
    if(!video){ // video를 찾지못할경우
        return res.sendStatus(404); // sendStatus() 는 상태코드를보내고 연결을 종료한다
    }
    const users = await User.findById(user._id)
    const comment = await Comment.create({
        text,
        name: user.name,
        avatarUrl: user.avatarUrl,
        owner: user._id,
        video: id,
    })
    video.comments.push(comment._id) // video에 comments에 push한다. comment.id를
    video.save() // video 저장
    users.comment.push(comment._id);
    users.save();
    return res.status(201).json({newCommentId: comment._id}); // commentSection.js 댓글 ID 보내기
}

export const deleteComment = async(req, res) => {
    const { videoId, commentId } = req.params; // 댓글 ID
    const { user : { _id }} = req.session; // 유저 ID
    const comment = await Comment.findById(commentId);
    const video = await Video.findById(videoId);
    if(!comment){
        return res.sendStatus(404);
    }
    if(String(comment.owner) !== String(_id)){
        return res.sendStatus(404);
    }
    await Comment.findByIdAndDelete(commentId);
    video.comments.remove(commentId);
    video.save();
    return res.sendStatus(200)
}