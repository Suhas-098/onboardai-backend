from app import app
from models.user import User
import jwt
import datetime
import json

app.config['TESTING'] = True
with app.app_context():
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        print("Admin user not found.")
        exit(1)
        
    token = jwt.encode({
        "sub": str(admin.id),
        "role": admin.role,
        "name": admin.name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    with app.test_client() as client:
        print("\n--- GET /api/insights ---")
        res = client.get('/api/insights', headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print(json.dumps(res.get_json(), indent=2))
        else:
            print(res.data)
