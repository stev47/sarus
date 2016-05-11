var argv = require('yargs').argv

var Promise = require('bluebird')
var mongo = Promise.promisifyAll(require('mongodb'))
var sqlite = Promise.promisifyAll(require('sqlite3'))


var config = {
    dbconstr: 'mongodb://localhost:27017/myjp'
}

mongo.MongoClient.connectAsync(config.dbconstr).then((db) => {

    var dbsrc = new sqlite.Database(argv._[0])

    //db.collection('cards').drop()

    var sql = 'select n.flds from cards c left join notes n on c.nid = n.id order by c.due asc, c.nid asc'

    var n = 0
    dbsrc.each(sql, (err, row) => {

        var data = row.flds.split('\u001f')

        db.collection('cards').insert({
            n: ++n,
            q: {
                keyword: data[1],
            },
            a: {
                kanji: data[0],
            },
        })

        console.log(err, data)
    })



})
