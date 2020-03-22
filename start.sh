#!/bin/bash
if [ $1 == '--help' ]
    then 
        echo "--datalayer: start only data layer microservices";
        echo "--services: start only process centric services"
        echo "--all or nothing: start all microservices"
fi

if [ $1 == '--datalayer' ] || [ $1 == '--all' ] || [ $1 == '' ]
    then
        # Start mongodb 
        docker build -f mongo/Dockerfile -t mongo .
        docker run --name mongo --net host -p 27017:27017 -v ~/data:/data/db -d mongo
        # Start group data layer
        docker build -f data_layer/group_data_layer/Dockerfile -t group_dl .
        docker run --name group_dl --net host -p 3333:3333 -e PROD=true -d group_dl
        # Start space data layer
        docker build -f data_layer/space_data_layer/Dockerfile -t space_dl .
        docker run --name space_dl --net host -p 3334:3334 -e PROD=true -d space_dl
        # Start user data layer
        docker build -f data_layer/user_data_layer/Dockerfile -t user_dl .
        docker run --name user_dl --net host -p 3335:3335 -e PROD=true -d user_dl
fi

if [ $1 == '--services' ] || [ $1 == '--all' ] || [ $1 == '' ]
    then
        # Start finances service

        # Start spaces service

        # Start groups service

        # Start identity server
        docker build -f microservices/auth/Dockerfile -t auth .
        docker run --name auth --net host -p 3000:3000 -e PROD=true -d auth
fi