//var formjson = require('../../js/form-json.js')
//var ajar = require('ajar')

var handler = {}

handler.question = function (card, el) {
    el.innerHTML = `
        <span id="sentence">${card.sentence}</span>
    `

    /*

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
   */
}

handler.answer = function (card, el) {
    el.innerHTML = `
        <div id="meaning">${card.a.meaning}</div>
        <div id="reading">${card.a.reading}</div>
        <audio id="audio" src="/jalupbeginner/${card.n}/audio"></audio>
    `
}

/*
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
*/

module.exports = handler
