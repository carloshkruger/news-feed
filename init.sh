#!/bin/bash

cd ./infra && bash ./init-infra.sh && cd ..

cd fanout-service && npm install && cd ../feeds-service && npm install && cd ../posts-service && npm install && cd ../users-service && npm install && cd ..


