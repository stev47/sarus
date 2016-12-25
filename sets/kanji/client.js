var formjson = require('../../js/form-json.js')
var ajar = require('ajar')

var handler = {}

handler.question = function (card, el) {
    // todo: filter out html tags
    var jap = card.q.keyword.replace(/^[a-zA-Z,\.\-\(\) 　]+/, '')
    //var keyword = card.q.keyword.replace(/([あ-ん]+)/g, '<span style="color: #e22">$1</span>')
    var keyword = card.q.keyword
    el.innerHTML = `
        <span id="keyword"><a href="http://jisho.org/search/${jap}" target="_blank">${keyword}</a></span>
        <audio id="voice" src="/kanji/voice/${jap}"></audio>
    `

    el.querySelector('#keyword').addEventListener('click', () => {
        el.querySelector('#voice').play()
    })
}

function animate (el) {
    var len = el.getTotalLength()
    var dur = len / 200 + 0.08
    el.style.transition = ''
    el.style.strokeDasharray = `${len} ${len}`
    el.style.strokeDashoffset = len
    el.style.visibility = 'visible'
    el.getBoundingClientRect()
    el.style.transition = `stroke-dashoffset ${dur}s 0.2s linear`
    el.style.strokeDashoffset = '0'
}

handler.answer = function (card, el) {
    el.innerHTML = `
        <div style="font-size: 2em">${card.a.kanji}</div>
        <div id="kanji"></div>
        <br>
        <ul id="parts"></ul>
    `
    var $ = el.querySelector

    var svg = ajar.get(`/kanji/kanji/${card.a.kanji}/svg`).then(req => {
        document.querySelector('#kanji').innerHTML = req.responseText.replace(/^[\s\S]*\]>/, '')

        var cp = card.a.kanji.codePointAt(0).toString(16)
        cp = '0'.repeat(5 - cp.length) + cp

        var i = 1
        elpath = document.getElementById(`kvg:${cp}-s${i}`)
        for (var i = 1; elpath !== null; ++i) {
            //elpath.style.visibility = 'hidden'

            var elpathnext = document.getElementById(`kvg:${cp}-s${i+1}`)
            if (!elpathnext) break

            elpath.addEventListener('transitionend', animate.bind(null, elpathnext) )
            elpath = elpathnext
        }

        var elpathstart = document.getElementById(`kvg:${cp}-s1`)
        document.querySelector('#kanji').addEventListener('click', () => {
            // rant: querySelectorAll() not being an array is driving me nuts
            [].forEach.call(document.querySelectorAll('path'), elpath => {elpath.style.visibility = 'hidden'})

            animate(elpathstart)
        })
    })

    var parts = ajar.get(`/kanji/kanji/${card.a.kanji}/parts`)
        .then(parts => {
            var els = parts.map(part => {
                var el = document.createElement('li')
                el.append(part.a.kanji + ': ' + part.q.keyword)
                return el
            })
            document.querySelector('#parts').append(...els)
        })

    return Promise.all([svg, parts])

}

handler.edit = function (card, form, cb) {
    el.innerHTML = `
        <input type="text" name="q[keyword]" placeholder="keyword">
        <input type="text" name="a[kanji]" placeholder="kanji">
    `

    form.addEventListener('submit', () => {
        var data = formjson.get(form)
        cb(data)
    })
}

module.exports = handler
