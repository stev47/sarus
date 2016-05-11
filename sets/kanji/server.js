module.exports = function (router) {

    router.get('/kanji/:char', (req, res) => {
        var cp = req.params.char.codePointAt(0).toString(16)
        cp = '0'.repeat(5 - cp.length) + cp
        res.sendFile(`kanjivg/kanji/${cp}.svg`, {root: __dirname})
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
