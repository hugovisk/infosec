const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    passwordPrevious: {
        type: String,
        trim: true
    },
    isVerified: Boolean,
    isPasswordExpired: Boolean,
    expiresAt: {
        type: Date,
        default: undefined
    }
},
    { timestamps: true }
);

UserSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// funcao para criptografar a senha antes de salvar no banco de dados
UserSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();
    // bcrypt gera um salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        // usa o salt para dar hash na senha
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            if (!user.isVerified) user.passwordPrevious = ' ';
            user.password = hash;
            next();
        });
    });
});

// metodo para comparar a senha no login com o hash da senha armazenado no bd
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// metodo para comparar a senha no login com o hash da senha armazenado no bd
UserSchema.methods.comparePasswordPrevious = function (passwordNew, cb) {
    // console.log(passwordNew);
    // console.log(this.passwordPrevious);
    bcrypt.compare(passwordNew, this.passwordPrevious, (err, isMatch) => {
        // console.log(isMatch);
        if (err) return cb(err);
        cb(null, isMatch);
    });
};



module.exports = mongoose.model('User', UserSchema);