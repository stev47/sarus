let db = new Promise((res, rej) => {
    let db = new loki('sarus.db', {
        autoload: true,
        autosave: true,
        autoloadCallback: () => res(db),
    })
})
let dom = new Promise((res, rej) => document.addEventListener('DOMContentLoaded', res))

var $ = document.querySelector.bind(document)
var $all = document.querySelectorAll.bind(document)

Promise.all([db, dom]).then(([db, dom]) => {
    var cardel = document.querySelector('#card')

    var colWords = db.getCollection('words') || db.addCollection('words')
    var colKanji = db.getCollection('kanji') || db.addCollection('kanji')

    $('#word').addEventListener('change', (e) => {
        $('#reading').innerHTML = ''

        let word = e.target.value
        let kanji = word.match(/[\u3000-\u303F\u4E00-\u9FFF]/g)
        if (kanji === null) return

        kanji.forEach((k, i) => {
            let li = document.createElement('li')

            let el = document.createElement('input')
            el.type = 'text'
            el.name = `reading_${i}`
            el.placeholder = k
            li.appendChild(el)

            let kanji = colKanji.findOne({char: k}) || {meaning: ''}

            el = document.createElement('input')
            el.type = 'text'
            el.name = `meaning_${i}`
            el.value = kanji.meaning
            li.appendChild(el)

            $('#reading').appendChild(li)
        })
    })
    $('#submit').addEventListener('click', e => {
        let word = $('#word').value
        let kanji = word.match(/[\u3000-\u303F\u4E00-\u9FFF]/g)
        if (kanji === null) return

        kanji.forEach((k, i) => {
            word = word.replace(
                /([\u3000-\u303F\u4E00-\u9FFF])/,
                '<ruby><rb>$1</rb><rt>' + $(`[name='reading_${i}']`).value + '</rt></ruby>'
            )

            let kanji = colKanji.findOne({char: k})

            if (kanji) {
                kanji.meaning = $(`[name='meaning_${i}']`).value
                colKanji.update(kanji)
            } else {
                kanji = {
                    char: k,
                    meaning: $(`[name='meaning_${i}']`).value
                }
                colKanji.insert(dataInit(kanji))
            }
        })

        colWords.insert(dataInit({
            word: word,
            meaning: $('#meaning').value
        }))

        $('#word').value = ''
        $('#reading').innerHTML = ''
        $('#meaning').value = ''
        $('#word').focus()
    })

    var dataInit = (card) => {
        var dayms = 24 * 60 * 60 * 1000
        card.data = card.data || {}

        card.data.r = card.data.r || 0
        card.data.a = card.data.a || 1
        card.data.b = card.data.b || 3/(24*60)
        card.data.c = card.data.c || 1/3
        card.data.t = card.data.t
            || ((new Date()).getTime() - dayms) // 1 day behind

        return card
    }




}).catch(err => { console.log(err) })
