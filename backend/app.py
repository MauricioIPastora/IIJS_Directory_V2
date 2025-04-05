import os
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes import init_routes

# this loads env variables
load_dotenv()

# get database URL from environment with fallback
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:777KnowledgeYearly!@contacts-db.c3we4miwyfva.us-east-1.rds.amazonaws.com/contacts")
DEBUG = os.getenv("FLASK_ENV") == "development"
PORT = int(os.getenv("PORT", 5000))
#initialize flask app lesgooo
app = Flask(__name__)

# Configure CORS to allow requests from the frontend
if DEBUG:
    CORS(app, resources={r"/*": {"origins": "*"}})  # In development, allow all origins for testing
else:
    # Add explicitly allowed origins
    allowed_origins = [
        "http://localhost:5173",  # Local dev server
        "http://iijs-directory-frontend.s3-website-us-east-1.amazonaws.com",  # S3 website URL
        "https://d26crobm8snmzc.cloudfront.net",  # CloudFront domain
        "https://iijs-directory.app",  # Main domain
        "https://www.iijs-directory.app",  # www subdomain
    ]
    
    # Configure CORS with additional settings for better browser compatibility
    CORS(app, 
         resources={r"/*": {
             "origins": allowed_origins,
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }})

    # Add additional response headers for CORS
    @app.after_request
    def after_request(response):
        # Get the origin from the request
        origin = request.headers.get('Origin')
        
        # If the origin is in our allowed list, set the CORS headers
        if origin in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        return response

# configure database
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# initialize database
db.init_app(app)

# create databse tables if they don't exist
with app.app_context():
    db.create_all()

#inititalize routes
init_routes(app)

#run app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)

