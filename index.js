var Promise = require('bluebird')
var express = require('express')
var bodyParser = require('body-parser')
var mongo = Promise.promisifyAll(require('mongodb'))

var app = express()

app.use(bodyParser.json())

app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))

var config = {
    dbconstr: 'mongodb://localhost:27017/myjp'
}

var dayms = 24 * 60 * 60 * 1000

mongo.MongoClient.connectAsync(config.dbconstr).then((db) => {

    function seed (card) {
        card.data = card.data || {};

        card.data.r = card.data.r || 0
        card.data.a = card.data.a || 1
        card.data.b = card.data.b || 3/(24*60)
        card.data.c = card.data.c || 1/3
        card.data.t = card.data.t
            || ((new Date()).getTime() - dayms) // 1 day behind

        return db.collection('cards')
            .updateAsync({_id: card._id}, card)
    }

    function review (card, value) {
        if (!card.data) return false

        var maxdt = 7 * dayms
        var mindt = 60 * 1000
        var dt = Math.max(Math.min(((new Date()).getTime() - card.data.t), maxdt), mindt) / dayms

        var rmulup = card.data.r / Math.pow(2, Math.abs(value))
        if (value * card.data.r < 0 && Math.abs(card.data.r - rmulup) > Math.abs(value)) {
            card.data.r = rmulup
        } else {
            card.data.r += value
        }

        // sensible values: 1 < x, default: 1.3
        var distinction = 1.3

        card.data.a = Math.pow(distinction, -card.data.r)
        card.data.b = 3/(24*60) * (1 / dt)
        card.data.t = (new Date()).getTime()

        return db.collection('cards')
            .updateAsync({_id: card._id}, card)
    }

    console.log('connected to database')

    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get('/cards', (req, res) => {
        db.collection('cards').find().toArrayAsync()
            .then((x) => res.json(x))
    })

    app.post('/cards', (req, res) => {
        db.collection('cards').insert(req.body)
            .then((x) => res.json(x))
    })

    app.get('/cards/:n', (req, res) => {
        db.collection('cards').findOneAsync({n: parseInt(req.params.n)})
            .then((x) => res.json(x))
    })

    app.put('/cards/:n', (req, res) => {
        db.collection('cards').update({n: parseInt(req.params.n)}, req.body)
            .then((x) => res.json(x))
    })

    app.post('/cards/:n/review', (req, res) => {
        db.collection('cards').findOneAsync({n: parseInt(req.params.n)})
            .then((card) => review(card, parseFloat(req.body.value)))
            .then((x) => res.json(x))
    })

    app.post('/cards/:n/seed', (req, res) => {
        db.collection('cards').findOneAsync({n: parseInt(req.params.n)})
            .then((card) => seed(card))
            .then((x) => res.json(x))
    })

    app.get('/cardseed', (req, res) => {
        db.collection('cards').find({data: {$exists: false} }).sort({n: 1}).limit(1).nextAsync()
            .then((x) => res.json(x))
    })

    app.get('/cardreview', (req, res) => {
        //res.send('test')
        db.collection('cards')
            .aggregateAsync([
                { $match: { data: { $exists: true } } },
                { $project: {
                    r: '$data.r',
                    a: '$data.a',
                    b: '$data.b',
                    c: '$data.c',
                    td: { $multiply: [
                        1 / dayms,
                        { $subtract: [
                            (new Date()).getTime(),
                            '$data.t',
                        ] },
                    ] },
                } },
                { $project: {
                    value: { $add: [
                    /* g */ { $subtract: [ { $multiply: ['$a', '$td'] }, '$r' ] },
                    /* h */ { $subtract: [ '$c', { $multiply: ['$b', { $divide: [1, '$td'] } ] } ] },
                    ] },
                } },
                { $match: { value: { $gt: 0 } } },
                { $sort: { value: -1 } },
                // todo: sample 1 from top max(1, 0.1%) ??
                { $limit: 5 },
                { $sample: { size: 1 } },
            ], {})
            .then((x) => {
                if (!x[0])
                    return null
                return db.collection('cards').findOneAsync({_id: x[0]._id})
            })
            .then((x) => res.json(x))

    })

    app.get('/kanji/:char', (req, res) => {
        var cp = req.params.char.codePointAt(0).toString(16)
        cp = '0'.repeat(5 - cp.length) + cp
        res.sendFile(`data/kanjivg/kanji/${cp}.svg`, {root: __dirname})
    })


    app.listen(3000)


})











