var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var harnest = require('./harnest')

module.exports = function (router, db) {

    router.get('/kanji/:char/svg', (req, res) => {
        var cp = req.params.char.codePointAt(0).toString(16)
        cp = '0'.repeat(5 - cp.length) + cp
        res.sendFile(`kanjivg/kanji/${cp}.svg`, {root: __dirname})
    })

    router.get('/kanji/:char/parts', (req, res) => {
        var cp = req.params.char.codePointAt(0).toString(16)
        cp = '0'.repeat(5 - cp.length) + cp

        fs.readFileAsync(__dirname + `/kanjivg/kanji/${cp}.svg`, 'utf8')
            .then(harnest.parse)
            .then($ => {
                var chars = $('g[kvg\\:element]').map(el => el.attribs['kvg:element'])
                db.collection('kanji')
                    .find({'a.kanji': {$in: chars}}).sort({n: 1}).toArrayAsync()
                    .then(x => res.send(x))
            })
    })

    router.get('/voice/:text', (req, res) => {
        var proc = require('child_process').spawn('open_jtalk', [
            '-x', '/usr/share/open-jtalk/dic/',
            '-m', '/usr/share/open-jtalk/voices/nitech_jp_atr503_m001.htsvoice',
            '-ow', 'voice.wav',
            '-ot', 'voice-trace.txt',
            '-a', '0.58',
            '-r', '0.9'
        ], {cwd: __dirname})
        proc.stdin.write(req.params.text)
        proc.stdin.write('\n')
        proc.stdin.end()

        proc.on('close', (ec) => {
            res.sendFile(`voice.wav`, {root: __dirname})
        })
    })

    return router
}
