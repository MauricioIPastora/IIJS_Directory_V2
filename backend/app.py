import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes import init_routes

# this loads env variables
load_dotenv()

# get database URL from environment with fallback
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:Password@contacts-db.c3we4miwyfva.us-east-1.rds.amazonaws.com/contacts")
DEBUG = os.getenv("FLASK_ENV") == "development"
PORT = int(os.getenv("PORT", 5000))
#initialize flask app lesgooo
app = Flask(__name__)

#configure CORS to allow requests from the frontend
if DEBUG:
    CORS(app, resources={r"/*": {"origins": "*"}}) #replace * with frontend domain later
else:
    CORS(app, resources={r"/*": {"origins": [
        "" #S3 website URL
        "" #cloudfront distribution domain
    ]}})
# configure database
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False

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