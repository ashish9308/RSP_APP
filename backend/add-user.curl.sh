#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  RSP News Publisher — Add New User
#  Usage: bash add-user.curl.sh
#  Edit the variables below before running.
# ─────────────────────────────────────────────────────────────

USERNAME="newuser"
PASSWORD="newpassword"
FIRST_NAME="First"
LAST_NAME="Last"
ROLE="editor"          # "admin" or "editor"

curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":  \"$USERNAME\",
    \"password\":  \"$PASSWORD\",
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\":  \"$LAST_NAME\",
    \"role\":      \"$ROLE\"
  }" | python3 -m json.tool

# ─────────────────────────────────────────────────────────────
# Example — create an admin user:
#   USERNAME="reporter1" PASSWORD="secure123" FIRST_NAME="Ravi" LAST_NAME="Sharma" ROLE="editor" bash add-user.curl.sh
# ─────────────────────────────────────────────────────────────
