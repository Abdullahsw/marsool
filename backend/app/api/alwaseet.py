from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Dict, Any, Optional
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/alwaseet", tags=["alwaseet"])

# Alwaseet API Configuration
ALWASEET_BASE_URL = "https://api.alwaseet-iq.net/v1/merchant"

# Cache for token (keyed by username)
_token_cache: Dict[str, str] = {}


def get_alwaseet_token(username: str, password: str) -> str:
    """Get or refresh Alwaseet API token"""
    # Check cache first
    if username in _token_cache:
        return _token_cache[username]
    
    try:
        response = requests.post(
            f"{ALWASEET_BASE_URL}/login",
            data={
                "username": username,
                "password": password
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") and data.get("data", {}).get("token"):
            _token_cache[username] = data["data"]["token"]
            return _token_cache[username]
        else:
            raise HTTPException(
                status_code=401,
                detail=f"Failed to authenticate with Alwaseet: {data.get('msg', 'Unknown error')}"
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error connecting to Alwaseet API: {str(e)}"
        )


@router.get("/cities")
async def get_cities() -> Dict[str, Any]:
    """Get list of cities from Alwaseet"""
    token = get_alwaseet_token()
    
    try:
        response = requests.get(
            f"{ALWASEET_BASE_URL}/citys",
            params={"token": token},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get("status"):
            return {
                "success": True,
                "cities": data.get("data", [])
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=data.get("msg", "Failed to fetch cities")
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching cities: {str(e)}"
        )


@router.get("/regions")
async def get_regions(city_id: int = Query(..., description="City ID")) -> Dict[str, Any]:
    """Get list of regions for a specific city from Alwaseet"""
    token = get_alwaseet_token()
    
    try:
        response = requests.get(
            f"{ALWASEET_BASE_URL}/regions",
            params={
                "token": token,
                "city_id": city_id
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get("status"):
            return {
                "success": True,
                "regions": data.get("data", [])
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=data.get("msg", "Failed to fetch regions")
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching regions: {str(e)}"
        )


@router.get("/package-sizes")
async def get_package_sizes() -> Dict[str, Any]:
    """Get list of package sizes from Alwaseet"""
    token = get_alwaseet_token()
    
    try:
        response = requests.get(
            f"{ALWASEET_BASE_URL}/package-sizes",
            params={"token": token},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get("status"):
            return {
                "success": True,
                "sizes": data.get("data", [])
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=data.get("msg", "Failed to fetch package sizes")
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching package sizes: {str(e)}"
        )
