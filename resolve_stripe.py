import stripe
import os

stripe.api_key = "sk_test_51RqTaIGrAII971713TAHa57kKvKDIe5VGSUQs9YYiRaEm5g7bYZVAwyXPMV3nJ8FfYZIpyizt6KO5btq0dbbDHQY00u1igtQ8k"

products = {
    "Freelancer ($15)": "prod_TbiKpZ1G6tN6Ao",
    "Startup ($30)": "prod_TbiNaUqF4TzafD"
}

print("--- Resolving Price IDs ---")
for name, prod_id in products.items():
    try:
        prices = stripe.Price.list(product=prod_id, active=True, limit=1)
        if prices.data:
            print(f"✅ {name}: {prices.data[0].id}")
        else:
            print(f"⚠️ {name}: No active price found (Product ID: {prod_id})")
    except Exception as e:
        print(f"❌ Error fetching {name}: {e}")
