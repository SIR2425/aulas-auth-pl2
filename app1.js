const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const users = {
    user1 : 'password1',
    user2 : 'password2',
    uuuuu : 'uuuuu',
}

loggedUsers = new Set();

app.use(express.static('public'));
app.use(express.urlencoded({ extended : true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/login', (req, res) => {
    username = req.body.username;
    password = req.body.password;
    console.log('u:', username, 'p:',password);
    if(users[username] &&  users[username] === password){
        loggedUsers.add(username);
        console.log('Logged Users:', loggedUsers);
        res.cookie('username', username, { httpOnly: true });
        res.send('Login successful!');
    } else {
        res.status(404);
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

