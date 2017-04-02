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
    $('#dbdata').innerHTML = ''
    var cardel = document.querySelector('#card')

    var colWords = db.getCollection('words') || db.addCollection('words')
    var colKanji = db.getCollection('kanji') || db.addCollection('kanji')

    window.addEventListener('beforeunload', e => db.close())

    var inputChange = e => {
        $('#reading').innerHTML = ''

        let word = $('#word').value

        word.split('').forEach((k, i) => {
            if (!/[\u3000-\u303F\u4E00-\u9FFF]/.test(k))
                return

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
    }

    $('#submit').addEventListener('click', e => {
        let word = $('#word').value

        word = word.split('').map((k, i) => {
            if (!/[\u3000-\u303F\u4E00-\u9FFF]/.test(k))
                return k

            let kanji = colKanji.findOne({char: k})

            k = '<ruby><rb>' + k + '</rb><rt>' + $(`[name='reading_${i}']`).value + '</rt></ruby>'

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

            return k
        }).join('')

        colWords.insert(dataInit({
            word: word,
            meaning: $('#meaning').value
        }))

        $('#word').value = ''
        $('#reading').innerHTML = ''
        $('#meaning').value = ''
        fetch(colWords)
        showQ(colWords)
        $('#word').focus()
    })

    $('#reset').addEventListener('click', e => {
        colWords.find().forEach(word => {
            colWords.update(dataInit(word))
        })
        fetch(colWords)
        showQ(colWords)
    })

    $('#clear').addEventListener('click', e => {
        colWords.clear()
        colKanji.clear()
        fetch(colWords)
        showQ(colWords)
    })

    $('#delete').addEventListener('click', e => {
        colWords.remove(card)
        fetch(colWords)
        showQ(colWords)
    })

    $('#export').addEventListener('click', e => {
        db.save()
        let x = db.serialize()
        $('#dbdata').value = x
    })

    $('#import').addEventListener('click', e => {
        let x = $('#dbdata').value

        let dbtmp = db

        db = new loki('sarus.db', {
            autosave: true,
        })
        db.loadJSON(x)

        colOldWords = colWords
        colOldKanji = colKanji

        colWords = db.getCollection('words') || db.addCollection('words')
        colKanji = db.getCollection('kanji') || db.addCollection('kanji')

        colWords.find().forEach(x => {
            x = dataInit(x)
            xOld = colOldWords.get(x.$loki)
            x.data = (xOld)? xOld.data : x.data

            console.log(x)
            colWords.update(x)
        })

        db.save()
        fetch(colWords)
        showQ(colWords)
    })

    $('#cardmode').addEventListener('change', e => {
        fetch(colWords)
        showQ(colWords)
    })

    var dataInit = (card) => {
        var dayms = 24 * 60 * 60 * 1000
        card.data = {
            r: 0,
            a: 1,
            b: 3/(24*60),
            c: 1/3,
            t: (new Date()).getTime() - dayms, // 1 day behind
        }

        return card
    }

    var card = null

    var fetch = (col) => {
        var dayms = 24 * 60 * 60 * 1000
        var now = (new Date()).getTime()

        card = col.mapReduce(x => {
            let td = (now - x.data.t) / dayms
            let v = x.data.a * td - x.data.r + x.data.c - x.data.b / td

            if (v < 0) return null

            x.v = v
            return x
        }, array => {
            let cur = null
            array.forEach(x => {
                if (x === null) return
                if (!cur || x.v > cur.v) cur = x
            })
            if (cur) delete cur.v
            return cur
        })
        console.log('FETCH', card)
    }

    var showQ = (col) => {
        cardel.innerHTML = ''
        cardel.className = ''
        if (card === null) {
            window.setTimeout(() => {fetch(colWords); showQ(colWords)}, 10 * 1000)
            return
        }

        let mode = $('#cardmode').cardmode.value

        cardel.className = 'q'
        cardel.classList.add(mode)
        let q, a, qk, ak, am;

        switch (mode) {
            case 'j2fe':
                qk = document.createElement('span')
                qk.style.fontSize = '2em'
                qk.innerHTML = card.word.replace(/<ruby><rb>([^<]+)<\/rb><rt>[^<]+<\/rt><\/ruby>/g, '$1')

                q = document.createElement('div')
                q.id = 'q'
                q.appendChild(qk)

                ak = document.createElement('span')
                ak.style.fontSize = '2em'
                ak.innerHTML = card.word

                am = document.createElement('span')
                am.innerHTML = card.meaning

                a = document.createElement('div')
                a.id = 'a'
                a.appendChild(ak)
                a.appendChild(document.createElement('br'))
                a.appendChild(am)

                break;
            case 'jf2e':
                qk = document.createElement('span')
                qk.style.fontSize = '2em'
                qk.innerHTML = card.word

                q = document.createElement('div')
                q.id = 'q'
                q.appendChild(qk)

                ak = document.createElement('span')
                ak.style.fontSize = '2em'
                ak.innerHTML = card.word

                am = document.createElement('span')
                am.innerHTML = card.meaning

                a = document.createElement('div')
                a.id = 'a'
                a.appendChild(ak)
                a.appendChild(document.createElement('br'))
                a.appendChild(am)

                break;
            case 'e2jf':
                qk = document.createElement('span')
                qk.innerHTML = card.meaning

                q = document.createElement('div')
                q.id = 'q'
                q.appendChild(qk)

                ak = document.createElement('span')
                ak.style.fontSize = '2em'
                ak.innerHTML = card.word

                a = document.createElement('div')
                a.id = 'a'
                a.appendChild(ak)

        }

        cardel.appendChild(q)
        cardel.appendChild(a)

        //handler.show(update)
    }

    var showA = (col) => {
        cardel.classList.remove('q')
        cardel.classList.add('a')
    }

    var update = (col, value) => {
        if (!card.data) return false

        var dayms = 24 * 60 * 60 * 1000
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
        var distinction = 1.15

        card.data.a = Math.pow(distinction, -card.data.r)
        card.data.b = 3/(24*60) * (1 / dt)
        card.data.t = (new Date()).getTime()

        col.update(card)
        console.log('UPDATE', card)
    }


    fetch(colWords)
    showQ(colWords)

    $('#word').addEventListener('change', inputChange)
    inputChange()

    document.addEventListener('keyup', (e) => {
        if (cardel.classList.contains('q')) {
            switch (e.key) {
                case 'ArrowRight':
                case 'Space':
                    showA()
                    break;
            }
        } else if (cardel.classList.contains('a')) {
            switch (e.key) {
                case 'ArrowUp':
                    update(colWords, 1)
                    fetch(colWords)
                    showQ(colWords)
                    break;
                case 'ArrowRight':
                case 'Space':
                    update(colWords, 0)
                    fetch(colWords)
                    showQ(colWords)
                    break;
                case 'ArrowDown':
                    update(colWords, -1)
                    fetch(colWords)
                    showQ(colWords)
                    break;
            }
        }
    })




}).catch(err => { console.log(err) })
