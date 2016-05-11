var Promise = require('bluebird')
var express = require('express')
var bodyParser = require('body-parser')
var mongo = Promise.promisifyAll(require('mongodb'))


var app = express()

app.use(bodyParser.json())

app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

app.use('/:set/css', express.static(__dirname + '/public/css'))
app.use('/:set/js', express.static(__dirname + '/public/js'))

var config = require('./config.json')


mongo.MongoClient.connectAsync(config.dbconstr).then((db) => {

    var backend = require('./backend.js')(db)

    console.log('connected to database')

    /* TODO: for each set dir */
    var setrouter = express.Router()
    app.use('/kanji', require('./sets/kanji/server.js')(setrouter))

    app.get('/:set', (req, res) => {
        res.render('index')
    })

    app.post('/:set', (req, res) => {
        db.collection(req.params.set).insert(req.body)
            .then((x) => res.json(x))
    })

    app.get('/:set/next', (req, res) => {
        backend.next(req.params.set)
            .then((x) => res.json(x))
    })

    app.get('/:set/seed', (req, res) => {
        db.collection(req.params.set).find({data: {$exists: false} }).sort({n: 1}).limit(1).nextAsync()
            .then((x) => res.json(x))
    })

    app.get('/:set/:n', (req, res) => {
        db.collection(req.params.set).findOneAsync({n: parseInt(req.params.n)})
            .then((x) => res.json(x))
    })

    app.put('/:set/:n', (req, res) => {
        db.collection(req.params.set).update({n: parseInt(req.params.n)}, req.body)
            .then((x) => res.json(x))
    })

    app.post('/:set/:n/update', (req, res) => {
        db.collection(req.params.set).findOneAsync({n: parseInt(req.params.n)})
            .then((card) => backend.update(req.params.set, card, parseFloat(req.body.value)))
            .then((x) => res.json(x))
    })

    app.post('/:set/:n/init', (req, res) => {
        db.collection(req.params.set).findOneAsync({n: parseInt(req.params.n)})
            .then((card) => backend.init(req.params.set, card))
            .then((x) => res.json(x))
    })

    app.listen(3001)
})











