#!/bin/bash


node-sass -w css/main.scss public/css/main.css &

watchify js/main.js -o public/js/main.js &

nodemon --ignore '*.svg' index.js &

sleep 0.5

touch css/main.scss
touch js/main.js

wait
