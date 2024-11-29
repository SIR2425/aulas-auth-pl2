const express = require('express');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');

const bcrypt = require('bcryptjs');

/*
bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
});




// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
    // result == true
});
*/

/*
bcrypt.hash('password1', 10, function(err, hash) {
    console.log(hash);

});
*/




const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});


const app = express();

const users = {
    user1 : '$2a$10$ukRmCsGTOyexOgaiGaGQ.eb9d6eLXiIf2x/N90IHRqSIC1HI5G5Dq', // password1
    user2 : '$2a$10$KTSYcYltvLHz1c2QMY8NjekvJMi.jZ9.8InUFpwL0f5esI6FFyvji', // password2
    uuuuu : '$2a$10$KxDsfguJzhJp6OF0Tdl3euCbIQ2qPlGcSQ4VQXV2tBqgIFgQPidZe', // uuuuu
}

loggedUsers = new Set();

app.use(express.static('public'));
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/login', limiter, async (req, res) => {
    username = req.body.username;
    password = req.body.password;
    console.log('u:', username, 'p:',password);
    if (!username || !password) {
        res.status('401');
        res.redirect('/login.html');
    }

    if (!users[username]) {
        res.status(404);
        res.redirect('/login.html');
        //res.send('Credenciais Inválidas! - u');
        return;
    }
    const match = await bcrypt.compare(password,users[username]);
    console.log('match:', match);
    if(match){
        loggedUsers.add(username);
        console.log('Logged Users:', loggedUsers);
        res.cookie('username', username, { httpOnly: true });
        res.send('Login successful!');
    } else {
        res.status(404);
        //res.redirect('/login.html');
        res.send('Credenciais Inválidas!');
    }
});

app.get('/protected', (req, res) => {
    try {
        console.log('Cookie:', req.cookies);
        const username = req.cookies.username;
        console.log('Cookie:', req.cookies);
        if(loggedUsers.has(username)){
            res.send(`Olá. Informação Top Secret - Tu és o : ${req.cookies.username}`);
        } else {
            res.redirect('/login.html');
        }
    } catch {
        res.status(401);
        res.redirect('/login.html');
        }
    });

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    loggedUsers.delete(req.cookies.username);
    res.send('Logout successful!');
});


const port = 3000;
app.listen(port, () => console.log('listening on port ' + port));

