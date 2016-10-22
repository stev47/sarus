#!/bin/bash


node-sass -w css/main.scss public/css/main.css &

for setdir in sets/*/; do
  setname=`basename $setdir`

  watchify -r ./sets/$setname/client.js:handler js/main.js -o public/js/${setname}.js &
done


nodemon --ignore '*.svg' index.js &

sleep 0.5

touch css/main.scss
touch js/main.js

wait
