const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose.connect('mongodb://localhost:27017/Authentication', {useNewUrlParser: true, 'useUnifiedTopology': true});

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


///////////////////////////////////////////////DataBase/////////////////////////////////////////////////////////////

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database connection has been Established..');
});

const userCredendials = new mongoose.Schema({
    userName: String,
    password: String
});

const userData = mongoose.model('Credential', userCredendials);


//////////////////////////////////////////////End DataBase///////////////////////////////////////////////////////////


const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('home');
});

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const feUserName = req.body.username;
        const fePassword = req.body.password;


        userData.find({userName: feUserName}, (err, username) => {
            if (!err) {
                if (fePassword.toString() !== '') {
                    if (username.toString() === '') {
                        bcrypt.hash(fePassword, saltRounds, function (err, hash) {
                            if (!err) {
                                // Store hash in your password DB.
                                const userdata = new userData({
                                    userName: feUserName,
                                    password: hash
                                });
                                userdata.save();
                            } else {
                                console.log(err);
                                res.send(err);
                            }
                        });
                        res.render('secrets');
                    } else {
                        res.send("This User Name is already registered..!!");
                    }
                } else {
                    res.send('Password Field cannot be empty...!!!');
                }

            } else {
                console.log(err);
            }
        });


    });

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const feUserName = req.body.username;
        const fePassword = req.body.password;

        userData.findOne({userName: feUserName}, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    bcrypt.compare(fePassword, foundUser.password, function (err, result) {
                        // result == true
                        if (err) {
                            console.log(err);
                        } else {
                            if (result === true) {
                                res.render('secrets');
                            } else {
                                console.log('Invalid password...');
                                res.send("Password is not valid. Please try again...!!!!");
                            }
                        }
                    });
                } else {
                    console.log(`User is not registered with email ${feUserName}...`);
                    res.send(`User is not registered with email ${feUserName}...`);
                }
            }
        });
    })
;


app.get('/submit', (req, res) => {
    res.render('submit');
});
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});
