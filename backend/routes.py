from flask import request, jsonify
from models import db, contact_list, organizations, organization_types, sectors
from sqlalchemy import or_

field_keys = [
    "full_name", "email", "phone_number",
    "linkedin", "instagram", "organization",
    "org_type", "twitter", "country", "sector"
]

def standardize_phone_number(phone):
    if not phone:
        return None
    
    # Strip whitespace and normalize the input
    phone = phone.strip()
    
    # If starts with +, preserve country code and remove all non-digits after +
    if phone.startswith("+"):
        standardized = '+' + ''.join([c for c in phone[1:] if c.isdigit()])
    else:
        # Default to +1 (US) and remove all non-digits
        standardized = '+1' + ''.join([c for c in phone if c.isdigit()])
    
    # Return None if no actual digits (just + sign)
    if len(standardized) <= 1:
        return None
    
    return standardized

def to_list(val):
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        return [v.strip() for v in val.split(",") if v.strip()]
    return []

def init_routes(app):
    @app.route("/")
    def home():
        return "AWS RDS Contact Manager API is running!"

    @app.route("/insert", methods=["POST"])
    def insert():
        data = request.json

        # standardize phone number for consistent storage
        if "phone_number" in data:
            phones = data["phone_number"]
            if isinstance(phones, list):
                standardized = [standardize_phone_number(p) for p in phones if standardize_phone_number(p)]
                data["phone_number"] = standardized  # Keep as list
            else:
                data["phone_number"] = [standardize_phone_number(phones)] if standardize_phone_number(phones) else []

        if "email" in data:
            emails = data["email"]
            if isinstance(emails, list):
                trimmed = [e.strip() for e in emails if e.strip()]
                data["email"] = trimmed  # Keep as list
            else:
                data["email"] = [emails.strip()] if emails.strip() else []

        # Don't call to_list - data is already in correct format
        # data["phone_number"] = to_list(data.get("phone_number", []))
        # data["email"] = to_list(data.get("email", []))

        contact = contact_list(**data)
        db.session.add(contact)
        db.session.commit()
        return jsonify({"message": "Contact added successfully!"})

    @app.route("/view", methods=["GET"])
    def view():
        contacts = contact_list.query.all()
        return jsonify([{
            "id": c.id, "full_name": c.full_name, "phone_number": c.phone_number,
            "linkedin": c.linkedin, "instagram": c.instagram, "email": c.email,
            "organization": c.organization, "org_type": c.org_type, "twitter": c.twitter,
            "country": c.country, "sector": c.sector
        } for c in contacts])

    @app.route("/search", methods=["GET"])
    def search():
        query_params = request.args.to_dict()
        query = contact_list.query
        for field, value in query_params.items():
            if value:
                if field in ["full_name", "email", "phone_number", "linkedin", "instagram", "email", "organization", "org_type", "twitter", "country", "sector"]:
                    query = query.filter(getattr(contact_list, field).ilike(f"%{value}%"))

        kw = query_params.get("q")
        if kw:
            il = f"%{kw}%"
            query = query.filter(
            or_(*[
                getattr(contact_list, f).ilike(il)
                for f in field_keys
            ])
        )

        results = query.all()
        return jsonify([{
            "id": c.id, "full_name": c.full_name, "phone_number": c.phone_number,
            "linkedin": c.linkedin, "instagram": c.instagram, "email": c.email,
            "organization": c.organization, "org_type": c.org_type, "twitter": c.twitter,
            "country": c.country, "sector": c.sector
        } for c in results])

    @app.route("/delete/<int:id>", methods=["DELETE"])
    def delete(id):
        contact = contact_list.query.get(id)
        if contact:
            db.session.delete(contact)
            db.session.commit()
            return jsonify({"message": "Contact deleted successfully!"})
        return jsonify({"error": "Contact not found!"}), 404

    @app.route("/update/<int:id>", methods=["PUT"])
    def update(id):
        data = request.json
        contact = contact_list.query.get(id)
        if not contact:
            return jsonify({"error": "Contact not found!"}), 404
        
        # Update all fields
        if "full_name" in data:
            contact.full_name = data["full_name"]
        if "phone_number" in data:
            phones = data["phone_number"]
            if isinstance(phones, list):
                standardized = [standardize_phone_number(p) for p in phones if standardize_phone_number(p)]
                contact.phone_number = standardized
            else:
                contact.phone_number = [standardize_phone_number(phones)] if standardize_phone_number(phones) else []
        if "email" in data:
            emails = data["email"]
            if isinstance(emails, list):
                contact.email = [e.strip() for e in emails if e.strip()]
            else:
                contact.email = [emails.strip()] if emails.strip() else []
        if "organization" in data:
            contact.organization = data["organization"]
        if "org_type" in data:
            contact.org_type = data["org_type"]
        if "linkedin" in data:
            contact.linkedin = data["linkedin"]
        if "instagram" in data:
            contact.instagram = data["instagram"]
        if "twitter" in data:
            contact.twitter = data["twitter"]
        if "country" in data:
            contact.country = data["country"]
        if "sector" in data:
            contact.sector = data["sector"]

        db.session.commit()
        return jsonify({"message": "Contact updated successfully"})

    @app.route("/get_organizations", methods=["GET"])
    def get_organizations():
        orgs = organizations.query.all()
        return jsonify([{"id": o.id, "name": o.name} for o in orgs])

    @app.route("/get_organization_types", methods=["GET"])
    def get_orgtypes():
        org_types = organization_types.query.all()
        return jsonify([{"id": t.id, "name": t.name} for t in org_types])

    @app.route("/add_organization", methods=["POST"])
    def add_organization():
        data = request.json
        org = organizations(**data)
        db.session.add(org)
        db.session.commit()
        return jsonify({"message": "Organization added successfully!"})

    @app.route("/delete_organization/<int:id>", methods=["DELETE"])
    def delete_organization(id):
        org = organizations.query.get(id)
        if org:
            db.session.delete(org)
            db.session.commit()
            return jsonify({"message": "Organization deleted successfully!"})
        return jsonify({"error": "Organization not found!"}), 404

    @app.route('/add_organization_type', methods=["POST"])
    def add_organization_type():
        data = request.json
        org_type = organization_types(**data)
        db.session.add(org_type)
        db.session.commit()
        return jsonify({"message": "Organization type added successfully!"})

    @app.route('/delete_organization_type/<int:id>', methods=["DELETE"])
    def delete_organization_type(id):
        org_type = organization_types.query.get(id)
        if org_type:
            db.session.delete(org_type)
            db.session.commit()
            return jsonify({"message": "Organization type deleted successfully!"})
        return jsonify({"error": "Organization type not found!"}), 404

    @app.route('/get_sectors', methods=['GET'])
    def get_sectors():
        all_sectors = sectors.query.all()
        return jsonify([{'id': s.id, 'name': s.name} for s in all_sectors])

    @app.route('/add_sector', methods=['POST'])
    def add_sector():
        data = request.get_json()
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        if sectors.query.filter_by(name=name).first():
            return jsonify({'error': 'Sector already exists'}), 400
        new_sector = sectors(name=name)
        db.session.add(new_sector)
        db.session.commit()
        return jsonify({'id': new_sector.id, 'name': new_sector.name}), 201

    @app.route('/delete_sector/<int:id>', methods=['DELETE'])
    def delete_sector(id):
        sector = sectors.query.get(id)
        if not sector:
            return jsonify({'error': 'Sector not found'}), 404
        db.session.delete(sector)
        db.session.commit()
        return jsonify({'result': 'success'})