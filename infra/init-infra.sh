#!/bin/bash

cd ./infra/.docker && docker compose up -d && cd ..

rm -rf ./aws
rm -rf ./awscliv2.zip

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

AWS_REGION="eu-central-1"
AWS_PROFILE="test-profile"
TOPIC_NAME="post-created"
QUEUE_NAME="fanout-posts-queue"

aws configure set aws_access_key_id "dummy" --profile $AWS_PROFILE
aws configure set aws_secret_access_key "dummy" --profile $AWS_PROFILE
aws configure set region $AWS_REGION --profile $AWS_PROFILE

aws --endpoint-url=http://localhost:4566 sns create-topic --name $TOPIC_NAME --region $AWS_REGION --profile $AWS_PROFILE

aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name $QUEUE_NAME --profile $AWS_PROFILE --region $AWS_REGION

# After subscribing, when a message is published to the topic, it will be sent to the queue
aws --endpoint-url=http://localhost:4566 sns subscribe --topic-arn   arn:aws:sns:$AWS_REGION:000000000000:$TOPIC_NAME --profile $AWS_PROFILE --protocol sqs --notification-endpoint arn:aws:sqs:$AWS_REGION:000000000000:$QUEUE_NAME
