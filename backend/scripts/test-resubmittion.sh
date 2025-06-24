#!/bin/bash

BASE_URL="http://api.localhost.tiangolo.com"
CONTENT_TYPE="Content-Type: application/json"

# Get JWT token
echo "Requesting JWT..."
token_response=$(curl -s -X POST "$BASE_URL/api/v1/auth/device")
access_token=$(echo "$token_response" | jq -r '.access_token')

if [[ "$access_token" == "null" || -z "$access_token" ]]; then
    echo "❌ Failed to get token."
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $access_token"
echo "✅ Got token: $access_token"
echo

# Get narrator ID
echo "Getting narrator ID for Jure..."
narrator_response=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/v1/utils/narrator/Jure")
narrator_id=$(echo "$narrator_response" | jq -r '.id')

if [[ "$narrator_id" == "null" || -z "$narrator_id" ]]; then
    echo "❌ Narrator not found"
    exit 1
fi
echo "✅ Narrator ID: $narrator_id"
echo

# Get first audio file ID
echo "Getting first audio file..."
audio_response=$(curl -s "$BASE_URL/api/v1/audio/")
audio_file_id=$(echo "$audio_response" | jq -r 'to_entries[].value[0].id' | head -n 1)

if [[ "$audio_file_id" == "null" || -z "$audio_file_id" ]]; then
    echo "❌ No audio file found"
    exit 1
fi
echo "✅ Audio file ID: $audio_file_id"
echo

# PATCH user info - twice
patch_payload='{
  "email": "test@example.com",
  "device_lable": "telefon",
  "gender": "ženski"
}'
echo "Sending PATCH /register-question (1st try)..."
curl -s -X PATCH "$BASE_URL/api/v1/questions/register-question" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$patch_payload" | jq
echo
echo "Sending PATCH /register-question (2nd try)..."
curl -s -X PATCH "$BASE_URL/api/v1/questions/register-question" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$patch_payload" | jq
echo

# POST narrator knowledge - twice
narrator_payload='{
  "knows_narrator_lable": "Glasu ne poznam",
  "narrator_prediction": "Janez"
}'
echo "Posting narrator knowledge (1st try)..."
curl -s -X POST "$BASE_URL/api/v1/questions/narrator-knowledge/$narrator_id" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$narrator_payload" | jq
echo
echo "Posting narrator knowledge (2nd try)..."
curl -s -X POST "$BASE_URL/api/v1/questions/narrator-knowledge/$narrator_id" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$narrator_payload" | jq
echo

# POST review - twice
review_payload='{
  "review": "gotovo naravno"
}'
echo "Posting review (1st try)..."
curl -s -X POST "$BASE_URL/api/v1/audio/review/$audio_file_id" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$review_payload" | jq
echo
echo "Posting review (2nd try)..."
curl -s -X POST "$BASE_URL/api/v1/audio/review/$audio_file_id" -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$review_payload" | jq
echo
