#!/bin/bash
# Start mongodb 
docker build -f mongo/Dockerfile -t mongo .
docker run --name mongo --net host -p 27017:27017 -v ~/data:/data/db -d mongo
# Start finances service
# Start spaces service
# Start groups service
# Start identity server
docker build -f microservices/auth/Dockerfile -t auth .
docker run --name auth --net host -p 3000:3000 -e PROD=true -d auth