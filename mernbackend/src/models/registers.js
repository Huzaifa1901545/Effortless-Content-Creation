const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    personname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]


})
employeeSchema.methods.generateAuthToken = async function() {
    try {
        console.log(this._id);
        const token = jwt.sign({ _id: this._id.toString() }, "mynameishuzaifaasifiamdoingcoding");
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (e) {
        res.send("the error" + e);
        console.log("the error" + e);
    }
}
employeeSchema.pre("save", async function(next) {

    if (this.isModified("password")) {
        const saltRounds = 10;
        const isHashed = /^\$2[ayb]\$.{56}$/.test(this.password);

        if (!isHashed) {
            this.password = await bcrypt.hash(this.password, saltRounds);
        }

        if (!isHashed) {
            this.confirmpassword = await bcrypt.hash(this.password, saltRounds);
        }
    }

    next();
})

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;