module.exports = function (router, db) {

    router.get('/:n/audio', (req, res) => {
        db.collection('jalupbeginner').findOneAsync({n: parseInt(req.params.n)})
            .then((x) => res.send(x.a.audio.buffer))
    })

    return router
}
