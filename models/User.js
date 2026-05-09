import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userData = mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email Address"],
        unique:[true,"Email already exists"]
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"Password should contain more than 6 character"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
})

userData.pre("save",async function (){  // yaha next ka use isliye nhi kiye kyoki async hain async internally promise return krta hain fir mongoose wait krta hain 
    if(!this.isModified("password")){// prmoise resolve hone ka fir next ya save hota hain automatically 
        return 
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash
    return 
}
)

userData.methods.comparePassword = async function (password){  // ye user ke pass custom methods hote hain har mongoose document ke sath 
    return await bcrypt.compare(password,this.password)
}

export default mongoose.model("User",userData)
