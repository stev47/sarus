var Promise = require('bluebird')
var express = require('express')
var bodyParser = require('body-parser')
var mongo = Promise.promisifyAll(require('mongodb'))
var fs = Promise.promisifyAll(require('fs'))


var app = express()

app.use(bodyParser.json())

app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))

var config = require('./config.json')

var sets = fs.readdirAsync('./sets')
    .filter((file) => fs.statAsync('./sets/' + file).call('isDirectory'))


var db = mongo.MongoClient.connectAsync(config.dbconstr) //.disposer(db => db.close())

Promise.join(db, sets, (db, sets) => {

    console.log('connected to database')

    var backend = require('./backend.js')(db)

    var setrouter = express.Router()

    sets.forEach((set) => {
        app.use('/' + set, require('./sets/' + set + '/server.js')(setrouter, db))
    })

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











