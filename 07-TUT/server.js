const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 3500;
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');

//Custom Middleware Logger
app.use(logger);

const whitelist = ['https://www.google.com', 'http://127.0.0.1:5500','http://localhost:3500'];
const corsOptions = {
    origin : (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
// For handling Form Data.
app.use(express.urlencoded({extended : false}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '/public')));

app.get('^/$|/index|/index(.html)?', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

//Route handlers
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempted to load hello.html!');
    next();
}, (req, res) => {
    res.send('Hello World!');
});

const one = (res,req, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req ,res) => {
    console.log('three');
    res.send('Finished');
}

app.get('/chain(.html)?', [one,two,three]);

app.get('/old-page(.html)?', (req,res) => {
    res.redirect(301, '/new-page.html');
});

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('.html')) {
        res.sendFile(path.join(__dirname, 'views','404.html'));
    } else if (req.accepts('json')) {
        res.json({error: "404 not FOUND"});
    } else {
        res.join({error: "404 not FOUND"})
    }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));