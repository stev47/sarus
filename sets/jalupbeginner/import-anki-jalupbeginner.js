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
})

var db = mongo.MongoClient.connectAsync(config.dbconstr).disposer(db => db.close())

Promise.using(dbsrc, db, (dbsrc, db) => {

    var sql = 'select n.flds from cards c left join notes n on c.nid = n.id order by c.due asc, c.nid asc'

    var n = 0
    dbsrc.each(sql, (err, row) => {
        if (err) throw err

        var data = row.flds.split('\u001f')

        // TODO: return promise
        db.collection('jalupbeginner').insert({
            n: ++n,
            q: {
                sentence: data[0],
            },
            a: {
                meaning: data[1],
                reading: data[2]
            },
        })

        console.log(data)
    })

    //process.exit()

})
