var dayms = 24 * 60 * 60 * 1000

module.exports = function (db) {
    var exports = {}

    exports.init = (set, card) => {
        card.data = card.data || {};

        card.data.r = card.data.r || 0
        card.data.a = card.data.a || 1
        card.data.b = card.data.b || 3/(24*60)
        card.data.c = card.data.c || 1/3
        card.data.t = card.data.t
            || ((new Date()).getTime() - dayms) // 1 day behind

        return db.collection(set)
            .updateAsync({_id: card._id}, card)
    }

    exports.update = (set, card, value) => {
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

        // sensible values: 1 < x < 2
        var distinction = 1.2

        card.data.a = Math.pow(distinction, -card.data.r)
        card.data.b = 3/(24*60) * (1 / dt)
        card.data.t = (new Date()).getTime()

        return db.collection(set)
            .updateAsync({_id: card._id}, card)
    }

    exports.next = (set) => {
        return db.collection(set)
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
                return db.collection(set).findOneAsync({_id: x[0]._id})
            })
    }

    return exports
}
