#!/bin/bash
cd /home/ubuntu/todo-app
docker compose down
docker compose up -d --build
