import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username : {type : String, required: true, unique : true},
    password : {type : String, required: true}
});

UserSchema.index({ username: 1 }, { unique: true });

const UserModel = mongoose.model("User", UserSchema)

UserModel.init().then(() => {
    console.log("index created");
}).catch( err => console.log("Error creating Index : " , err));

export {UserModel as User}