const app         = require('express')();
const bodyParser  = require('body-parser');
const passport    = require('passport');
const mongoose    = require('mongoose');
const cors        = require('cors');

const config      = require('./config/config');
const passportMiddleware = require('./middleware/passport');
const routes = require('./routes.js');

const port        = process.env.PORT || 5000;

// const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
passport.use(passportMiddleware);

app.get('/', function(req, res) {
    return res.send(' Ae Champs... o API esta em http://localhost:' + port + '/api');
});

app.use('/api', routes);

mongoose.connect(config.db, { useNewUrlParser: true , useCreateIndex: true });

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Conexao com MongoDB realizada com sucesso!');
});

connection.on('err', (err) => {
    console.log('Conexao com MongoDB deu ruim :(' + err);
    process.exit();
});

app.listen(port);
console.log('OMG: http://localhost:' + port);