from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

# Optional LLM import - fallback if not available
LLM_AVAILABLE = False
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    logging.warning("emergentintegrations not installed - AI chat will use fallback responses")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# LLM Settings
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="SolarSavers API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== MODELS ==============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "customer"  # customer, vendor, admin

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class VendorCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    business_name: str
    description: str
    phone: str

class VendorResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    business_name: str
    description: str
    phone: str
    status: str
    created_at: str

class ProductBase(BaseModel):
    name: str
    description: str
    category: str  # home, commercial
    system_size_kw: float
    price: float
    original_price: Optional[float] = None
    efficiency_rating: float
    warranty_years: int
    brand: str
    image_url: str
    features: List[str] = []
    in_stock: bool = True

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    vendor_id: str
    vendor_name: str
    rating: float = 4.5
    review_count: int = 0
    created_at: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    in_stock: Optional[bool] = None

# ============== MVSP (Multi-Vendor Single Product) MODELS ==============

class VendorInventoryCreate(BaseModel):
    product_id: str
    quantity: int
    vendor_price: float  # Must be <= product's sell_price
    location: Optional[str] = None

class VendorInventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    vendor_price: Optional[float] = None
    is_available: Optional[bool] = None

class VendorInventoryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    vendor_id: str
    vendor_name: str
    product_id: str
    product_name: str
    quantity: int
    vendor_price: float
    sell_price: float  # SolarSavers price
    is_available: bool
    location: Optional[str] = None
    updated_at: str

class ProductSuggestion(BaseModel):
    """Vendor submits a new product suggestion for admin approval"""
    name: str
    description: str
    category: str
    system_size_kw: float
    suggested_price: float
    efficiency_rating: float
    warranty_years: int
    brand: str
    image_url: str
    features: List[str] = []

class OrderAssignment(BaseModel):
    vendor_id: str
    assignment_notes: Optional[str] = None


class SolarCalculatorInput(BaseModel):
    monthly_bill: float
    property_type: str  # home, commercial
    city: str
    backup_required: bool

class SolarCalculatorResult(BaseModel):
    recommended_size_kw: float
    estimated_cost: float
    annual_savings: float
    payback_years: float
    co2_reduction_kg: float

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    payment_method: str

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[dict]
    total_amount: float
    status: str
    shipping_address: str
    assigned_vendor_id: Optional[str] = None
    assigned_vendor_name: Optional[str] = None
    assigned_at: Optional[str] = None
    created_at: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

# ============== TICKETING SYSTEM MODELS ==============

class TicketCreate(BaseModel):
    subject: str
    message: str
    category: str = "general"  # general, order, technical, billing
    order_id: Optional[str] = None  # Related order ID for non-general tickets

class TicketReply(BaseModel):
    message: str

class TicketResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    user_name: str
    user_email: str
    subject: str
    message: str
    category: str
    status: str  # open, in_progress, resolved, closed
    priority: str  # low, medium, high
    order_id: Optional[str] = None
    replies: List[dict] = []
    created_at: str
    updated_at: str

