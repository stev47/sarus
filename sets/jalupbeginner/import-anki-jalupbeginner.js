'use strict'

var jszip = require('jszip')
var argv = require('yargs').argv

var Promise = require('bluebird')
var mongo = Promise.promisifyAll(require('mongodb'))
var sqlite = Promise.promisifyAll(require('sqlite3'))
var fs = Promise.promisifyAll(require('fs'))
var tmp = Promise.promisifyAll(require('tmp'))


var config = {
    dbconstr: 'mongodb://localhost:27017/myjp'
}

var srczip = fs.readFileAsync(argv._[0]).then(jszip.loadAsync)
var dbsrc = Promise.join(
    tmp.tmpNameAsync(),
    srczip.call('file', 'collection.anki2').call('async', 'nodebuffer'),
    (file, buffer) => {
        return fs.writeFileAsync(file, buffer).return(new sqlite.Database(file)).disposer(db => db.close())
    }
)
var mediasrc = srczip.call('file', 'media').call('async', 'string').then(JSON.parse).then((obj) => {
    var ret = {}
    for (var key in  obj) {
        ret[obj[key]] = key
    }
    return Promise.resolve(ret)
})

var db = mongo.MongoClient.connectAsync(config.dbconstr).disposer(db => db.close())

Promise.using(dbsrc, mediasrc, db, (dbsrc, mediasrc, db) => {

    var sql = 'select n.flds from cards c left join notes n on c.nid = n.id order by c.due asc, c.nid asc'

    var inserts = [];
    var n = 0
    return dbsrc.eachAsync(sql, (err, row) => {
        if (err) throw err

        ++n
        var data = row.flds.split('\u001f')

        var filename = mediasrc[data[1].match(/\[sound:([^\]]+)\]/)[1]]
        var audio = srczip.call('file', filename).call('async', 'nodebuffer').then((buffer) => {
            return Promise.resolve(new mongo.Binary(buffer))
        })

        var obj = {
            n: n,
            q: {
                sentence: data[0],
            },
            a: {
                meaning: data[1],
                reading: data[2],
                audio: null,
            },
        }

        inserts.push(Promise.join(obj, audio, (obj, audio) => {
            obj.a.audio = audio
            console.log(data)
            console.log(obj)
            return db.collection('jalupbeginner').insertAsync(obj)
        }))

    }).then(() => {
        return Promise.all(inserts)
    })


}).then(() => {
    process.exit()
})
