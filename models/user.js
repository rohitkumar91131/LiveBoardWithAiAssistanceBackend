import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    googleId : {
        type : String,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique:true
    },
    picture : {
        type :String
    },
    refreshToken : {
        type : String
    }
})

const User =  mongoose.model("User", userSchema);
export default User