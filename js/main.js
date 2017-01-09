//var Promise = require('bluebird')
var handler = require('handler')

var ajar = require('ajar')
var $ = document.querySelector.bind(document)
var $all = document.querySelectorAll.bind(document)

var cardel;
var card = {}

var baseUrl = window.location.pathname //.split('/').slice(0,2).join('/')

document.addEventListener('DOMContentLoaded', () => {

    cardel = $('#card')

    var render = (ncard, answer) => {
        card = ncard
        var q = cardel.querySelector('.q')
        var a = cardel.querySelector('.a')

        cardel.classList.toggle('back', answer)
        cardel.classList.toggle('front', !answer)

        if (!ncard) throw new Error('no card')

        var q = handler.question(card, cardel.querySelector('.q'))
        var a = handler.answer(card, cardel.querySelector('.a'))

        return Promise.all([q, a])
    }
    var clear = (err) => {
        console.log('Error', err)
        cardel.querySelector('.q').innerHTML = ''
        cardel.querySelector('.a').innerHTML = ''
        for(var x of $all('#right, #up, #down')) {
            x.setAttribute('disabled', 'disabled')
        }
    }

    // TODO: don't hide errors thrown in `render` due to clear
    var seedmode = () => {
        ajar.get(`${baseUrl}/seed`).then((x) => render(x, true))
            .then(() => {
                $('#up').setAttribute('disabled', 'disabled')
                $('#down').setAttribute('disabled', 'disabled')
                $('#right').removeAttribute('disabled')
            }, clear).then(() => {
                $('#left').innerHTML = 'Seeding …'
            })
    }
    var reviewmode = () => {
        ajar.get(`${baseUrl}/next`).then((x) => render(x, false))
            .then(() => {
                $('#right').removeAttribute('disabled')
            }, clear).then(() => {
                $('#left').innerHTML = 'Reviewing …'
            })
    }

    var seed = () => {
        ajar.post(`${baseUrl}/${card.n}/init`)
            .then(seedmode)
    }
    var review = (value) => {
        for(var x of $all('#up, #down')) {
            x.setAttribute('disabled', 'disabled')
        }
        ajar.post(`${baseUrl}/${card.n}/update`, {value: value})
            .then(reviewmode)
    }
    var answer = () => {
        cardel.classList.add('back')
        cardel.classList.remove('front')
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
        } else if (!cardel.classList.contains('back')) {
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
