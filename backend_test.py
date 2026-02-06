#!/usr/bin/env python3
"""
Tourism Intelligence API Testing Suite
Tests all backend endpoints for the Tourism Analytics System
"""

import requests
import sys
import json
from datetime import datetime

class TourismAPITester:
    def __init__(self, base_url="https://visitmap-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.location_id = None
        self.feedback_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@tourism.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.log(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200, auth_required=True)

    def test_get_locations(self):
        """Test get all locations"""
        success, response = self.run_test("Get All Locations", "GET", "locations", 200)
        if success and isinstance(response, list) and len(response) > 0:
            self.location_id = response[0]['id']
            self.log(f"   Found {len(response)} locations, using ID: {self.location_id}")
        return success

    def test_get_single_location(self):
        """Test get single location"""
        if not self.location_id:
            self.log("❌ Get Single Location - No location ID available")
            return False
        return self.run_test("Get Single Location", "GET", f"locations/{self.location_id}", 200)

    def test_create_location(self):
        """Test create new location"""
        location_data = {
            "name": "Test Location",
            "description": "A test location for API testing",
            "city": "Test City",
            "state": "Test State",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
            "category": "Monument",
            "best_time_to_visit": "Morning",
            "opening_hours": "9 AM - 6 PM",
            "entry_fee": "Free"
        }
        success, response = self.run_test(
            "Create Location", 
            "POST", 
            "locations", 
            200, 
            data=location_data, 
            auth_required=True
        )
        if success and 'id' in response:
            self.test_location_id = response['id']
            self.log(f"   Created location with ID: {self.test_location_id}")
        return success

    def test_update_location(self):
        """Test update location"""
        if not hasattr(self, 'test_location_id'):
            self.log("❌ Update Location - No test location ID available")
            return False
        
        update_data = {
            "name": "Updated Test Location",
            "description": "Updated description"
        }
        return self.run_test(
            "Update Location", 
            "PUT", 
            f"locations/{self.test_location_id}", 
            200, 
            data=update_data, 
            auth_required=True
        )

    def test_analytics_summary(self):
        """Test analytics summary"""
        return self.run_test("Analytics Summary", "GET", "analytics/summary", 200, auth_required=True)

    def test_analytics_footfall(self):
        """Test footfall analytics"""
        return self.run_test("Footfall Analytics", "GET", "analytics/footfall", 200)

    def test_analytics_heatmap(self):
        """Test heatmap data"""
        return self.run_test("Heatmap Data", "GET", "analytics/heatmap", 200)

    def test_analytics_hourly(self):
        """Test hourly analytics"""
        return self.run_test("Hourly Analytics", "GET", "analytics/hourly", 200)

    def test_submit_feedback(self):
        """Test submit feedback"""
        if not self.location_id:
            self.log("❌ Submit Feedback - No location ID available")
            return False
        
        feedback_data = {
            "location_id": self.location_id,
            "user_name": "Test User",
            "user_email": "test@example.com",
            "rating": 5,
            "comment": "Great place to visit!"
        }
        success, response = self.run_test(
            "Submit Feedback", 
            "POST", 
            "feedback", 
            200, 
            data=feedback_data
        )
        if success and 'id' in response:
            self.feedback_id = response['id']
            self.log(f"   Created feedback with ID: {self.feedback_id}")
        return success

    def test_get_feedbacks(self):
        """Test get feedbacks"""
        return self.run_test("Get All Feedbacks", "GET", "feedback", 200)

    def test_get_location_feedbacks(self):
        """Test get feedbacks for specific location"""
        if not self.location_id:
            self.log("❌ Get Location Feedbacks - No location ID available")
            return False
        return self.run_test("Get Location Feedbacks", "GET", f"feedback?location_id={self.location_id}", 200)

    def test_export_csv(self):
        """Test CSV export"""
        success, response = self.run_test("Export CSV", "GET", "export/csv", 200, auth_required=True)
        if success:
            self.log(f"   CSV export successful, size: {len(str(response))} chars")
        return success

    def test_export_pdf(self):
        """Test PDF export"""
        success, response = self.run_test("Export PDF", "GET", "export/pdf", 200, auth_required=True)
        if success:
            self.log(f"   PDF export successful")
        return success

    def test_delete_location(self):
        """Test delete location (cleanup)"""
        if not hasattr(self, 'test_location_id'):
            self.log("❌ Delete Location - No test location ID available")
            return False
        return self.run_test(
            "Delete Location", 
            "DELETE", 
            f"locations/{self.test_location_id}", 
            200, 
            auth_required=True
        )

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        self.log("🚀 Starting Tourism Intelligence API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        # Test sequence
        tests = [
            ("API Root", self.test_root_endpoint),
            ("Admin Login", self.test_admin_login),
            ("Get Current User", self.test_auth_me),
            ("Get All Locations", self.test_get_locations),
            ("Get Single Location", self.test_get_single_location),
            ("Analytics Summary", self.test_analytics_summary),
            ("Footfall Analytics", self.test_analytics_footfall),
            ("Heatmap Data", self.test_analytics_heatmap),
            ("Hourly Analytics", self.test_analytics_hourly),
            ("Submit Feedback", self.test_submit_feedback),
            ("Get All Feedbacks", self.test_get_feedbacks),
            ("Get Location Feedbacks", self.test_get_location_feedbacks),
            ("Create Location", self.test_create_location),
            ("Update Location", self.test_update_location),
            ("Export CSV", self.test_export_csv),
            ("Export PDF", self.test_export_pdf),
            ("Delete Location", self.test_delete_location),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log(f"❌ {test_name} - Exception: {str(e)}")
            print()  # Add spacing between tests
        
        # Results
        self.log("=" * 50)
        self.log(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All tests passed!")
            return 0
        else:
            self.log("⚠️  Some tests failed")
            return 1

def main():
    tester = TourismAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())