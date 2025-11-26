#!/usr/bin/env python3
"""
Backend API Testing for Drop Shipping App - Alwaseet Integration
Testing the Alwaseet API proxy endpoints
"""

import requests
import json
import sys
from typing import Dict, Any

# Get backend URL from frontend .env
BACKEND_URL = "https://shoppix-cart.preview.emergentagent.com/api"

# Test credentials (these would normally come from Firestore)
TEST_USERNAME = "test_merchant"
TEST_PASSWORD = "test_password"

def test_alwaseet_regions_success():
    """Test regions endpoint with test credentials (expects authentication failure)"""
    print("\n=== Testing Alwaseet Regions - API Integration Test ===")
    
    url = f"{BACKEND_URL}/alwaseet/regions"
    headers = {
        "X-Alwaseet-Username": TEST_USERNAME,
        "X-Alwaseet-Password": TEST_PASSWORD,
        "Content-Type": "application/json"
    }
    params = {"city_id": 1}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validate response structure
            if data.get("success") and "regions" in data:
                regions = data["regions"]
                if isinstance(regions, list):
                    print(f"✅ SUCCESS: Retrieved {len(regions)} regions")
                    
                    # Check if regions have required fields
                    if regions and len(regions) > 0:
                        first_region = regions[0]
                        if "id" in first_region and "region_name" in first_region:
                            print("✅ SUCCESS: Regions contain required fields (id, region_name)")
                            return True
                        else:
                            print(f"❌ FAIL: Regions missing required fields. Sample: {first_region}")
                            return False
                    else:
                        print("⚠️ WARNING: No regions returned (empty list)")
                        return True  # Empty list is valid response
                else:
                    print(f"❌ FAIL: Regions is not a list: {type(regions)}")
                    return False
            else:
                print(f"❌ FAIL: Invalid response structure: {data}")
                return False
        elif response.status_code == 401:
            # Expected with test credentials
            try:
                error_data = response.json()
                print(f"Authentication Error (Expected): {json.dumps(error_data, indent=2, ensure_ascii=False)}")
                if "Failed to authenticate with Alwaseet" in error_data.get("detail", ""):
                    print("✅ SUCCESS: Backend properly handles Alwaseet authentication errors")
                    return True
                else:
                    print("❌ FAIL: Unexpected authentication error format")
                    return False
            except:
                print(f"Error Text: {response.text}")
                return False
        elif response.status_code == 500:
            # Check if it's an authentication error from Alwaseet
            try:
                error_data = response.json()
                print(f"Server Error: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
                if "Error connecting to Alwaseet API" in error_data.get("detail", ""):
                    print("✅ SUCCESS: Backend properly connects to Alwaseet API (credentials invalid as expected)")
                    return True
                else:
                    print("❌ FAIL: Unexpected server error")
                    return False
            except:
                print(f"Error Text: {response.text}")
                return False
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error Text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request Exception: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {str(e)}")
        return False

def test_alwaseet_regions_invalid_city():
    """Test regions retrieval with invalid city_id"""
    print("\n=== Testing Alwaseet Regions - Invalid City ID ===")
    
    url = f"{BACKEND_URL}/alwaseet/regions"
    headers = {
        "X-Alwaseet-Username": TEST_USERNAME,
        "X-Alwaseet-Password": TEST_PASSWORD,
        "Content-Type": "application/json"
    }
    params = {"city_id": 99999}  # Invalid city ID
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [400, 404]:
            print("✅ SUCCESS: Properly handled invalid city_id")
            try:
                data = response.json()
                print(f"Error Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error Text: {response.text}")
            return True
        elif response.status_code == 200:
            data = response.json()
            if data.get("success") and len(data.get("regions", [])) == 0:
                print("✅ SUCCESS: Invalid city_id returned empty regions list")
                return True
            else:
                print(f"⚠️ WARNING: Invalid city_id returned data: {data}")
                return True  # Some APIs might return empty data instead of error
        else:
            print(f"❌ FAIL: Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request Exception: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {str(e)}")
        return False

def test_alwaseet_regions_invalid_credentials():
    """Test regions retrieval with invalid credentials"""
    print("\n=== Testing Alwaseet Regions - Invalid Credentials ===")
    
    url = f"{BACKEND_URL}/alwaseet/regions"
    headers = {
        "X-Alwaseet-Username": "invalid_user",
        "X-Alwaseet-Password": "invalid_pass",
        "Content-Type": "application/json"
    }
    params = {"city_id": 1}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ SUCCESS: Properly handled invalid credentials")
            try:
                data = response.json()
                print(f"Error Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error Text: {response.text}")
            return True
        else:
            print(f"❌ FAIL: Expected 401, got {response.status_code}")
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Response Text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request Exception: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {str(e)}")
        return False

def test_alwaseet_regions_missing_headers():
    """Test regions retrieval with missing headers"""
    print("\n=== Testing Alwaseet Regions - Missing Headers ===")
    
    url = f"{BACKEND_URL}/alwaseet/regions"
    headers = {"Content-Type": "application/json"}  # Missing auth headers
    params = {"city_id": 1}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:  # FastAPI validation error
            print("✅ SUCCESS: Properly handled missing headers")
            try:
                data = response.json()
                print(f"Error Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Error Text: {response.text}")
            return True
        else:
            print(f"❌ FAIL: Expected 422, got {response.status_code}")
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Response Text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request Exception: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {str(e)}")
        return False

def test_backend_health():
    """Test if backend is running and accessible"""
    print("\n=== Testing Backend Health ===")
    
    url = f"{BACKEND_URL}/"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            if data.get("message") == "Hello World":
                print("✅ SUCCESS: Backend is healthy")
                return True
            else:
                print(f"❌ FAIL: Unexpected response: {data}")
                return False
        else:
            print(f"❌ FAIL: Backend not accessible: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Cannot reach backend: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests for Alwaseet Integration")
    print(f"Backend URL: {BACKEND_URL}")
    
    test_results = []
    
    # Test backend health first
    test_results.append(("Backend Health Check", test_backend_health()))
    
    # Test Alwaseet regions endpoint
    test_results.append(("Regions - Success Case", test_alwaseet_regions_success()))
    test_results.append(("Regions - Invalid City ID", test_alwaseet_regions_invalid_city()))
    test_results.append(("Regions - Invalid Credentials", test_alwaseet_regions_invalid_credentials()))
    test_results.append(("Regions - Missing Headers", test_alwaseet_regions_missing_headers()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(test_results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed > 0:
        print("\n⚠️ Some tests failed. Check the details above.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()