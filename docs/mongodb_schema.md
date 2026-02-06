# MongoDB Schema Design - Tourism Footfall Analytics System

## Collections Overview

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Admins    │     │ TouristLocations │     │    Users      │
└──────┬──────┘     └────────┬─────────┘     └───────┬───────┘
       │                     │                       │
       │ manages             │ has_many              │ submits
       ▼                     ▼                       ▼
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Locations  │◄────│  FootfallLogs    │     │   Feedback    │
└─────────────┘     └──────────────────┘     └───────────────┘
```

---

## 1. Users Collection

```javascript
// Collection: users
// Purpose: Store visitor/tourist accounts
// Indexes: email (unique), created_at

{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "id": "usr_a1b2c3d4e5f6",                    // Application UUID
  "email": "tourist@example.com",              // Indexed, unique
  "password_hash": "$2b$12$...",               // bcrypt hashed
  "name": "Rahul Sharma",
  "phone": "+91-9876543210",
  "preferences": {
    "favorite_categories": ["Monument", "Beach"],
    "notifications_enabled": true
  },
  "saved_locations": [                         // References to locations
    "loc_taj_mahal_001",
    "loc_goa_beach_002"
  ],
  "visit_history": [
    {
      "location_id": "loc_taj_mahal_001",
      "visited_at": ISODate("2026-01-15T10:30:00Z")
    }
  ],
  "created_at": ISODate("2026-01-01T00:00:00Z"),
  "updated_at": ISODate("2026-02-06T08:00:00Z"),
  "last_login": ISODate("2026-02-06T08:00:00Z"),
  "is_active": true
}

// Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "id": 1 }, { unique: true })
db.users.createIndex({ "created_at": -1 })
db.users.createIndex({ "saved_locations": 1 })
```

---

## 2. Admins Collection

```javascript
// Collection: admins
// Purpose: Store admin/manager accounts with role-based access
// Indexes: email (unique), role

{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "id": "adm_x1y2z3w4v5u6",
  "email": "admin@tourism.gov.in",
  "password_hash": "$2b$12$...",
  "name": "Admin User",
  "role": "super_admin",                       // super_admin | manager | analyst
  "permissions": [
    "locations:create",
    "locations:update", 
    "locations:delete",
    "analytics:view",
    "analytics:export",
    "users:manage"
  ],
  "managed_locations": [],                     // Empty = all locations (super_admin)
  "created_at": ISODate("2026-01-01T00:00:00Z"),
  "updated_at": ISODate("2026-02-06T08:00:00Z"),
  "last_login": ISODate("2026-02-06T08:00:00Z"),
  "is_active": true
}

// Indexes
db.admins.createIndex({ "email": 1 }, { unique: true })
db.admins.createIndex({ "id": 1 }, { unique: true })
db.admins.createIndex({ "role": 1 })
```

---

## 3. TouristLocations Collection

```javascript
// Collection: tourist_locations
// Purpose: Store destination details with geospatial data
// Indexes: geo (2dsphere), category, state, crowd_level

{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "id": "loc_taj_mahal_001",
  "name": "Taj Mahal",
  "slug": "taj-mahal-agra",                    // URL-friendly
  "description": "UNESCO World Heritage Site...",
  "category": "Monument",                      // Indexed for filtering
  "tags": ["heritage", "mughal", "marble"],
  
  // Geospatial (2dsphere index)
  "location": {
    "type": "Point",
    "coordinates": [78.0421, 27.1751]          // [longitude, latitude]
  },
  "address": {
    "city": "Agra",
    "state": "Uttar Pradesh",                  // Indexed
    "country": "India",
    "pincode": "282001"
  },
  
  // Operational info
  "opening_hours": {
    "monday": { "open": "06:00", "close": "18:30" },
    "tuesday": { "open": "06:00", "close": "18:30" },
    "friday": null                             // Closed
  },
  "entry_fee": {
    "indian": 50,
    "foreign": 1100,
    "currency": "INR"
  },
  "best_time_to_visit": "6:00 AM - 9:00 AM (Sunrise)",
  
  // Media
  "images": [
    { "url": "https://...", "caption": "Front view", "is_primary": true }
  ],
  
  // Real-time crowd data (updated frequently)
  "current_status": {
    "footfall": 245,
    "crowd_level": "Medium",                   // Indexed: Low | Medium | High
    "last_updated": ISODate("2026-02-06T08:45:00Z")
  },
  
  // Aggregated stats (updated daily)
  "stats": {
    "avg_daily_footfall": 320,
    "peak_hours": ["10:00", "11:00", "16:00"],
    "total_reviews": 1250,
    "avg_rating": 4.6
  },
  
  // Prediction cache
  "predictions": {
    "tomorrow": { "crowd_level": "High", "confidence": 0.85 },
    "generated_at": ISODate("2026-02-06T00:00:00Z")
  },
  
  "created_by": "adm_x1y2z3w4v5u6",            // Reference to admin
  "created_at": ISODate("2026-01-01T00:00:00Z"),
  "updated_at": ISODate("2026-02-06T08:00:00Z"),
  "is_active": true
}

// Indexes
db.tourist_locations.createIndex({ "id": 1 }, { unique: true })
db.tourist_locations.createIndex({ "slug": 1 }, { unique: true })
db.tourist_locations.createIndex({ "location": "2dsphere" })          // Geospatial queries
db.tourist_locations.createIndex({ "category": 1 })
db.tourist_locations.createIndex({ "address.state": 1 })
db.tourist_locations.createIndex({ "current_status.crowd_level": 1 })
db.tourist_locations.createIndex({ "tags": 1 })
db.tourist_locations.createIndex({ "is_active": 1, "category": 1 })   // Compound
```

---

## 4. FootfallLogs Collection

```javascript
// Collection: footfall_logs
// Purpose: Time-series data for analytics and ML predictions
// Indexes: location_id + timestamp (compound), timestamp (TTL optional)

