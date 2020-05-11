var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	User = require('./models/user'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/authDemo', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
	secret: "Juro solenemente não fazer nada de bom",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
	res.render('home');
})

app.get('/secret', isLoggedIn ,(req, res) => {
	res.render('secret');
})

//Auth Routes
app.get('/register', (req, res) => {
	res.render('register');
})

app.post('/register', (req, res) => {
	//The password is not  directly saved in the database, instead it is turned into a hash and then the hash is saved in the database
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err){
			console.log(err);
			return res.render('register');
		} else {
			//Log the user in, take care of serialization ans session and use local as the strategy
			passport.authenticate('local')(req, res, () => {
				res.redirect('/secret');
			})
		}
	})
})

//Login Routes
app.get('/login', (req, res) => {
	res.render('login');
})

app.post('/login', passport.authenticate('local', {
	successRedirect: '/secret',
	failureRedirect: '/login'
}), (req, res) => {})

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

app.listen(4000, () => {
	console.log('server started');
})