# ============== BLOG MODELS ==============

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str  # news, tips, guides, technology
    image_url: str
    tags: List[str] = []
    is_published: bool = True

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class BlogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    content: str
    excerpt: str
    category: str
    image_url: str
    tags: List[str]
    author_id: str
    author_name: str
    is_published: bool
    views: int = 0
    created_at: str
    updated_at: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, role: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expires
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_vendor_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["vendor", "admin"]:
        raise HTTPException(status_code=403, detail="Vendor access required")
    return current_user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_access_token(user_id, user_data.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["id"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# ============== VENDOR ROUTES ==============

@api_router.post("/vendors/register", response_model=TokenResponse)
async def register_vendor(vendor_data: VendorCreate):
    existing = await db.users.find_one({"email": vendor_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": vendor_data.email,
        "name": vendor_data.name,
        "password": hash_password(vendor_data.password),
        "role": "vendor",
        "business_name": vendor_data.business_name,
        "description": vendor_data.description,
        "phone": vendor_data.phone,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_access_token(user_id, "vendor")
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=vendor_data.email,
            name=vendor_data.name,
            role="vendor",
            created_at=user["created_at"]
        )
    )

@api_router.get("/vendors", response_model=List[VendorResponse])
async def get_vendors():
    vendors = await db.users.find({"role": "vendor"}, {"_id": 0, "password": 0}).to_list(100)
    return [VendorResponse(
        id=v["id"],
        email=v["email"],
        name=v["name"],
        business_name=v.get("business_name", ""),
        description=v.get("description", ""),
        phone=v.get("phone", ""),
        status=v.get("status", "pending"),
        created_at=v["created_at"]
    ) for v in vendors]

@api_router.get("/vendors/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: str):
    vendor = await db.users.find_one({"id": vendor_id, "role": "vendor"}, {"_id": 0, "password": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorResponse(
        id=vendor["id"],
        email=vendor["email"],
        name=vendor["name"],
        business_name=vendor.get("business_name", ""),
        description=vendor.get("description", ""),
        phone=vendor.get("phone", ""),
        status=vendor.get("status", "pending"),
        created_at=vendor["created_at"]
    )

@api_router.put("/admin/vendors/{vendor_id}/approve")
async def approve_vendor(vendor_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": vendor_id, "role": "vendor"},
        {"$set": {"status": "approved"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor approved"}

# ============== PRODUCT ROUTES ==============

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_vendor_user)):
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "vendor_id": current_user["id"],
        "vendor_name": current_user.get("business_name", current_user["name"]),
        **product.model_dump(),
        "rating": 4.5,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    return ProductResponse(**{k: v for k, v in product_doc.items() if k != "_id"})

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_size: Optional[float] = None,
    max_size: Optional[float] = None,
    brand: Optional[str] = None,
    in_stock: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if min_size is not None:
        query["system_size_kw"] = {"$gte": min_size}
    if max_size is not None:
        query.setdefault("system_size_kw", {})["$lte"] = max_size
    if brand:
        query["brand"] = brand
    if in_stock is not None:
        query["in_stock"] = in_stock
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return [ProductResponse(**p) for p in products]

@api_router.get("/products/featured", response_model=List[ProductResponse])
async def get_featured_products(category: Optional[str] = None, limit: int = 8):
    query = {"in_stock": True}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).sort("rating", -1).limit(limit).to_list(limit)
    return [ProductResponse(**p) for p in products]

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse(**product)

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, updates: ProductUpdate, current_user: dict = Depends(get_vendor_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["vendor_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return ProductResponse(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_vendor_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["vendor_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted"}

@api_router.get("/vendor/products", response_model=List[ProductResponse])
async def get_vendor_products(current_user: dict = Depends(get_vendor_user)):
    products = await db.products.find({"vendor_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return [ProductResponse(**p) for p in products]

# ============== SOLAR CALCULATOR ==============

# OpenWeatherMap API key
OPENWEATHERMAP_API_KEY = "2096dd7fb74f7d1b1a5096a61abad00f"

# India city data: Average peak sun hours and electricity tariffs (₹/kWh)
INDIA_SOLAR_DATA = {
    # City: (peak_sun_hours, electricity_tariff)
    "delhi": (5.5, 8.0),
    "mumbai": (5.0, 9.5),
    "bangalore": (5.2, 7.5),
    "bengaluru": (5.2, 7.5),
    "chennai": (5.8, 6.5),
    "kolkata": (4.8, 8.0),
    "hyderabad": (5.5, 8.5),
    "pune": (5.3, 9.0),
    "ahmedabad": (5.8, 5.5),
    "jaipur": (6.0, 7.0),
    "lucknow": (5.2, 7.0),
    "chandigarh": (5.5, 6.5),
    "noida": (5.5, 8.0),
    "gurgaon": (5.5, 8.0),
    "gurugram": (5.5, 8.0),
    # Default values for other cities
    "default": (5.0, 7.5)
}

# Cost per watt installed in India (₹/Watt)
COST_PER_WATT_HOME = 45  # ₹45-55/Watt for residential
COST_PER_WATT_COMMERCIAL = 40  # ₹40-50/Watt for commercial

# Panel specifications
PANEL_WATTAGE = 400  # Watts per panel (standard mono)
PANEL_EFFICIENCY = 0.20  # 20% efficiency

# System losses factor
SYSTEM_LOSSES = 0.80  # 20% losses (inverter, DC cables, dust, temp)

async def get_weather_factor(city: str) -> float:
    """Get cloud-based solar factor from OpenWeatherMap (1.0 = clear, 0.5 = very cloudy)"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={"q": f"{city},IN", "appid": OPENWEATHERMAP_API_KEY, "units": "metric"}
            )
            if response.status_code == 200:
                data = response.json()
                clouds = data.get("clouds", {}).get("all", 0)  # 0-100%
                # Convert cloud % to solar factor (100% clouds = 0.5 factor)
                solar_factor = 1 - (clouds / 200)
                return max(0.5, min(1.0, solar_factor))
    except Exception:
        pass
    return 0.85  # Default factor

@api_router.post("/calculator/calculate", response_model=SolarCalculatorResult)
async def calculate_solar(input_data: SolarCalculatorInput):
    """
    Scientific Solar Calculator based on Tata Power methodology
    
    Formula Flow:
    1. Monthly Bill → Daily Consumption (kWh) = Bill / Tariff / 30
    2. Peak Sun Hours → From city data table
    3. Required System Size (kW) = Daily Consumption / (Peak Sun Hours × System Efficiency)
    4. Add 25% buffer for backup if required
    5. Panel Count = System Size × 1000 / Panel Wattage
    6. Installation Cost = System Size × 1000 × Cost per Watt
    7. Annual Savings = System Size × 365 × Peak Sun Hours × Tariff × 0.95
    8. Payback Years = Cost / Annual Savings
    9. CO2 Reduction = Annual Production × 0.82 kg/kWh (India grid factor)
    """
    
    # Get city-specific data or defaults
    city_key = input_data.city.lower().strip()
    peak_sun_hours, electricity_tariff = INDIA_SOLAR_DATA.get(
        city_key, 
        INDIA_SOLAR_DATA["default"]
    )
    
    # Get real-time weather adjustment factor
    weather_factor = await get_weather_factor(input_data.city)
    
    # Step 1: Calculate daily energy consumption (kWh/day)
    # Monthly Bill / Tariff = Monthly kWh, / 30 = Daily kWh
    daily_consumption_kwh = input_data.monthly_bill / electricity_tariff / 30
    
    # Step 2: Calculate required system size (kW)
    # System must produce daily_consumption in peak_sun_hours
    # Adjusted for system losses (inverter, cables, dust, temperature)
    effective_sun_hours = peak_sun_hours * SYSTEM_LOSSES * weather_factor
    required_system_kw = daily_consumption_kwh / effective_sun_hours
    
    # Step 3: Add buffer for battery backup
    if input_data.backup_required:
        required_system_kw *= 1.25  # 25% extra for battery and backup
    
    # Round to nearest 0.5 kW
    recommended_size_kw = round(required_system_kw * 2) / 2
    recommended_size_kw = max(1.0, recommended_size_kw)  # Minimum 1kW
    
    # Step 4: Calculate number of panels
    num_panels = int(round(recommended_size_kw * 1000 / PANEL_WATTAGE))
    
    # Step 5: Calculate installation cost
    cost_per_watt = COST_PER_WATT_HOME if input_data.property_type == "home" else COST_PER_WATT_COMMERCIAL
    estimated_cost = recommended_size_kw * 1000 * cost_per_watt
    
    # Apply government subsidy (PM Surya Ghar) for residential
    subsidy = 0
    if input_data.property_type == "home":
        if recommended_size_kw <= 2:
            subsidy = 30000  # ₹30,000 for up to 2kW
        elif recommended_size_kw <= 3:
            subsidy = 60000  # ₹60,000 for up to 3kW
        else:
            subsidy = 78000  # ₹78,000 for above 3kW (up to 10kW)
    
    net_cost = estimated_cost - subsidy
    
    # Step 6: Calculate annual generation and savings
    # System produces: size (kW) × peak_sun_hours × 365 × system_efficiency
    annual_generation_kwh = recommended_size_kw * peak_sun_hours * 365 * SYSTEM_LOSSES
    annual_savings = annual_generation_kwh * electricity_tariff * 0.95  # 95% utilization
    
    # Step 7: Payback period
    payback_years = net_cost / annual_savings if annual_savings > 0 else 10
    
    # Step 8: CO2 reduction (India grid emission factor: 0.82 kg CO2/kWh)
    co2_reduction_kg = annual_generation_kwh * 0.82
    
    return SolarCalculatorResult(
        recommended_size_kw=recommended_size_kw,
        estimated_cost=round(net_cost, 2),
        annual_savings=round(annual_savings, 2),
        payback_years=round(payback_years, 1),
        co2_reduction_kg=round(co2_reduction_kg, 1)
    )

# Alias for frontend compatibility
@api_router.post("/calculator", response_model=SolarCalculatorResult)
async def calculate_solar_alias(input_data: SolarCalculatorInput):
    """Alias endpoint for /calculator/calculate"""
    return await calculate_solar(input_data)

# ============== ORDERS ==============

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    
    # Calculate total and get product details
    items = []
    total = 0
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if product:
            items.append({
                "product_id": item.product_id,
                "name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "vendor_id": product["vendor_id"]
            })
            total += product["price"] * item.quantity
    
    order = {
        "id": order_id,
        "user_id": current_user["id"],
        "items": items,
        "total_amount": total,
        "status": "pending",
        "shipping_address": order_data.shipping_address,
        "payment_method": order_data.payment_method,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    
    return OrderResponse(**{k: v for k, v in order.items() if k != "_id"})

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    if current_user["role"] == "admin":
        query = {}
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [OrderResponse(**o) for o in orders]

@api_router.get("/vendor/orders", response_model=List[OrderResponse])
async def get_vendor_orders(current_user: dict = Depends(get_vendor_user)):
    # Get orders that contain products from this vendor
    orders = await db.orders.find(
        {"items.vendor_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [OrderResponse(**o) for o in orders]

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, current_user: dict = Depends(get_current_user)):
    """Update order status - vendors can only update their assigned orders"""
    status = status_data.get("status")
    valid_statuses = ["pending", "assigned", "processing", "shipped", "delivered", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid: {valid_statuses}")
    
    # Check if vendor can update this order
    if current_user["role"] == "vendor":
        order = await db.orders.find_one({"id": order_id, "assigned_vendor_id": current_user["id"]})
        if not order:
            raise HTTPException(status_code=403, detail="You can only update orders assigned to you")
    
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": f"Order status updated to {status}"}

# ============== AI CHAT ASSISTANT ==============

SOLAR_SYSTEM_PROMPT = """You are the SolarSavers AI Assistant, an expert in solar energy solutions for homes and commercial properties. 

Your knowledge includes:
- Solar panel types (monocrystalline, polycrystalline, thin-film)
- Solar system sizing and calculations
- Installation processes and costs
- Government subsidies and tax credits
- Net metering and energy storage
- Maintenance and warranties
- ROI calculations and payback periods

Be helpful, friendly, and concise. When users share their electricity bill, help them understand what solar system size they might need.

For recommendations, you can suggest they use our Solar Calculator or browse our products. Keep responses under 150 words unless detailed explanation is needed."""

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(chat_input: ChatMessage):
    session_id = chat_input.session_id or str(uuid.uuid4())
    
    # Fallback responses for common questions
    fallback_responses = {
        "price": "Our solar systems range from ₹5,999 for a 3kW home system to ₹2,75,000 for industrial 250kW installations. Use our Solar Calculator for a personalized estimate!",
        "size": "The right system size depends on your electricity bill. A typical home uses 3-10kW, while commercial properties need 25-250kW. Try our Solar Calculator!",
        "warranty": "All our solar systems come with 25-30 year warranties. Premium brands like SunPower and LG offer extended performance guarantees.",
        "install": "Installation typically takes 1-3 days for homes and 1-2 weeks for commercial projects. Our vendors handle permits and grid connection.",
        "save": "On average, solar can reduce your electricity bills by 70-90%. Your exact savings depend on your consumption and system size.",
        "default": "Thanks for your question! I'm your SolarSavers assistant. For personalized recommendations, try our Solar Calculator or browse our products. How can I help you with solar energy today?"
    }
    
    # Generate response
    message_lower = chat_input.message.lower()
    response = fallback_responses["default"]
    
    if LLM_AVAILABLE and EMERGENT_LLM_KEY:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=SOLAR_SYSTEM_PROMPT
            )
            chat.with_model("openai", "gpt-4")
            
            user_message = UserMessage(text=chat_input.message)
            response = await chat.send_message(user_message)
        except Exception as e:
            logging.error(f"LLM Chat error: {e}")
            # Fall through to keyword-based response
            for key in ["price", "cost", "size", "kw", "warranty", "install", "save", "bill"]:
                if key in message_lower:
                    if key in ["price", "cost"]:
                        response = fallback_responses["price"]
                    elif key in ["size", "kw"]:
                        response = fallback_responses["size"]
                    elif key == "warranty":
                        response = fallback_responses["warranty"]
                    elif key == "install":
                        response = fallback_responses["install"]
                    elif key in ["save", "bill"]:
                        response = fallback_responses["save"]
                    break
    else:
        # Keyword-based fallback
        for key in ["price", "cost", "size", "kw", "warranty", "install", "save", "bill"]:
            if key in message_lower:
                if key in ["price", "cost"]:
                    response = fallback_responses["price"]
                elif key in ["size", "kw"]:
                    response = fallback_responses["size"]
                elif key == "warranty":
                    response = fallback_responses["warranty"]
                elif key == "install":
                    response = fallback_responses["install"]
                elif key in ["save", "bill"]:
                    response = fallback_responses["save"]
                break
    
    # Store chat history
    await db.chat_history.insert_one({
        "session_id": session_id,
        "user_message": chat_input.message,
        "assistant_response": response,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return ChatResponse(response=response, session_id=session_id)

# ============== CONTACT ==============

@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    contact_id = str(uuid.uuid4())
    contact = {
        "id": contact_id,
        **form.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact)
    return {"message": "Thank you for contacting us! We'll get back to you soon.", "id": contact_id}

# ============== REVIEWS ==============

@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "product_id": review.product_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": review.product_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.products.update_one(
        {"id": review.product_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(reviews)}}
    )
    
    return {"message": "Review submitted", "id": review_id}

@api_router.get("/reviews/{product_id}")
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

# ============== BRANDS ==============

@api_router.get("/brands")
async def get_brands():
    brands = await db.products.distinct("brand")
    return brands

# ============== DASHBOARD STATS ==============

@api_router.get("/vendor/dashboard")
async def get_vendor_dashboard(current_user: dict = Depends(get_vendor_user)):
    products = await db.products.count_documents({"vendor_id": current_user["id"]})
    orders = await db.orders.find({"items.vendor_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(
        sum(item["price"] * item["quantity"] for item in o["items"] if item.get("vendor_id") == current_user["id"])
        for o in orders
    )
    
    return {
        "total_products": products,
        "total_orders": len(orders),
        "total_revenue": round(total_revenue, 2),
        "pending_orders": len([o for o in orders if o["status"] == "pending"])
    }

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(get_admin_user)):
    users = await db.users.count_documents({"role": "customer"})
    vendors = await db.users.count_documents({"role": "vendor"})
    products = await db.products.count_documents({})
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(o["total_amount"] for o in orders)
    
    return {
        "total_customers": users,
        "total_vendors": vendors,
        "total_products": products,
        "total_orders": len(orders),
        "total_revenue": round(total_revenue, 2),
        "pending_orders": len([o for o in orders if o["status"] == "pending"])
    }

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Database already seeded"}
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@solarsavers.com",
        "name": "Admin",
        "password": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin)
    
    # Create vendor
    vendor_id = str(uuid.uuid4())
    vendor = {
        "id": vendor_id,
        "email": "vendor@solarsavers.com",
        "name": "SolarTech Solutions",
        "password": hash_password("vendor123"),
        "role": "vendor",
        "business_name": "SolarTech Solutions",
        "description": "Premium solar panel manufacturer",
        "phone": "+1-555-0100",
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(vendor)
    
    # Sample products
    products = [
        # Home Solar
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Home Starter 3kW Solar System",
            "description": "Perfect entry-level solar system for small homes. Includes monocrystalline panels and hybrid inverter.",
            "category": "home",
            "system_size_kw": 3.0,
            "price": 5999,
            "original_price": 7499,
            "efficiency_rating": 19.5,
            "warranty_years": 25,
            "brand": "SolarTech",
            "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600",
            "features": ["Monocrystalline Panels", "Hybrid Inverter", "WiFi Monitoring", "25 Year Warranty"],
            "in_stock": True,
            "rating": 4.7,
            "review_count": 124,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Home Essential 5kW Solar System",
            "description": "Ideal for medium-sized homes. High-efficiency panels with battery backup option.",
            "category": "home",
            "system_size_kw": 5.0,
            "price": 8999,
            "original_price": 10999,
            "efficiency_rating": 21.0,
            "warranty_years": 25,
            "brand": "SolarTech",
            "image_url": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600",
            "features": ["High-Efficiency Panels", "Battery Compatible", "Smart Monitoring", "Free Installation"],
            "in_stock": True,
            "rating": 4.8,
            "review_count": 256,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Home Premium 8kW Solar System",
            "description": "Complete solar solution for large homes with high energy consumption.",
            "category": "home",
            "system_size_kw": 8.0,
            "price": 13999,
            "original_price": 16999,
            "efficiency_rating": 22.0,
            "warranty_years": 30,
            "brand": "SunPower",
            "image_url": "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600",
            "features": ["Premium Panels", "10kWh Battery", "EV Charger Ready", "30 Year Warranty"],
            "in_stock": True,
            "rating": 4.9,
            "review_count": 89,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Home Max 10kW Solar System",
            "description": "Maximum power for energy-intensive homes. Full off-grid capable.",
            "category": "home",
            "system_size_kw": 10.0,
            "price": 17999,
            "original_price": 21999,
            "efficiency_rating": 22.5,
            "warranty_years": 30,
            "brand": "LG Solar",
            "image_url": "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=600",
            "features": ["LG NeON Panels", "15kWh Battery", "Off-Grid Ready", "Premium Support"],
            "in_stock": True,
            "rating": 4.9,
            "review_count": 67,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Commercial Solar
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Commercial 25kW Solar System",
            "description": "Entry-level commercial solution for small businesses and offices.",
            "category": "commercial",
            "system_size_kw": 25.0,
            "price": 35999,
            "original_price": 42999,
            "efficiency_rating": 21.5,
            "warranty_years": 25,
            "brand": "Canadian Solar",
            "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600",
            "features": ["Commercial Grade", "String Inverters", "Remote Monitoring", "Tax Credit Eligible"],
            "in_stock": True,
            "rating": 4.6,
            "review_count": 45,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Commercial Pro 50kW Solar System",
            "description": "Mid-size commercial installation for warehouses and manufacturing facilities.",
            "category": "commercial",
            "system_size_kw": 50.0,
            "price": 65999,
            "original_price": 79999,
            "efficiency_rating": 22.0,
            "warranty_years": 25,
            "brand": "JinkoSolar",
            "image_url": "https://images.unsplash.com/photo-1545209463-e2a9e07c8693?w=600",
            "features": ["Industrial Panels", "Central Inverter", "SCADA Integration", "Turnkey Installation"],
            "in_stock": True,
            "rating": 4.7,
            "review_count": 32,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Commercial Elite 100kW Solar System",
            "description": "Large-scale commercial solution for factories and large facilities.",
            "category": "commercial",
            "system_size_kw": 100.0,
            "price": 119999,
            "original_price": 149999,
            "efficiency_rating": 22.5,
            "warranty_years": 30,
            "brand": "Trina Solar",
            "image_url": "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600",
            "features": ["Utility Grade", "Battery Storage Option", "Grid Export Ready", "O&M Package"],
            "in_stock": True,
            "rating": 4.8,
            "review_count": 18,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vendor_id": vendor_id,
            "vendor_name": "SolarTech Solutions",
            "name": "Industrial 250kW Solar System",
            "description": "Mega installation for industrial complexes and large commercial properties.",
            "category": "commercial",
            "system_size_kw": 250.0,
            "price": 275000,
            "original_price": 325000,
            "efficiency_rating": 23.0,
            "warranty_years": 30,
            "brand": "First Solar",
            "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600",
            "features": ["Thin-Film Technology", "Ground Mount Option", "PPA Available", "Dedicated Account Manager"],
            "in_stock": True,
            "rating": 4.9,
            "review_count": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    
    return {"message": "Database seeded successfully", "products_count": len(products)}

# ============== MVSP VENDOR INVENTORY ==============

@api_router.get("/vendor/inventory", response_model=List[VendorInventoryResponse])
async def get_vendor_inventory(current_user: dict = Depends(get_vendor_user)):
    """Get all products in vendor's inventory"""
    inventory = await db.vendor_inventory.find(
        {"vendor_id": current_user["id"]}, {"_id": 0}
    ).to_list(100)
    
    response = []
    for item in inventory:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            response.append(VendorInventoryResponse(
                id=item["id"],
                vendor_id=item["vendor_id"],
                vendor_name=current_user.get("business_name", current_user["name"]),
                product_id=item["product_id"],
                product_name=product["name"],
                quantity=item["quantity"],
                vendor_price=item["vendor_price"],
                sell_price=product["price"],
                is_available=item.get("is_available", True),
                location=item.get("location"),
                updated_at=item.get("updated_at", item.get("created_at", ""))
            ))
    return response

@api_router.post("/vendor/inventory", response_model=VendorInventoryResponse)
async def add_to_inventory(
    inventory_data: VendorInventoryCreate, 
    current_user: dict = Depends(get_vendor_user)
):
    """Add a global product to vendor's inventory with their price"""
    # Check if product exists
    product = await db.products.find_one({"id": inventory_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if vendor price is valid (must be <= sell price)
    if inventory_data.vendor_price > product["price"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Vendor price must be less than or equal to sell price (${product['price']})"
        )
    
    # Check if already in inventory
    existing = await db.vendor_inventory.find_one({
        "vendor_id": current_user["id"],
        "product_id": inventory_data.product_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Product already in your inventory")
    
    inventory_id = str(uuid.uuid4())
    inventory_doc = {
        "id": inventory_id,
        "vendor_id": current_user["id"],
        "product_id": inventory_data.product_id,
        "quantity": inventory_data.quantity,
        "vendor_price": inventory_data.vendor_price,
        "location": inventory_data.location,
        "is_available": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.vendor_inventory.insert_one(inventory_doc)
    
    return VendorInventoryResponse(
        id=inventory_id,
        vendor_id=current_user["id"],
        vendor_name=current_user.get("business_name", current_user["name"]),
        product_id=inventory_data.product_id,
        product_name=product["name"],
        quantity=inventory_data.quantity,
        vendor_price=inventory_data.vendor_price,
        sell_price=product["price"],
        is_available=True,
        location=inventory_data.location,
        updated_at=inventory_doc["updated_at"]
    )

@api_router.put("/vendor/inventory/{inventory_id}")
async def update_inventory(
    inventory_id: str,
    update_data: VendorInventoryUpdate,
    current_user: dict = Depends(get_vendor_user)
):
    """Update vendor's inventory item"""
    inventory = await db.vendor_inventory.find_one({
        "id": inventory_id,
        "vendor_id": current_user["id"]
    })
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if update_data.quantity is not None:
        update_fields["quantity"] = update_data.quantity
    if update_data.vendor_price is not None:
        # Validate price
        product = await db.products.find_one({"id": inventory["product_id"]})
        if update_data.vendor_price > product["price"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Vendor price must be less than or equal to sell price"
            )
        update_fields["vendor_price"] = update_data.vendor_price
    if update_data.is_available is not None:
        update_fields["is_available"] = update_data.is_available
    
    await db.vendor_inventory.update_one(
        {"id": inventory_id},
        {"$set": update_fields}
    )
    return {"message": "Inventory updated successfully"}

@api_router.delete("/vendor/inventory/{inventory_id}")
async def remove_from_inventory(
    inventory_id: str,
    current_user: dict = Depends(get_vendor_user)
):
    """Remove product from vendor's inventory"""
    result = await db.vendor_inventory.delete_one({
        "id": inventory_id,
        "vendor_id": current_user["id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return {"message": "Product removed from inventory"}

# ============== VENDOR PRODUCT SUGGESTIONS ==============

@api_router.post("/vendor/suggest-product")
async def suggest_product(
    product: ProductSuggestion,
    current_user: dict = Depends(get_vendor_user)
):
    """Vendor suggests a new product for admin approval"""
    suggestion_id = str(uuid.uuid4())
    suggestion_doc = {
        "id": suggestion_id,
        "vendor_id": current_user["id"],
        "vendor_name": current_user.get("business_name", current_user["name"]),
        **product.model_dump(),
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.product_suggestions.insert_one(suggestion_doc)
    return {"message": "Product suggestion submitted for approval", "id": suggestion_id}

@api_router.get("/admin/product-suggestions")
async def get_product_suggestions(current_user: dict = Depends(get_admin_user)):
    """Get all pending product suggestions"""
    suggestions = await db.product_suggestions.find(
        {"status": "pending"}, {"_id": 0}
    ).to_list(100)
    return suggestions

@api_router.put("/admin/product-suggestions/{suggestion_id}/approve")
async def approve_product_suggestion(
    suggestion_id: str,
    sell_price: float,
    current_user: dict = Depends(get_admin_user)
):
    """Approve a product suggestion and add it to global products"""
    suggestion = await db.product_suggestions.find_one({"id": suggestion_id})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Create the global product
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "vendor_id": "admin",  # Global product
        "vendor_name": "SolarSavers",
        "name": suggestion["name"],
        "description": suggestion["description"],
        "category": suggestion["category"],
        "system_size_kw": suggestion["system_size_kw"],
        "price": sell_price,  # Admin sets the sell price
        "original_price": suggestion.get("suggested_price"),
        "efficiency_rating": suggestion["efficiency_rating"],
        "warranty_years": suggestion["warranty_years"],
        "brand": suggestion["brand"],
        "image_url": suggestion["image_url"],
        "features": suggestion.get("features", []),
        "in_stock": True,
        "rating": 4.5,
        "review_count": 0,
        "is_approved": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    
    # Update suggestion status
    await db.product_suggestions.update_one(
        {"id": suggestion_id},
        {"$set": {"status": "approved", "approved_product_id": product_id}}
    )
    
    return {"message": "Product approved and added to catalog", "product_id": product_id}

@api_router.put("/admin/product-suggestions/{suggestion_id}/reject")
async def reject_product_suggestion(
    suggestion_id: str,
    reason: str = "",
    current_user: dict = Depends(get_admin_user)
):
    """Reject a product suggestion"""
    result = await db.product_suggestions.update_one(
        {"id": suggestion_id},
        {"$set": {"status": "rejected", "rejection_reason": reason}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return {"message": "Product suggestion rejected"}

# ============== ADMIN ORDER ASSIGNMENT ==============

@api_router.get("/admin/orders/pending-assignment")
async def get_orders_pending_assignment(current_user: dict = Depends(get_admin_user)):
    """Get orders that need vendor assignment"""
    orders = await db.orders.find(
        {"assigned_vendor_id": {"$exists": False}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/admin/orders/{order_id}/available-vendors")
async def get_available_vendors_for_order(
    order_id: str,
    current_user: dict = Depends(get_admin_user)
):
    """Get list of vendors who have the products in this order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get product IDs from order
    product_ids = [item["product_id"] for item in order.get("items", [])]
    
    # Find vendors who have ALL these products in their inventory
    vendor_inventory = await db.vendor_inventory.find(
        {
            "product_id": {"$in": product_ids},
            "is_available": True,
            "quantity": {"$gt": 0}
        },
        {"_id": 0}
    ).to_list(500)
    
    # Group by vendor
    vendor_products = {}
    for inv in vendor_inventory:
        vid = inv["vendor_id"]
        if vid not in vendor_products:
            vendor_products[vid] = {
                "products": [],
                "total_price": 0
            }
        vendor_products[vid]["products"].append(inv["product_id"])
        # Find quantity needed for this product
        for item in order["items"]:
            if item["product_id"] == inv["product_id"]:
                vendor_products[vid]["total_price"] += inv["vendor_price"] * item["quantity"]
    
    # Get vendor details for those who have ALL products
    available_vendors = []
    for vid, data in vendor_products.items():
        if all(pid in data["products"] for pid in product_ids):
            vendor = await db.users.find_one({"id": vid}, {"_id": 0, "password": 0})
            if vendor:
                available_vendors.append({
                    "vendor_id": vid,
                    "vendor_name": vendor.get("business_name", vendor["name"]),
                    "total_vendor_price": data["total_price"],
                    "location": vendor.get("location"),
                    "email": vendor["email"]
                })
    
    # Sort by price (lowest first)
    available_vendors.sort(key=lambda x: x["total_vendor_price"])
    
    return {
        "order_id": order_id,
        "order_total": order["total_amount"],
        "available_vendors": available_vendors
    }

@api_router.put("/admin/orders/{order_id}/assign")
async def assign_order_to_vendor(
    order_id: str,
    assignment: OrderAssignment,
    current_user: dict = Depends(get_admin_user)
):
    """Assign an order to a specific vendor"""
    # Verify order exists
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify vendor exists
    vendor = await db.users.find_one({"id": assignment.vendor_id, "role": "vendor"})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Update order with assignment
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "assigned_vendor_id": assignment.vendor_id,
            "assigned_vendor_name": vendor.get("business_name", vendor["name"]),
            "assigned_by": current_user["id"],
            "assignment_notes": assignment.assignment_notes,
            "assigned_at": datetime.now(timezone.utc).isoformat(),
            "status": "assigned"
        }}
    )
    
    # Reduce vendor inventory
    for item in order.get("items", []):
        await db.vendor_inventory.update_one(
            {
                "vendor_id": assignment.vendor_id,
                "product_id": item["product_id"]
            },
            {"$inc": {"quantity": -item["quantity"]}}
        )
    
    return {"message": f"Order assigned to {vendor.get('business_name', vendor['name'])}"}

@api_router.get("/vendor/assigned-orders")
async def get_vendor_assigned_orders(current_user: dict = Depends(get_vendor_user)):
    """Get orders assigned to this vendor"""
    orders = await db.orders.find(
        {"assigned_vendor_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

# ============== CONTACT & TICKETING ==============

@api_router.post("/contact")
async def submit_contact_form(form: ContactForm):
    """Submit a contact form message"""
    contact_id = str(uuid.uuid4())
    contact_doc = {
        "id": contact_id,
        **form.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact_doc)
    return {"message": "Thank you for contacting us! We'll respond shortly.", "id": contact_id}

@api_router.get("/admin/contacts")
async def get_contact_submissions(current_user: dict = Depends(get_admin_user)):
    """Get all contact form submissions (admin)"""
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

@api_router.post("/tickets", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, current_user: dict = Depends(get_current_user)):
    """Create a new support ticket"""
    ticket_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    ticket_doc = {
        "id": ticket_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "user_email": current_user["email"],
        **ticket.model_dump(),
        "status": "open",
        "priority": "medium",
        "replies": [],
        "created_at": now,
        "updated_at": now
    }
    await db.tickets.insert_one(ticket_doc)
    return TicketResponse(**{k: v for k, v in ticket_doc.items() if k != "_id"})

@api_router.get("/tickets", response_model=List[TicketResponse])
async def get_user_tickets(current_user: dict = Depends(get_current_user)):
    """Get current user's tickets"""
    tickets = await db.tickets.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    return [TicketResponse(**t) for t in tickets]

@api_router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific ticket"""
    ticket = await db.tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Users can only see their own tickets, admins can see all
    if ticket["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return TicketResponse(**ticket)

@api_router.post("/tickets/{ticket_id}/reply")
async def reply_to_ticket(
    ticket_id: str,
    reply: TicketReply,
    current_user: dict = Depends(get_current_user)
):
    """Add a reply to a ticket"""
    ticket = await db.tickets.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Users can only reply to their own tickets, admins can reply to all
    if ticket["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    reply_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "is_admin": current_user["role"] == "admin",
        "message": reply.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tickets.update_one(
        {"id": ticket_id},
        {
            "$push": {"replies": reply_doc},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    return {"message": "Reply added successfully", "reply": reply_doc}

@api_router.get("/admin/tickets", response_model=List[TicketResponse])
async def get_all_tickets(
    status: Optional[str] = None,
    current_user: dict = Depends(get_admin_user)
):
    """Get all tickets (admin only)"""
    query = {}
    if status:
        query["status"] = status
    tickets = await db.tickets.find(query, {"_id": 0}).sort("updated_at", -1).to_list(100)
    return [TicketResponse(**t) for t in tickets]

@api_router.put("/admin/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status: str,
    current_user: dict = Depends(get_admin_user)
):
    """Update ticket status (admin only)"""
    if status not in ["open", "in_progress", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": f"Ticket status updated to {status}"}

@api_router.put("/admin/tickets/{ticket_id}/priority")
async def update_ticket_priority(
    ticket_id: str,
    priority: str,
    current_user: dict = Depends(get_admin_user)
):
    """Update ticket priority (admin only)"""
    if priority not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="Invalid priority")
    
    result = await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": {"priority": priority, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": f"Ticket priority updated to {priority}"}

# ============== BLOG ENDPOINTS ==============

@api_router.get("/blogs", response_model=List[BlogResponse])
async def get_blogs(category: Optional[str] = None, published_only: bool = True):
    """Get all blogs, optionally filtered by category"""
    query = {}
    if published_only:
        query["is_published"] = True
    if category:
        query["category"] = category
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return [BlogResponse(**b) for b in blogs]

@api_router.get("/blogs/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: str):
    """Get a single blog by ID and increment views"""
    blog = await db.blogs.find_one_and_update(
        {"id": blog_id},
        {"$inc": {"views": 1}},
        {"_id": 0}
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return BlogResponse(**blog)

@api_router.post("/admin/blogs", response_model=BlogResponse)
async def create_blog(blog: BlogCreate, current_user: dict = Depends(get_admin_user)):
    """Create a new blog post (admin only)"""
    now = datetime.now(timezone.utc).isoformat()
    blog_doc = {
        "id": str(uuid.uuid4()),
        "title": blog.title,
        "content": blog.content,
        "excerpt": blog.excerpt,
        "category": blog.category,
        "image_url": blog.image_url,
        "tags": blog.tags,
        "author_id": current_user["id"],
        "author_name": current_user["name"],
        "is_published": blog.is_published,
        "views": 0,
        "created_at": now,
        "updated_at": now
    }
    await db.blogs.insert_one(blog_doc)
    return BlogResponse(**{k: v for k, v in blog_doc.items() if k != "_id"})

@api_router.put("/admin/blogs/{blog_id}", response_model=BlogResponse)
async def update_blog(blog_id: str, blog: BlogUpdate, current_user: dict = Depends(get_admin_user)):
    """Update a blog post (admin only)"""
    update_data = {k: v for k, v in blog.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.blogs.update_one({"id": blog_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    updated = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    return BlogResponse(**updated)

@api_router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete a blog post (admin only)"""
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog deleted successfully"}

@api_router.get("/admin/blogs", response_model=List[BlogResponse])
async def get_all_blogs_admin(current_user: dict = Depends(get_admin_user)):
    """Get all blogs including unpublished (admin only)"""
    blogs = await db.blogs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [BlogResponse(**b) for b in blogs]

# ============== ROOT ==============


@api_router.get("/")
async def root():
    return {"message": "SolarSavers API", "version": "1.0.0"}


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
