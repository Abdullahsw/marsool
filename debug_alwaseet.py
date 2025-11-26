#!/usr/bin/env python3
"""
Debug script to test Alwaseet API directly
"""

import requests
import json

def test_alwaseet_login():
    """Test direct call to Alwaseet login API"""
    print("Testing Alwaseet API login directly...")
    
    # Try the current URL
    url = "https://api.alwaseet-iq.net/v1/merchant/login"
    
    data = {
        "username": "test_merchant",
        "password": "test_password"
    }
    
    try:
        print(f"Calling: {url}")
        print(f"Data: {data}")
        
        response = requests.post(url, data=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                json_data = response.json()
                print(f"JSON Response: {json.dumps(json_data, indent=2, ensure_ascii=False)}")
            except:
                print("Failed to parse JSON")
        
    except Exception as e:
        print(f"Error: {str(e)}")

def test_alternative_urls():
    """Test alternative Alwaseet URLs"""
    urls = [
        "https://al-waseet.com/apis-main/login",
        "https://al-waseet.com/api/login",
        "https://api.al-waseet.com/login",
        "https://api.al-waseet.com/v1/login"
    ]
    
    data = {
        "username": "test_merchant", 
        "password": "test_password"
    }
    
    for url in urls:
        print(f"\n--- Testing URL: {url} ---")
        try:
            response = requests.post(url, data=data, timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_alwaseet_login()
    test_alternative_urls()