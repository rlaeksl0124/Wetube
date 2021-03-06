import bcrypt from "bcrypt"
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique: true},
    avatarUrl: String,
    socialOnly: {type:Boolean, default:false},
    username: {type:String, required:true, unique: true},
    password: {type:String},
    name: {type:String, required:true},
    location: String,
    comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video"}],
}); // 사용자는 여러개의 video를 가질수있어서 배열을 갖는다. 비디오와 연결됨

userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model("User", userSchema);

export default User;