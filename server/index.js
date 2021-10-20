const http = require('http')
const path = require('path')
const express = require('express')
const socketIo = require('socket.io')
const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 3000
const mysql = require('mysql')
const { response } = require('express')
//const bodyParser = require('body-parser');

const app = express()

const server = http.createServer(app)
const io = socketIo(server)

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
    host: "us-cdbr-east-04.cleardb.com",
    user: "bb8e5357bbd4ea",
    password: "c8d3ef09",
    database: "heroku_f6d92695a64263f"
});

//INSERTS IN THE DATABASE
/*con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO pstry (tweet, uscore) VALUES ('helpsies', '0.12')";
    con.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
});*/



// View engine
app.set('view engine', 'ejs')

// Render Home Page
var obj = {};
app.get('/', function (req, res) {
    //res.render('pages/index');
    connection.query('SELECT * FROM ps', (error, rows) => {
    if (error) throw error;

    if (!error) {
      console.log(rows)
      obj = {print: rows};
      res.render('pages/index', obj); 
    }

  })

})

app.get('/', function(req, res) {
    res.render('home');
}); 

let currentKeyword = "projectsagip2021";
app.post('/set-keyword', function(req, res){
    let keyword = req.body.keyword;
    currentKeyword = keyword;
    //console.log(currentKeyword);
    res.render('/', {
        currentKeyword
    });
});



app.use("/server", express.static('./server/'));

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL =
    'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics,entities,geo&expansions=author_id&place.fields=place_type'


const rules = [{ value: currentKeyword }]

// Get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    })
    console.log(response.body)
    return response.body
}

// Set stream rules
async function setRules() {
    const data = {
        add: rules,
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    })

    return response.body
}

// Delete stream rules
async function deleteRules(rules) {
    if (!Array.isArray(rules.data)) {
        return null
    }

    const ids = rules.data.map((rule) => rule.id)

    const data = {
        delete: {
            ids: ids,
        },
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
        },
    })

    return response.body
}

function streamTweets(socket) {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    })

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data)
            console.log(json)
            socket.emit('tweet', json)

        } catch (error) {}
    })

    return stream
}

io.on('connection', async() => {
    console.log('Client connected...')

    let currentRules

    try {
        //   Get all stream rules
        currentRules = await getRules()

        // Delete all stream rules
        await deleteRules(currentRules)

        // Set rules based on array above
        await setRules()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
    const filteredStream = streamTweets(io);
    let timeout = 0
    filteredStream.on('timeout', () => {
        // Reconnect on error
        console.warn('A connection error occurred. Reconnecting…')
        setTimeout(() => {
            timeout++
            streamTweets(io)
        }, 2 ** timeout)
        streamTweets(io)
    })
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))