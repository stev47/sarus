var handler = require('handler')

var ajar = require('ajar')
var $ = document.querySelector.bind(document)
var $all = document.querySelectorAll.bind(document)

var cardel;
var card = {}

document.addEventListener('DOMContentLoaded', () => {

    cardel = $('#card')

    var render = (ncard, answer) => {
        card = ncard
        var q = cardel.querySelector('.q')
        var a = cardel.querySelector('.a')

        cardel.classList.toggle('answer', answer)

        if (!ncard) throw new Error('no card')

        handler.question(card, cardel.querySelector('.q'))
        handler.answer(card, cardel.querySelector('.a'))
    }
    var clear = () => {
        cardel.querySelector('.q').innerHTML = ''
        cardel.querySelector('.a').innerHTML = ''
        for(var x of $all('#right, #up, #down')) {
            x.setAttribute('disabled', 'disabled')
        }
    }

    // TODO: don't hide errors thrown in `render` due to clear
    var seedmode = () => {
        ajar.get('/kanji/seed').then((x) => render(x, true))
            .then(() => {
                $('#up').setAttribute('disabled', 'disabled')
                $('#down').setAttribute('disabled', 'disabled')
                $('#right').removeAttribute('disabled')
            }, clear).then(() => {
                $('#left').innerHTML = 'Seeding …'
            })
    }
    var reviewmode = () => {
        ajar.get('/kanji/next').then((x) => render(x, false))
            .then(() => {
                $('#right').removeAttribute('disabled')
            }, clear).then(() => {
                $('#left').innerHTML = 'Reviewing …'
            })
    }

    var seed = () => {
        ajar.post(`/kanji/${card.n}/init`)
            .then(seedmode)
    }
    var review = (value) => {
        for(var x of $all('#up, #down')) {
            x.setAttribute('disabled', 'disabled')
        }
        ajar.post(`/kanji/${card.n}/update`, {value: value})
            .then(reviewmode)
    }
    var answer = () => {
        cardel.classList.add('answer')
        $('#up').removeAttribute('disabled')
        $('#down').removeAttribute('disabled')
        $('#right').setAttribute('disabled', 'disabled')
    }


    var left = () => {
        cardel.classList.toggle('seed')
        if (cardel.classList.contains('seed')) {
            seedmode()
        } else {
            reviewmode()
        }
    }
    var right = () => {
        if (cardel.classList.contains('seed')) {
            seed()
        } else if (!cardel.classList.contains('answer')) {
            answer()
        }
    }
    var up = () => review(1)
    var down = () => review(-1)


    $('#left').addEventListener('click', left)
    $('#right').addEventListener('click', right)
    $('#up').addEventListener('click', up)
    $('#down').addEventListener('click', down)

    document.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                $('#left').click()
                break;
            case 'ArrowUp':
                $('#up').click()
                break;
            case 'ArrowRight':
                $('#right').click()
                break;
            case 'ArrowDown':
                $('#down').click()
                break;
        }
    })


    reviewmode()
})
