//var formjson = require('../../js/form-json.js')
//var ajar = require('ajar')

var handler = {}

handler.question = (card, el) => {
    el.innerHTML = `
        <span id="sentence">${card.q.sentence}</span>
    `
}

handler.answer = (card, el) => {
    el.innerHTML = `
        <div id="reading">${card.a.reading}</div>
        <div id="meaning">${card.a.meaning}</div>
        <audio id="audio" src="/jalupbeginner/${card.n}/audio"></audio>
    `
    el.querySelector('#reading').addEventListener('click', () => {
        el.querySelector('#audio').play()
    })
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
