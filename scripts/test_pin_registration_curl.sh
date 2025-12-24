#!/bin/bash

# PIN Registration API Test Script
# Tests all endpoints in the order they are called by the frontend

echo "=========================================="
echo "PIN Registration API Test - cURL Commands"
echo "=========================================="
echo ""

# 1. GUI Lookup (ID Validation)
echo "=== 1. GUI LOOKUP (ID Validation) ==="
echo "Used in: /kenyan/identity"
echo ""
echo "curl -X GET 'https://kratest.pesaflow.com/api/itax/gui-lookup?gui=36447996&tax_payer_type=KE' \\"
echo "  -H 'x-source-for: whatsapp'"
echo ""
echo "Response:"
curl -s -X GET 'https://kratest.pesaflow.com/api/itax/gui-lookup?gui=36447996&tax_payer_type=KE' \
  -H 'x-source-for: whatsapp'
echo ""
echo ""

# 2. ID Lookup with Phone Validation
echo "=== 2. ID LOOKUP (with phone validation) ==="
echo "Used in: /kenyan/identity (fallback)"
echo ""
echo "curl -X POST 'https://kratest.pesaflow.com/api/ussd/id-lookup' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-forwarded-for: triple_2_ussd' \\"
echo "  -d '{\"id_number\":\"36447996\",\"msisdn\":\"254748104591\"}'"
echo ""
echo "Response:"
curl -s -X POST 'https://kratest.pesaflow.com/api/ussd/id-lookup' \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d '{"id_number":"36447996","msisdn":"254748104591"}'
echo ""
echo ""

# 3. Initiate Session
echo "=== 3. INITIATE SESSION ==="
echo "Used in: /pin-registration (before registration)"
echo ""
echo "curl -X POST 'https://kratest.pesaflow.com/api/ussd/initiate-session' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-forwarded-for: triple_2_ussd' \\"
echo "  -d '{\"id_number\":\"36447996\",\"msisdn\":\"254748104591\",\"type\":\"citizen\"}'"
echo ""
echo "Response:"
curl -s -X POST 'https://kratest.pesaflow.com/api/ussd/initiate-session' \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d '{"id_number":"36447996","msisdn":"254748104591","type":"citizen"}'
echo ""
echo ""

# 4. PIN Registration (Citizen)
echo "=== 4. PIN REGISTRATION (Citizen) ==="
echo "Used in: /kenyan/declaration"
echo ""
echo "curl -X POST 'https://kratest.pesaflow.com/api/ussd/pin-registration' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-forwarded-for: triple_2_ussd' \\"
echo "  -d '{\"type\":\"citizen\",\"email\":\"test@example.com\",\"msisdn\":\"254748104591\",\"id_number\":\"36447996\"}'"
echo ""
echo "Response:"
curl -s -X POST 'https://kratest.pesaflow.com/api/ussd/pin-registration' \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d '{"type":"citizen","email":"test@example.com","msisdn":"254748104591","id_number":"36447996"}'
echo ""
echo ""

# 5. PIN Registration (Resident/Non-Kenyan)
echo "=== 5. PIN REGISTRATION (Resident/Non-Kenyan) ==="
echo "Used in: /non-kenyan/declaration"
echo ""
echo "curl -X POST 'https://kratest.pesaflow.com/api/ussd/pin-registration' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-forwarded-for: triple_2_ussd' \\"
echo "  -d '{\"type\":\"resident\",\"email\":\"test@example.com\",\"msisdn\":\"254748104591\",\"id_number\":\"A1234567\"}'"
echo ""
echo "Response:"
curl -s -X POST 'https://kratest.pesaflow.com/api/ussd/pin-registration' \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: triple_2_ussd' \
  -d '{"type":"resident","email":"test@example.com","msisdn":"254748104591","id_number":"A1234567"}'
echo ""
echo ""

echo "=========================================="
echo "TEST COMPLETE"
echo "=========================================="
