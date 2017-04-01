#!/bin/bash


for setdir in src/*/; do
  setname=`basename $setdir`
  [ $setname == "default" ] && continue;

  watchify -r ./src/$setname/main.js:handler ./src/main.js -o build/$setname.js &
  node-sass -w --include-path ./src/$setname/ --include-path ./src/default/ ./src/main.scss build/$setname.css &
done

sleep 0.5

touch css/main.scss
touch js/main.js

wait
