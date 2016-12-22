#!/bin/bash



for setdir in sets/*/; do
  setname=`basename $setdir`
  [ $setname == "default" ] && continue;

  watchify -r ./sets/$setname/client.js:handler js/main.js -o public/js/$setname.js &
  node-sass -w --include-path ./sets/$setname/ --include-path ./sets/default/ css/main.scss public/css/$setname.css &
done


nodemon --ignore '*.svg' index.js &

sleep 0.5

touch css/main.scss
touch js/main.js

wait
