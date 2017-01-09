var Promise = require('bluebird')

var request = Promise.promisify(require('request'), {multiArgs: true})
var htmlparser = require('htmlparser2')
var cssselect = require('css-select')

// TODO: come up with proper api
// TODO: maybe create own element prototype
// TODO: rate limiting?
// TODO: implement element.html()

var config = {
    headers: {
        'User-Agent': 'request',
    },
    baseUrl: undefined,
    concurrency: 3,
}

function merge (target, source) {
    if (!(target instanceof Object && source instanceof Object))
        throw new Error('Cannot merge non-objects')

    for (var key in source) {
        if (!(source[key] instanceof Object) || source[key] instanceof Array) {
            target[key] = source[key]
            continue
        }

        if (!(target[key] instanceof Object))
            target[key] = {}

        merge(target[key], source[key])
    }

    return target
}

var element = {
    text: function (index) {
        if (this.data)
            return this.data

        if (this.children instanceof Array)
            return this.children.map(el => element.text.call(el)).join(' ')

        return ''
    },
    isEmpty: function () {
        if (!this.children.every(c => c.type == 'text'))
            return false

        return this.text().trim() == ''
    }
}

var select = (dom, cssQuery, context) => {
    var result = cssselect(cssQuery, context || dom)

    result.forEach((el) => {
        el.text = element.text.bind(el)
        el.isEmpty = element.isEmpty.bind(el)
    })

    // convenient but ugly
    result[0] && Object.assign(result, result[0])

    return result
}

exports.config = merge.bind(null, config)

exports.parse = (html) => {
    return Promise.fromCallback((cb) => {
        var domHandler = new htmlparser.DomHandler(cb)
        var parser = new htmlparser.Parser(domHandler)

        parser.write(html)
        parser.done()
    })
        .then(dom => select.bind(null, dom))
}

exports.get = (url) => {
    if (url instanceof Array)
        Promise.map(url, url => exports.get.bind(null, url), {concurrency: config.concurrency})

    var requestOptions = {
        url: url,
        headers: config.headers,
        baseUrl: config.baseUrl,
    }

    return request(requestOptions)
        .then(response => exports.parse(response[1]))
}

