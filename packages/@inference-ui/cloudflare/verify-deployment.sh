#!/bin/bash

# Deployment Verification Script for Inference UI API
# Tests all endpoints after deployment

API_URL="${1:-https://inference-ui-api.neureus.workers.dev}"

echo "🧪 Verifying Inference UI API Deployment"
echo "📍 API URL: $API_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
FAILURE=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="${5:-200}"

    echo -n "Testing $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        SUCCESS=$((SUCCESS + 1))
        if [ ! -z "$body" ] && [ "$body" != "null" ]; then
            echo "   Response: $(echo $body | jq -c . 2>/dev/null || echo $body)"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $status_code)"
        FAILURE=$((FAILURE + 1))
        echo "   Response: $body"
    fi
    echo ""
}

echo "═══════════════════════════════════════════════════════════════"
echo "1. Basic Endpoints"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Root Endpoint" "GET" "/"
test_endpoint "Health Check" "GET" "/health"

echo "═══════════════════════════════════════════════════════════════"
echo "2. GraphQL API"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# GraphQL Introspection
test_endpoint "GraphQL Introspection" "POST" "/graphql" \
    '{"query":"query { __schema { types { name } } }"}' \
    200

# GraphQL Type Query
test_endpoint "GraphQL Type Query" "POST" "/graphql" \
    '{"query":"query { __type(name: \"Query\") { name fields { name } } }"}' \
    200

echo "═══════════════════════════════════════════════════════════════"
echo "3. Event Ingestion"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Single event
test_endpoint "Single Event Ingestion" "POST" "/events" \
    '{"event":"test_deployment","component":"VerificationScript","properties":{"timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}}' \
    200

# Batch events
test_endpoint "Batch Event Ingestion" "POST" "/events" \
    '[
        {"event":"button_click","component":"TestButton","properties":{"label":"Test 1"}},
        {"event":"page_view","component":"TestPage","properties":{"path":"/test"}},
        {"event":"purchase_complete","component":"Checkout","properties":{"amount":99.99}}
    ]' \
    200

# Test intent classification
test_endpoint "Purchase Intent Event" "POST" "/events" \
    '{"event":"checkout_button_click","component":"CheckoutButton"}' \
    200

test_endpoint "Error Intent Event" "POST" "/events" \
    '{"event":"payment_error","component":"PaymentForm"}' \
    200

test_endpoint "Help Intent Event" "POST" "/events" \
    '{"event":"support_click","component":"HelpButton"}' \
    200

echo "═══════════════════════════════════════════════════════════════"
echo "4. Error Handling"
echo "═══════════════════════════════════════════════════════════════"
echo ""

test_endpoint "Invalid Method on Root" "POST" "/" "" 404
test_endpoint "Invalid Method on Health" "POST" "/health" "" 404
test_endpoint "Missing GraphQL Query" "POST" "/graphql" '{}' 400
test_endpoint "Invalid Event Data" "POST" "/events" '{"invalid":"data"}' 200

echo "═══════════════════════════════════════════════════════════════"
echo "📊 Test Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TOTAL=$((SUCCESS + FAILURE))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $SUCCESS${NC}"
echo -e "${RED}Failed: $FAILURE${NC}"
echo ""

if [ $FAILURE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "🎉 Deployment verification successful!"
    echo ""
    echo "Next steps:"
    echo "  1. Update marketing website API endpoint"
    echo "  2. Test with mobile app"
    echo "  3. Monitor Cloudflare dashboard"
    echo "  4. Set up custom domain"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    echo ""
    echo "Please check:"
    echo "  1. Cloudflare Workers deployment status"
    echo "  2. D1 database connection"
    echo "  3. Analytics Engine enabled"
    echo "  4. Environment variables"
    exit 1
fi
