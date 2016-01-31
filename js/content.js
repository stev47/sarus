var formjson = require('./form-json.js')

var handler = {}

handler.question = function (card, el) {
    el.innerHTML = `
        ${card.q.keyword}
    `
}

handler.answer = function (card, el) {
    el.innerHTML = `
        <span style="font-size: 2em">${card.a.kanji}</span>
    `
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
