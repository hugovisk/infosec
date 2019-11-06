var express         = require('express'),
    routes          = express.Router();
var userController  = require('./controller/user-controller');
var passport        = require('passport');

routes.get('/', (req, res) => {
    return res.send('Ola, voce acessou o API de Autenticacao o/');
});

routes.post('/register', userController.preRegisterUser);
routes.post('/reset', userController.resetPassword);
routes.post('/login', userController.loginUser);
routes.post('/recovery', userController.recoveryPassword);

// rota que define a autenticacao pelo token -- ver 26'35"
routes.get('/auth', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({ msg: `Pode pa ${req.user.email}! FIM` });
});


module.exports = routes;