{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "id": "fl_20260206_084500_taj",
  "location_id": "loc_taj_mahal_001",          // Reference to location
  "timestamp": ISODate("2026-02-06T08:45:00Z"),// Indexed
  
  // Granular data
  "hour": 8,                                   // 0-23, for hourly aggregation
  "day_of_week": 4,                            // 0=Sunday, for pattern analysis
  "date": "2026-02-06",                        // For daily queries
  
  // Metrics
  "footfall_count": 245,
  "crowd_level": "Medium",
  "entry_count": 150,                          // People entering
  "exit_count": 120,                           // People exiting
  
  // Context (useful for ML)
  "weather": {
    "condition": "sunny",
    "temperature": 24
  },
  "is_holiday": false,
  "is_weekend": false,
  "special_event": null,
  
  // Source
  "source": "sensor",                          // sensor | manual | estimated
  "created_at": ISODate("2026-02-06T08:45:00Z")
}

// Indexes (Critical for performance)
db.footfall_logs.createIndex({ "location_id": 1, "timestamp": -1 })   // Primary query pattern
db.footfall_logs.createIndex({ "location_id": 1, "date": 1 })         // Daily aggregation
db.footfall_logs.createIndex({ "location_id": 1, "hour": 1 })         // Hourly patterns
db.footfall_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 31536000 }) // TTL: 1 year

// Time-series collection (MongoDB 5.0+)
db.createCollection("footfall_logs_ts", {
  timeseries: {
    timeField: "timestamp",
    metaField: "location_id",
    granularity: "minutes"
  }
})
```

---

## 5. Feedback Collection

```javascript
// Collection: feedbacks
// Purpose: Store user reviews and ratings
// Indexes: location_id, user_id, rating, created_at

{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "id": "fb_a1b2c3d4e5f6",
  "location_id": "loc_taj_mahal_001",          // Reference to location
  "user_id": "usr_a1b2c3d4e5f6",               // Reference to user (nullable for anonymous)
  
  // Review content
  "user_name": "Rahul Sharma",                 // Denormalized for display
  "user_email": "tourist@example.com",
  "rating": 5,                                 // 1-5, indexed
  "title": "Breathtaking architecture!",
  "comment": "The Taj Mahal at sunrise is absolutely magical...",
  
  // Categorized ratings
  "ratings_breakdown": {
    "cleanliness": 4,
    "crowd_management": 3,
    "accessibility": 5,
    "value_for_money": 4
  },
  
  // Visit context
  "visit_date": ISODate("2026-02-05T00:00:00Z"),
  "crowd_at_visit": "High",
  "time_spent_minutes": 180,
  
  // Media
  "photos": [
    { "url": "https://...", "caption": "Sunrise view" }
  ],
  
  // Moderation
  "status": "approved",                        // pending | approved | rejected
  "moderated_by": "adm_x1y2z3w4v5u6",
  "moderated_at": ISODate("2026-02-06T10:00:00Z"),
  
  // Engagement
  "helpful_count": 24,
  "reported": false,
  
  "created_at": ISODate("2026-02-06T08:00:00Z"),
  "updated_at": ISODate("2026-02-06T08:00:00Z")
}

// Indexes
db.feedbacks.createIndex({ "id": 1 }, { unique: true })
db.feedbacks.createIndex({ "location_id": 1, "created_at": -1 })      // Location reviews
db.feedbacks.createIndex({ "user_id": 1, "created_at": -1 })          // User's reviews
db.feedbacks.createIndex({ "location_id": 1, "rating": -1 })          // Filter by rating
db.feedbacks.createIndex({ "status": 1 })                             // Moderation queue
db.feedbacks.createIndex({ "location_id": 1, "status": 1, "created_at": -1 }) // Compound
```

---

## Data Relationships Summary

| From | To | Relationship | Reference Field |
|------|-----|--------------|-----------------|
| FootfallLogs | TouristLocations | Many-to-One | `location_id` |
| Feedback | TouristLocations | Many-to-One | `location_id` |
| Feedback | Users | Many-to-One | `user_id` |
| TouristLocations | Admins | Many-to-One | `created_by` |
| Users | TouristLocations | Many-to-Many | `saved_locations[]` |

---

## Common Query Patterns

```javascript
// 1. Get location with recent footfall (aggregation)
db.tourist_locations.aggregate([
  { $match: { id: "loc_taj_mahal_001" } },
  { $lookup: {
      from: "footfall_logs",
      localField: "id",
      foreignField: "location_id",
      pipeline: [{ $sort: { timestamp: -1 } }, { $limit: 24 }],
      as: "recent_footfall"
  }}
])

// 2. Nearby locations (geospatial)
db.tourist_locations.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [78.0421, 27.1751] },
      $maxDistance: 50000  // 50km
    }
  }
})

// 3. Daily footfall aggregation for ML
db.footfall_logs.aggregate([
  { $match: { location_id: "loc_taj_mahal_001", date: { $gte: "2026-01-01" } } },
  { $group: { _id: "$date", avg_footfall: { $avg: "$footfall_count" } } },
  { $sort: { _id: 1 } }
])
```
