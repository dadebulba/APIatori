#!/bin/bash

# Start mongodb 
docker build -f mongo/Dockerfile -t mongo .
docker run --name mongo --net host -p 27017:27017 -v ~/data:/data/db -d mongo

# Start identity server
docker build -f microservices/auth/Dockerfile -t dadebulba/apiatori-auth .
docker run --name auth --net host -p 3000:3000 -e PROD=true -d dadebulba/apiatori-auth

# Start gateway
docker build -f microservices/gateway/Dockerfile -t dadebulba/apiatori-gateway .
docker run --name gateway --net host -p 8080:8080 -e PROD=true -d dadebulba/apiatori-gateway

# Start spaces service
docker build -f microservices/spaces/Dockerfile -t dadebulba/apiatori-spaces .
docker run --name spaces --net host -p 3002:3002 -e PROD=true -d dadebulba/apiatori-spaces

# Start groups service
docker build -f microservices/groups/Dockerfile -t dadebulba/apiatori-groups .
docker run --name groups --net host -p 3003:3003 -e PROD=true -d dadebulba/apiatori-groups

# Start users service
docker build -f microservices/users/Dockerfile -t dadebulba/apiatori-users .
docker run --name users --net host -p 3004:3004 -e PROD=true -d dadebulba/apiatori-users
