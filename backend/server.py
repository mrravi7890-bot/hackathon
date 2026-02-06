from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from io import BytesIO, StringIO
import csv
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'tourism-analytics-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI(title="Tourism Intelligence API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ===================== MODELS =====================

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminRegister(BaseModel):
    email: str
    password: str
    name: str

class AdminLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class Location(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    city: str
    state: str
    latitude: float
    longitude: float
    image_url: str
    category: str
    best_time_to_visit: str
    opening_hours: str
    entry_fee: str
    current_crowd_level: str = "Low"
    current_footfall: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LocationCreate(BaseModel):
    name: str
    description: str
    city: str
    state: str
    latitude: float
    longitude: float
    image_url: str
    category: str
    best_time_to_visit: str
    opening_hours: str
    entry_fee: str

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    opening_hours: Optional[str] = None
    entry_fee: Optional[str] = None
    current_crowd_level: Optional[str] = None
    current_footfall: Optional[int] = None

class FootfallRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    count: int
    crowd_level: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_id: str
    user_name: str
    user_email: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackCreate(BaseModel):
    location_id: str
    user_name: str
    user_email: str
    rating: int
    comment: str

# ===================== HELPER FUNCTIONS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_crowd_level(count: int) -> str:
    if count < 100:
        return "Low"
    elif count < 300:
        return "Medium"
    return "High"

# ===================== SEED DATA =====================

SAMPLE_LOCATIONS = [
    {
        "name": "Taj Mahal",
        "description": "An ivory-white marble mausoleum on the right bank of the river Yamuna. A UNESCO World Heritage Site and one of the Seven Wonders of the World.",
        "city": "Agra",
        "state": "Uttar Pradesh",
        "latitude": 27.1751,
        "longitude": 78.0421,
        "image_url": "https://images.unsplash.com/photo-1665849863716-b527b5e9ed62?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxUYWolMjBNYWhhbCUyMHN1bnNldHxlbnwwfHx8fDE3NzAzNjYzOTR8MA&ixlib=rb-4.1.0&q=85",
        "category": "Monument",
        "best_time_to_visit": "6:00 AM - 9:00 AM (Sunrise)",
        "opening_hours": "6:00 AM - 6:30 PM (Closed on Fridays)",
        "entry_fee": "₹50 (Indians), ₹1100 (Foreigners)"
    },
    {
        "name": "Varanasi Ghats",
        "description": "The spiritual capital of India with 88 ghats along the sacred Ganges river. Famous for Ganga Aarti ceremony and ancient temples.",
        "city": "Varanasi",
        "state": "Uttar Pradesh",
        "latitude": 25.3176,
        "longitude": 83.0062,
        "image_url": "https://images.unsplash.com/photo-1671512226229-e05294dd1970?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxWYXJhbmFzaSUyMGdoYXRzJTIwZXZlbmluZ3xlbnwwfHx8fDE3NzAzNjYzOTh8MA&ixlib=rb-4.1.0&q=85",
        "category": "Religious Site",
        "best_time_to_visit": "5:30 AM - 7:00 AM (Morning Aarti)",
        "opening_hours": "24 hours",
        "entry_fee": "Free"
    },
    {
        "name": "Kerala Backwaters",
        "description": "A network of interconnected canals, rivers, lakes and inlets. Experience traditional houseboats and serene natural beauty.",
        "city": "Alleppey",
        "state": "Kerala",
        "latitude": 9.4981,
        "longitude": 76.3388,
        "image_url": "https://images.unsplash.com/photo-1705838617550-ae0573ebefc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxLZXJhbGElMjBiYWNrd2F0ZXJzJTIwYm9hdHxlbnwwfHx8fDE3NzAzNjY0MDN8MA&ixlib=rb-4.1.0&q=85",
        "category": "Natural",
        "best_time_to_visit": "September - March",
        "opening_hours": "Boat rides: 8:00 AM - 6:00 PM",
        "entry_fee": "Varies by boat type"
    },
    {
        "name": "Goa Beaches",
        "description": "Famous for golden beaches, vibrant nightlife, Portuguese architecture and delicious seafood. Perfect blend of Indian and Western cultures.",
        "city": "Panaji",
        "state": "Goa",
        "latitude": 15.4989,
        "longitude": 73.8278,
        "image_url": "https://images.unsplash.com/photo-1625505826977-66d796089d73?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHxHb2ElMjBiZWFjaCUyMHBhbG0lMjB0cmVlc3xlbnwwfHx8fDE3NzAzNjY0MDV8MA&ixlib=rb-4.1.0&q=85",
        "category": "Beach",
        "best_time_to_visit": "November - February",
        "opening_hours": "24 hours",
        "entry_fee": "Free"
    },
    {
        "name": "Hawa Mahal",
        "description": "The Palace of Winds with 953 small windows. An architectural marvel of Rajput architecture and a symbol of Jaipur.",
        "city": "Jaipur",
        "state": "Rajasthan",
        "latitude": 26.9239,
        "longitude": 75.8267,
        "image_url": "https://images.unsplash.com/photo-1706961121783-4ae6c933983a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxKYWlwdXIlMjBIYXdhJTIwTWFoYWx8ZW58MHx8fHwxNzcwMzY2NDEwfDA&ixlib=rb-4.1.0&q=85",
        "category": "Monument",
        "best_time_to_visit": "9:00 AM - 11:00 AM",
        "opening_hours": "9:00 AM - 5:00 PM",
        "entry_fee": "₹50 (Indians), ₹200 (Foreigners)"
    },
    {
        "name": "Gateway of India",
        "description": "An arch-monument built in the 20th century overlooking the Arabian Sea. The monument was erected to commemorate the landing of King George V.",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 18.9220,
        "longitude": 72.8347,
        "image_url": "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800",
        "category": "Monument",
        "best_time_to_visit": "6:00 PM - 8:00 PM (Sunset)",
        "opening_hours": "24 hours",
        "entry_fee": "Free"
    },
    {
        "name": "Mysore Palace",
        "description": "A historical palace and royal residence. Known for its Indo-Saracenic architecture and the famous Dasara celebrations.",
        "city": "Mysore",
        "state": "Karnataka",
        "latitude": 12.3051,
        "longitude": 76.6551,
        "image_url": "https://images.unsplash.com/photo-1600100397608-e1f66dbeb748?w=800",
        "category": "Palace",
        "best_time_to_visit": "October (Dasara Festival)",
        "opening_hours": "10:00 AM - 5:30 PM",
        "entry_fee": "₹70 (Indians), ₹200 (Foreigners)"
    },
    {
        "name": "Golden Temple",
        "description": "The holiest Gurdwara of Sikhism. Known for its stunning gold-plated architecture and the world's largest free community kitchen (Langar).",
        "city": "Amritsar",
        "state": "Punjab",
        "latitude": 31.6200,
        "longitude": 74.8765,
        "image_url": "https://images.unsplash.com/photo-1518792528501-352f829886dc?w=800",
        "category": "Religious Site",
        "best_time_to_visit": "4:00 AM - 6:00 AM (Prakash ceremony)",
        "opening_hours": "24 hours",
        "entry_fee": "Free"
    }
]

async def seed_data():
    # Check if data already exists
    existing_count = await db.locations.count_documents({})
    if existing_count > 0:
        return
    
    # Seed locations
    for loc_data in SAMPLE_LOCATIONS:
        location = Location(**loc_data)
        location.current_footfall = random.randint(50, 400)
        location.current_crowd_level = get_crowd_level(location.current_footfall)
        doc = location.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.locations.insert_one(doc)
    
    # Seed footfall records for analytics
    locations = await db.locations.find({}, {"_id": 0}).to_list(100)
    for location in locations:
        for days_ago in range(30):
            for hour in [6, 9, 12, 15, 18, 21]:
                timestamp = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 3))
                timestamp = timestamp.replace(hour=hour)
                count = random.randint(20, 500)
                record = FootfallRecord(
                    location_id=location['id'],
                    count=count,
                    crowd_level=get_crowd_level(count),
                    timestamp=timestamp
                )
                doc = record.model_dump()
                doc['timestamp'] = doc['timestamp'].isoformat()
                await db.footfall_records.insert_one(doc)
    
    # Create default admin user
    admin_exists = await db.admin_users.find_one({"email": "admin@tourism.com"})
    if not admin_exists:
        admin = AdminUser(
            email="admin@tourism.com",
            password_hash=hash_password("admin123"),
            name="Admin User"
        )
        doc = admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.admin_users.insert_one(doc)

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register_admin(input: AdminRegister):
    existing = await db.admin_users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin = AdminUser(
        email=input.email,
        password_hash=hash_password(input.password),
        name=input.name
    )
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admin_users.insert_one(doc)
    
    token = create_token(admin.id, admin.email)
    return TokenResponse(
        token=token,
        user={"id": admin.id, "email": admin.email, "name": admin.name}
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_admin(input: AdminLogin):
    user = await db.admin_users.find_one({"email": input.email}, {"_id": 0})
    if not user or not verify_password(input.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    return TokenResponse(
        token=token,
        user={"id": user['id'], "email": user['email'], "name": user['name']}
    )

@api_router.get("/auth/me")
async def get_current_user(user: dict = Depends(verify_token)):
    return {"id": user['id'], "email": user['email'], "name": user['name']}

# ===================== LOCATION ROUTES =====================

@api_router.get("/locations", response_model=List[dict])
async def get_locations():
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    return locations

@api_router.get("/locations/{location_id}")
async def get_location(location_id: str):
    location = await db.locations.find_one({"id": location_id}, {"_id": 0})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@api_router.post("/locations", response_model=dict)
async def create_location(input: LocationCreate, user: dict = Depends(verify_token)):
    location = Location(**input.model_dump())
    doc = location.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.locations.insert_one(doc)
    return doc

@api_router.put("/locations/{location_id}")
async def update_location(location_id: str, input: LocationUpdate, user: dict = Depends(verify_token)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.locations.update_one({"id": location_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    
    location = await db.locations.find_one({"id": location_id}, {"_id": 0})
    return location

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str, user: dict = Depends(verify_token)):
    result = await db.locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}

# ===================== ANALYTICS ROUTES =====================

@api_router.get("/analytics/footfall")
async def get_footfall_analytics(location_id: Optional[str] = None, period: str = "daily"):
    query = {}
    if location_id:
        query["location_id"] = location_id
    
    records = await db.footfall_records.find(query, {"_id": 0}).to_list(10000)
    
    # Parse timestamps
    for record in records:
        if isinstance(record['timestamp'], str):
            record['timestamp'] = datetime.fromisoformat(record['timestamp'].replace('Z', '+00:00'))
    
    # Group by period
    now = datetime.now(timezone.utc)
    
    if period == "daily":
        cutoff = now - timedelta(days=7)
        grouped = {}
        for record in records:
            if record['timestamp'] >= cutoff:
                day = record['timestamp'].strftime("%Y-%m-%d")
                if day not in grouped:
                    grouped[day] = {"date": day, "total": 0, "count": 0}
                grouped[day]["total"] += record['count']
                grouped[day]["count"] += 1
        
        result = [{"date": k, "average": v["total"] // max(v["count"], 1)} for k, v in sorted(grouped.items())]
        
    elif period == "weekly":
        cutoff = now - timedelta(weeks=4)
        grouped = {}
        for record in records:
            if record['timestamp'] >= cutoff:
                week = record['timestamp'].strftime("%Y-W%W")
                if week not in grouped:
                    grouped[week] = {"week": week, "total": 0, "count": 0}
                grouped[week]["total"] += record['count']
                grouped[week]["count"] += 1
        
        result = [{"week": k, "average": v["total"] // max(v["count"], 1)} for k, v in sorted(grouped.items())]
        
    else:  # monthly
        cutoff = now - timedelta(days=365)
        grouped = {}
        for record in records:
            if record['timestamp'] >= cutoff:
                month = record['timestamp'].strftime("%Y-%m")
                if month not in grouped:
                    grouped[month] = {"month": month, "total": 0, "count": 0}
                grouped[month]["total"] += record['count']
                grouped[month]["count"] += 1
        
        result = [{"month": k, "average": v["total"] // max(v["count"], 1)} for k, v in sorted(grouped.items())]
    
    return result

@api_router.get("/analytics/heatmap")
async def get_heatmap_data():
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    heatmap_data = []
    
    for loc in locations:
        # Simulate real-time fluctuation
        base_footfall = loc.get('current_footfall', random.randint(50, 300))
        current_footfall = base_footfall + random.randint(-30, 30)
        current_footfall = max(0, current_footfall)
        
        heatmap_data.append({
            "id": loc['id'],
            "name": loc['name'],
            "latitude": loc['latitude'],
            "longitude": loc['longitude'],
            "footfall": current_footfall,
            "crowd_level": get_crowd_level(current_footfall),
            "intensity": min(current_footfall / 500, 1.0)
        })
    
    return heatmap_data

@api_router.get("/analytics/summary")
async def get_analytics_summary(user: dict = Depends(verify_token)):
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    total_locations = len(locations)
    
    # Calculate totals
    total_footfall = sum(loc.get('current_footfall', 0) for loc in locations)
    
    # Count by crowd level
    crowd_counts = {"Low": 0, "Medium": 0, "High": 0}
    for loc in locations:
        level = loc.get('current_crowd_level', 'Low')
        crowd_counts[level] = crowd_counts.get(level, 0) + 1
    
    # Get feedback count
    feedback_count = await db.feedbacks.count_documents({})
    
    # Calculate average rating
    feedbacks = await db.feedbacks.find({}, {"_id": 0, "rating": 1}).to_list(1000)
    avg_rating = sum(f['rating'] for f in feedbacks) / max(len(feedbacks), 1) if feedbacks else 0
    
    return {
        "total_locations": total_locations,
        "total_footfall": total_footfall,
        "crowd_distribution": crowd_counts,
        "total_feedbacks": feedback_count,
        "average_rating": round(avg_rating, 1)
    }

@api_router.get("/analytics/hourly")
async def get_hourly_analytics():
    # Generate hourly pattern data
    hours = list(range(24))
    hourly_data = []
    
    for hour in hours:
        # Simulate typical tourist patterns
        if 6 <= hour <= 9:
            base = random.randint(150, 250)
        elif 10 <= hour <= 12:
            base = random.randint(250, 400)
        elif 13 <= hour <= 15:
            base = random.randint(200, 300)
        elif 16 <= hour <= 19:
            base = random.randint(300, 450)
        elif 20 <= hour <= 22:
            base = random.randint(100, 200)
        else:
            base = random.randint(20, 80)
        
        hourly_data.append({
            "hour": f"{hour:02d}:00",
            "footfall": base,
            "crowd_level": get_crowd_level(base)
        })
    
    return hourly_data

# ===================== FEEDBACK ROUTES =====================

@api_router.post("/feedback", response_model=dict)
async def submit_feedback(input: FeedbackCreate):
    # Verify location exists
    location = await db.locations.find_one({"id": input.location_id})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    feedback = Feedback(**input.model_dump())
    doc = feedback.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.feedbacks.insert_one(doc)
    return doc

@api_router.get("/feedback", response_model=List[dict])
async def get_feedbacks(location_id: Optional[str] = None):
    query = {}
    if location_id:
        query["location_id"] = location_id
    
    feedbacks = await db.feedbacks.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return feedbacks

# ===================== EXPORT ROUTES =====================

@api_router.get("/export/csv")
async def export_csv(user: dict = Depends(verify_token)):
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Name", "City", "State", "Category", "Current Footfall",
        "Crowd Level", "Best Time to Visit", "Entry Fee"
    ])
    
    # Data rows
    for loc in locations:
        writer.writerow([
            loc.get('name', ''),
            loc.get('city', ''),
            loc.get('state', ''),
            loc.get('category', ''),
            loc.get('current_footfall', 0),
            loc.get('current_crowd_level', 'Low'),
            loc.get('best_time_to_visit', ''),
            loc.get('entry_fee', '')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=tourism_data_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

@api_router.get("/export/pdf")
async def export_pdf(user: dict = Depends(verify_token)):
    locations = await db.locations.find({}, {"_id": 0}).to_list(1000)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Tourism Intelligence Report", styles['Heading1'])
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Date
    date_para = Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal'])
    elements.append(date_para)
    elements.append(Spacer(1, 20))
    
    # Table data
    data = [["Name", "City", "State", "Footfall", "Crowd Level", "Best Time"]]
    for loc in locations:
        data.append([
            loc.get('name', '')[:25],
            loc.get('city', ''),
            loc.get('state', ''),
            str(loc.get('current_footfall', 0)),
            loc.get('current_crowd_level', 'Low'),
            loc.get('best_time_to_visit', '')[:20]
        ])
    
    # Create table
    table = Table(data, colWidths=[150, 80, 80, 60, 80, 120])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.06, 0.09, 0.16)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.Color(0.12, 0.16, 0.23)),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.white),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.Color(0.2, 0.25, 0.35))
    ]))
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=tourism_report_{datetime.now().strftime('%Y%m%d')}.pdf"}
    )

# ===================== ROOT ROUTE =====================

@api_router.get("/")
async def root():
    return {"message": "Tourism Intelligence API", "version": "1.0.0"}

# ===================== APP SETUP =====================

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_data()
    logger.info("Database seeded with sample data")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
