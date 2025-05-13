from flask import request, jsonify
from models import db, contact_list, organizations, organization_types

def standardize_phone_number(phone):
    if not phone:
        return None
    
    display_phone = phone

    # strip all none digit characters except + for country code
    phone = phone.strip()
    if phone.startswith("+"):
        standardized = '+' + ''.join([c for c in phone[1:] if c.isdigit()])
    else:
        standardized = '+1' + ''.join([c for c in phone if c.isdigit()])

    if len(standardized) == 3:
        return None
    
    return standardized

def init_routes(app):
    @app.route("/")
    def home():
        return "AWS RDS Contact Manager API is running!"

    @app.route("/insert", methods=["POST"])
    def insert():
        data = request.json

        # store original phone number for display
        original_phone = None
        if "phone_number" in data:
            original_phone = data["phone_number"]
            data["phone_number"] = standardize_phone_number(data["phone_number"])

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
            "organization": c.organization, "org_type": c.org_type, "twitter": c.twitter
        } for c in contacts])

    @app.route("/search", methods=["GET"])
    def search():
        query_params = request.args.to_dict()
        query = contact_list.query
        for field, value in query_params.items():
            if value:
                if field in ["full_name", "email", "phone_number", "linkedin", "instagram", "email", "organization", "org_type", "twitter"]:
                    query = query.filter(getattr(contact_list, field).ilike(f"%{value}%"))
        results = query.all()
        return jsonify([{
            "id": c.id, "full_name": c.full_name, "phone_number": c.phone_number,
            "linkedin": c.linkedin, "instagram": c.instagram, "email": c.email,
            "organization": c.organization, "org_type": c.org_type, "twitter": c.twitter
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
        
        for key, value in data.items():
            setattr(contact, key, value)

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