from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ARRAY

db = SQLAlchemy()

class contact_list(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(ARRAY(db.String(255)))
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    email = db.Column(ARRAY(db.String(255)))
    organization = db.Column(db.String(255))
    org_type = db.Column(db.String(255))
    twitter = db.Column(db.String(255))

    # Add indexes for searchable fields to improve query performance
    __table_args__ = (
        db.Index('idx_full_name', full_name),
        db.Index('idx_phone_number', phone_number),
        db.Index('idx_email', email),
        db.Index('idx_organization', organization),
        db.Index('idx_org_type', org_type),
        db.Index('idx_twitter', twitter),
        #GIN indexes for array fields
        db.Index('gin_phone_number', phone_number, postgresql_using='gin'),
        db.Index('gin_email', email, postgresql_using='gin'),
    )

class organizations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

class organization_types(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

class sectors(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)