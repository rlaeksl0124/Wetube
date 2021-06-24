import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 80 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, minLength: 20 },
    createdAt: {type:Date, required: true, default: Date.now},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0},
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"}
}); // id를 저장하고, 해당 ID가 User에서 오는것이라고 알려준다

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
})


const Video = mongoose.model("Video", videoSchema);

export default Video;