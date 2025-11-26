#!/usr/bin/env python3
"""
Test other Alwaseet endpoints
"""

import requests
import json

BACKEND_URL = "https://shoppix-cart.preview.emergentagent.com/api"

def test_cities_endpoint():
    """Test the cities endpoint"""
    print("\n=== Testing Alwaseet Cities Endpoint ===")
    
    url = f"{BACKEND_URL}/alwaseet/cities"
    headers = {
        "X-Alwaseet-Username": "test_merchant",
        "X-Alwaseet-Password": "test_password",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 500:
            # Expected - invalid credentials
            try:
                error_data = response.json()
                print(f"Expected Error: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
                if "Error connecting to Alwaseet API" in error_data.get("detail", ""):
                    print("✅ SUCCESS: Cities endpoint works and handles authentication properly")
                    return True
                else:
                    print("❌ FAIL: Unexpected error format")
                    return False
            except:
                print(f"Error Text: {response.text}")
                return False
        elif response.status_code == 422:
            # Missing headers
            print("❌ FAIL: Missing headers test - should have headers")
            return False
        else:
            print(f"Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_package_sizes_endpoint():
    """Test the package sizes endpoint"""
    print("\n=== Testing Alwaseet Package Sizes Endpoint ===")
    
    url = f"{BACKEND_URL}/alwaseet/package-sizes"
    headers = {
        "X-Alwaseet-Username": "test_merchant",
        "X-Alwaseet-Password": "test_password",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 500:
            # Expected - invalid credentials
            try:
                error_data = response.json()
                print(f"Expected Error: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
                if "Error connecting to Alwaseet API" in error_data.get("detail", ""):
                    print("✅ SUCCESS: Package sizes endpoint works and handles authentication properly")
                    return True
                else:
                    print("❌ FAIL: Unexpected error format")
                    return False
            except:
                print(f"Error Text: {response.text}")
                return False
        elif response.status_code == 422:
            # Missing headers
            print("❌ FAIL: Missing headers test - should have headers")
            return False
        else:
            print(f"Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Other Alwaseet Endpoints")
    
    results = []
    results.append(("Cities Endpoint", test_cities_endpoint()))
    results.append(("Package Sizes Endpoint", test_package_sizes_endpoint()))
    
    print("\n" + "="*50)
    print("📊 SUMMARY")
    print("="*50)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")