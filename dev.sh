#!/bin/bash


node-sass -w css/main.scss public/css/main.css &

watchify js/main.js -o public/js/main.js &

nodemon index.js &

sleep 0.5

touch public/css/main.css
touch public/js/main.js

wait
