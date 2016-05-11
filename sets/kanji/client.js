var formjson = require('../../js/form-json.js')
var ajar = require('ajar')

var handler = {}

handler.question = function (card, el) {
    // todo: filter out html tags
    var jap = card.q.keyword.replace(/^[a-zA-Z,\.\-\(\) 　]+/, '')
    //var keyword = card.q.keyword.replace(/([あ-ん]+)/g, '<span style="color: #e22">$1</span>')
    var keyword = card.q.keyword
    el.innerHTML = `
        <span id="keyword">${keyword}</span>
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
    `
    ajar.get(`/kanji/kanji/${card.a.kanji}`).then((req) => {
        el.querySelector('#kanji').innerHTML = req.responseText.replace(/^[\s\S]*\]>/,'')

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
        el.querySelector('#kanji').addEventListener('click', () => {
            for (var elpath of document.querySelectorAll(`path`)) {
                elpath.style.visibility = 'hidden'
            }

            animate(elpathstart)
        })

        //animate(document.getElementById(`kvg:${cp}-s1`))
    })
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
