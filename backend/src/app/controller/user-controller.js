// TODO: receber o email do usario e enviar link de autenticacao com senha gerada
// randomicamente, o token de acesso deve expirar depois de x tempo e excluir o usuario, apos acessar 
// o link devera redefinir sua senha que devera indicar a complexidade.
// o reenvio de senha inicia o processo de autenticacao, porem nao exclui usuario.
// a senha ira expirar depois de x tempo e devera ser trocada, nao podendo ser a anterior
// no front end deve conter os campos senha atual, nova senha, confirmar nova senha  

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mailer = require('nodemailer');
const config = require('../config/config');
const configMailer = require('../config/config-mailer');
const moment =  require('moment');

const transporter = mailer.createTransport(configMailer)

// cria o token e assina com a chave privada jwtSecret
function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: 2000 //expira em 20 segundos
    });
}

function createEmailToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: 200 //expira em 20 segundos
    });
}

// cria senha aleatoria
function createPassword() {
    const string = '2345679abcdefghijkmnopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ.;/*&%$#-+';
    let pass = '';
    const len = string.length;
    for (let i = 0; i < 8; i++) {
        pass += string[Math.floor(Math.random() * len)];
    }
    return pass;
}

exports.preRegisterUser = (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ 'msg': 'Voce precisa de email para iniciar registro' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).json({ 'msg': err });
        }

        if (user) {
            return res.status(400).json({ 'msg': 'Usuario com este email ja existe' });
        }

        req.body.isVerified = false;
        req.body.isPasswordExpired = false;
        req.body.password = createPassword();

        const newUser = User(req.body);
        const token = createEmailToken(newUser);
        newUser.expiresAt = moment().add(2, 'minutes');
        newUser.save((err, user) => {
            if (err) {
                return res.status(400).json({ 'msg': err });
            }
            const message = {
                from: 'registro@seguraca.com',
                to: req.body.email,
                subject: 'Autenticacao de usuario',
                text: 'Acesse o link para validar seu email senha',
                html: `<p>Sua identificao e' <strong>${req.body.email}</strong></p><p>Sua senha de autenticacao e' <strong>${req.body.password}<strong></p><br>
            <p> Acesse o link e faca a validacao do seu registro</p><br>
            <a href="http:/localhost:8100/reset-password?token=${token}">www.seguranca.com/verifica</a>` // TODO: link de mudanca de senha 
            }
            transporter.sendMail(message, (err, info) => {
                if (err) {
                    return res.status(400).json({ msg: 'Nao enviou :(' });
                }
                return res.status(201).json({ msg: 'Email de pre registro enviado o/', user });
            });
            // return res.status(201).json(user);
        });
    })
};

exports.resetPassword = (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.passwordNew || !req.body.passwordNewConfirm) {
        return res.status(400).json({ 'msg': 'Voce precisa da senha inicial e a nova para continuar' });
    }
    if (req.body.passwordNew !== req.body.passwordNewConfirm) {
        return res.status(400).json({ 'msg': 'Nova senha nao conhecide com sua confirmacao' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).json({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'Usuario nao existe' });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                if (req.body.password === req.body.passwordNew) {
                    return res.status(400).json({ msg: 'Senha tem que ser diferente da atual' });
                }

                user.comparePasswordPrevious(req.body.passwordNew, (err, isEqual) => {
                    if (!isEqual) {
                        user.isVerified = true;
                        user.isPasswordExpired = user.isPasswordExpired ? false : false;
                        User.findById(user._id, 'password', (err, previous) => {
                            if (err) return res.status(400).json({ msg: err });
                            user.passwordPrevious = previous.password;
                        })
                        user.password = req.body.passwordNew;
                        user.expiresAt = undefined;
                        user.save((err, userUpdate) => {
                            if (err) {
                                return res.status(400).json({ msg: err });
                            }
                            return res.status(201).json(userUpdate);
                        });
                    } else return res.status(400).json({ msg: 'Senha tem que ser diferente da anterior' });
                });
            } else {
                return res.status(400).json({ msg: 'Senha invalida' });
            }
        });
    });
};
// exports.registerUser = (req, res) => {
//     if (!req.body.email || !req.body.password) {
//         return res.status(400).json({ 'msg': 'Voce precisa de email e senha para registrar' });
//     }

//     User.findOne({ email: req.body.email }, (err, user) => {
//         if (err) {
//             return res.status(400).json({ 'msg': err });
//         }

//         if (user) {
//             return res.status(400).json({ 'msg': 'Usuario ja existe' });
//         }

//         let newUser = User(req.body);
//         newUser.save((err, user) => {
//             if (err) {
//                 return res.status(400).json({ 'msg': err });
//             }
//             return res.status(201).json(user);
//         });
//     })
// };

exports.loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ 'msg': 'Voce precisa de email e senha para logar' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).json({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'Usuario nao existe' });
        }

        const updatedAt = (moment(user.updatedAt).add(1, 'minutes'));
        const now = new Date();
        if ( updatedAt < now ) {
            user.isPasswordExpired = true;
            return res.status(400).json({ 'msg': 'Sua senha expirou, recupere nova senha' });
        } 

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch || err) {
                return res.status(400).json({ msg: 'Senha invalida' });
            }

            if (!user.isVerified) {
                return res.status(400).json({ msg: 'Necessario fazer verificacao do email' });
            }

            // TODO: fazer validacao de tempo de expiracao da senha
            // user.timestamp.updatedAt > 3 meses
            // direcionar para recoveryPassword

            return res.status(200).json({ token: createToken(user) });

        });
    });
};

exports.recoveryPassword = (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ 'msg': 'Voce precisa do email para recuperar a senha' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).json({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'Usuario nao existe' });
        }

        const newPassword = createPassword();
        user.password = newPassword;
        console.log(user.password);
        const token = createEmailToken(user);
        user.save((err, userUpdate) => {
            if (err) {
                return res.status(400).json({ msg: err });
            }

            const message = {
                from: 'ajuda@seguraca.com',
                to: req.body.email,
                subject: 'Recupecao de senha',
                text: 'Acesse o link para recuperar sua senha',
                html: `
            <p>Sua identificao e' <strong>${req.body.email}</strong>
            <p> Para redefinir sua senha acesse o link e use a senha <strong>${newPassword}</strong> <br>
            <a href="http:/localhost:8100/reset-password?token=${token}">www.seguranca.com/recupera</a>`
            }

            transporter.sendMail(message, (err, info) => {
                if (err) {
                    return res.status(400).json({ msg: 'Nao enviou :(' });
                }
                return res.status(201).json({ msg: 'Email de recuperacao enviado o/' });
            });
        });
    });
};







