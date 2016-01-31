var exp = {}

exp.get = function (formel) {
    var els = formel.querySelectorAll('input')

    var obj = {}

    for (var el of els) {
        var path = el.name.split('[').map((x, i) => {
            if (i > 0)
                x = x.slice(0, -1)
            if (/^[0-9]*$/.test(x))
                x = parseInt(x)
            return x
        })
        if (path[0] === NaN)
            path.unshift('')

        var target = obj
        while (path.length > 0) {
            key = path.shift()
            if (obj.hasOwnProperty(key)) {
                target = target[key]
                continue;
            }
            var nobj
            if (typeof path[0] == 'number') {
                nobj = []
            } else if (path.length == 0) {
                nobj = el.value
            } else {
                nobj = {}
            }
            if (key === NaN) {
                target.push(nobj)
                key = target.length - 1
            } else {
                target[key] = nobj
            }
            target = target[key]
        }
    }

    return obj
}

module.exports = exp
