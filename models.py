from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class contact_list(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(50))
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    email = db.Column(db.String(255))
    organization = db.Column(db.String(255))
    org_type = db.Column(db.String(255))
    twitter = db.Column(db.String(255))

class organizations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

class organization_types(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)