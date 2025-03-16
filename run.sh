#!/bin/bash

# Kill any existing server process
echo "Checking for existing server processes..."
if pgrep -f "bin/server" > /dev/null; then
    echo "Killing existing server process..."
    pkill -f "bin/server"
    sleep 1
fi

# Build and run the server
echo "Building server..."
cd cmd/api
go build -o ../../bin/server
cd ../..

echo "Starting server..."
./bin/server 