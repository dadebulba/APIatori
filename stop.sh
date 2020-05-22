#!/bin/bash
if [ $1 == '--help' ]
    then 
        echo "--datalayer: stop only data layer microservices";
        echo "--services: stop only process centric services"
        echo "--all or nothing: stop all microservices"
fi

if [ $1 == '--datalayer' ] || [ $1 == '--all' ] || [ $1 == '' ]
    then
        # Stop mongodb, group, space and user
        docker stop mongo group_dl space_dl user_dl
        docker rm mongo group_dl space_dl user_dl
fi

if [ $1 == '--services' ] || [ $1 == '--all' ] || [ $1 == '' ]
    then
        # Stop finances, spaces and auth
        docker stop auth
        docker rm auth
fi