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

@api_router.post("/calculator/calculate", response_model=SolarCalculatorResult)
async def calculate_solar(input_data: SolarCalculatorInput):
    # Average electricity rate ($/kWh)
    electricity_rate = 0.12
    
    # Calculate monthly consumption (kWh)
    monthly_consumption = input_data.monthly_bill / electricity_rate
    
    # Annual consumption
    annual_consumption = monthly_consumption * 12
    
    # Peak sun hours based on property type and typical location
    peak_sun_hours = 5 if input_data.property_type == "home" else 5.5
    
    # System efficiency factor
    efficiency = 0.80
    
    # Calculate required system size (kW)
    daily_production_needed = annual_consumption / 365
    recommended_size = daily_production_needed / (peak_sun_hours * efficiency)
    
    # Add buffer for backup if required
    if input_data.backup_required:
        recommended_size *= 1.25
    
    # Round to nearest 0.5 kW
    recommended_size = round(recommended_size * 2) / 2
    
    # Cost estimation ($1.50 - $2.50 per watt installed)
    cost_per_watt = 2.0 if input_data.property_type == "home" else 1.80
    estimated_cost = recommended_size * 1000 * cost_per_watt
    
    # Annual savings (assuming 100% offset)
    annual_savings = annual_consumption * electricity_rate * 0.95
    
    # Payback period
    payback_years = estimated_cost / annual_savings if annual_savings > 0 else 0
    
    # CO2 reduction (0.4 kg CO2 per kWh)
    co2_reduction = annual_consumption * 0.4
    
    return SolarCalculatorResult(
        recommended_size_kw=recommended_size,
        estimated_cost=round(estimated_cost, 2),
        annual_savings=round(annual_savings, 2),
        payback_years=round(payback_years, 1),
        co2_reduction_kg=round(co2_reduction, 1)
    )

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
async def update_order_status(order_id: str, status: str, current_user: dict = Depends(get_vendor_user)):
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
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
