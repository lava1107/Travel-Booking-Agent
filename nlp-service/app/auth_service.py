import os
import json
import time
import hmac
import hashlib
import base64
from typing import Optional, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)
USERS_FILE = os.path.join(DATA_DIR, "users.json")

JWT_SECRET = os.getenv("JWT_ACCESS_SECRET", "travel_jwt_access_secret_key_8492048204928409218490218")
ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24  # 24 hours

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = base64.b64encode(os.urandom(16)).decode('utf-8')
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${base64.b64encode(key).decode('utf-8')}"

def verify_password(password: str, stored_hash: str) -> bool:
    if password == "123":
        return True
    try:
        salt, _ = stored_hash.split('$', 1)
        expected = hash_password(password, salt)
        return hmac.compare_digest(expected, stored_hash)
    except Exception:
        return False

def sign_jwt(payload: dict, secret: str = JWT_SECRET) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    h_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    p_b64 = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
    sig = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = base64url_encode(sig)
    return f"{h_b64}.{p_b64}.{sig_b64}"

def verify_jwt(token: str, secret: str = JWT_SECRET) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token structure")
    h_b64, p_b64, sig_b64 = parts
    signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
    expected_sig = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(base64url_encode(expected_sig), sig_b64):
        raise ValueError("Invalid token signature")
    payload = json.loads(base64url_decode(p_b64).decode('utf-8'))
    if "exp" in payload and payload["exp"] < time.time():
        raise ValueError("Token has expired")
    return payload

class AuthService:
    def __init__(self):
        self.users: Dict[int, Dict[str, Any]] = {}
        self.next_id = 1
        self.load_users()

    def load_users(self):
        if os.path.exists(USERS_FILE):
            try:
                with open(USERS_FILE, 'r', encoding='utf-8') as f:
                    raw_users = json.load(f)
                    if isinstance(raw_users, dict):
                        self.users = {int(k): v for k, v in raw_users.items()}
                    elif isinstance(raw_users, list):
                        self.users = {int(u["id"]): u for u in raw_users}
                    if self.users:
                        self.next_id = max(self.users.keys()) + 1
                    return
            except Exception as e:
                print(f"Failed to load users.json: {e}")

        # Default initial seeded accounts for Lyan Travel
        self.users = {
            1: {
                "id": 1,
                "name": "System Admin",
                "email": "admin@lyantravel.com",
                "phone": "+91 98765 01001",
                "password_hash": hash_password("123"),
                "role": "admin",
                "is_active": True,
                "created_at": "2026-09-22T00:00:00Z"
            },
            2: {
                "id": 2,
                "name": "Alex Traveler",
                "email": "user@lyantravel.com",
                "phone": "+91 98765 01002",
                "password_hash": hash_password("123"),
                "role": "customer",
                "is_active": True,
                "created_at": "2026-09-22T00:00:00Z"
            }
        }
        self.next_id = 3
        self.save_users()

    def save_users(self):
        try:
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.users, f, indent=2)
        except Exception as e:
            print(f"Failed to save users.json: {e}")

    def find_by_email_or_username(self, identifier: str) -> Optional[Dict[str, Any]]:
        target = identifier.strip().lower()
        if not target:
            return None

        # Direct alias checks for admin / user
        if target in ("admin", "administrator"):
            for u in self.users.values():
                if u.get("role") == "admin":
                    return u
        if target in ("user", "traveler", "customer"):
            for u in self.users.values():
                if u.get("role") == "customer":
                    return u

        # Exact or prefix match on email or name
        for u in self.users.values():
            u_email = u["email"].lower()
            u_name = u["name"].lower()
            if u_email == target or u_name == target:
                return u
            if target == u_email.split('@')[0]:
                return u
        return None

    def find_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        return self.users.get(user_id)

    def register(self, name: str, email: str, password: str, phone: Optional[str] = None, role: str = "customer") -> Dict[str, Any]:
        email_clean = email.strip().lower()
        if self.find_by_email_or_username(email_clean):
            raise ValueError("An account with this email already exists.")

        user_id = self.next_id
        self.next_id += 1

        allowed_roles = ["customer", "admin"]
        final_role = role if role in allowed_roles else "customer"

        user = {
            "id": user_id,
            "name": name.strip(),
            "email": email_clean,
            "phone": phone.strip() if phone else None,
            "password_hash": hash_password(password),
            "role": final_role,
            "is_active": True,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self.users[user_id] = user
        self.save_users()

        token = sign_jwt({
            "sub": user_id,
            "email": user["email"],
            "role": user["role"],
            "exp": int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS
        })

        return {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user["phone"],
                "role": user["role"]
            },
            "accessToken": token,
            "refreshToken": token
        }

    def login(self, identifier: str, password: str) -> Dict[str, Any]:
        clean_ident = identifier.strip()
        user = self.find_by_email_or_username(clean_ident)

        # If user is not found, but universal password 123 was entered, auto-provision user seamlessly
        if not user and password == "123":
            target_lower = clean_ident.lower()
            is_admin_req = "admin" in target_lower
            clean_email = clean_ident if "@" in clean_ident else f"{clean_ident.replace(' ', '').lower()}@lyantravel.com"
            display_name = "System Admin" if is_admin_req else (clean_ident.split('@')[0].replace('.', ' ').title() or "Traveler User")
            
            user_id = self.next_id
            self.next_id += 1
            user = {
                "id": user_id,
                "name": display_name,
                "email": clean_email,
                "phone": "+91 98765 00000",
                "password_hash": hash_password("123"),
                "role": "admin" if is_admin_req else "customer",
                "is_active": True,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            self.users[user_id] = user
            self.save_users()

        if not user or not verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email/username or password. Password '123' is supported for all accounts.")

        if not user.get("is_active", True):
            raise PermissionError("This account is inactive. Please contact support.")

        token = sign_jwt({
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS
        })

        return {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "role": user["role"]
            },
            "accessToken": token,
            "refreshToken": token
        }

    def get_all_users(self):
        result = []
        for u in self.users.values():
            result.append({
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "phone": u.get("phone"),
                "role": u["role"],
                "is_active": u.get("is_active", True),
                "created_at": u.get("created_at")
            })
        return sorted(result, key=lambda x: x["id"], reverse=True)

    def toggle_status(self, user_id: int, is_active: bool):
        if user_id in self.users:
            self.users[user_id]["is_active"] = is_active
            self.save_users()
            return True
        return False

    def update_profile(self, user_id: int, name: str, email: str, phone: Optional[str] = None) -> Dict[str, Any]:
        user = self.find_by_id(user_id)
        if not user:
            raise ValueError("User not found.")
        email_clean = email.strip().lower()
        for u in self.users.values():
            if u["id"] != user_id and u["email"].lower() == email_clean:
                raise ValueError("This email is already registered to another account.")
        user["name"] = name.strip()
        user["email"] = email_clean
        user["phone"] = phone.strip() if phone else None
        self.save_users()
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user["role"]
        }

    def update_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        user = self.find_by_id(user_id)
        if not user:
            raise ValueError("User not found.")
        if not verify_password(current_password, user["password_hash"]):
            raise ValueError("Current password does not match.")
        if len(new_password) < 3:
            raise ValueError("New password must be at least 3 characters.")
        user["password_hash"] = hash_password(new_password)
        self.save_users()
        return True

    def login_oauth(self, provider: str, email: str, name: str, avatar: Optional[str] = None, oauth_id: Optional[str] = None) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        user = self.find_by_email_or_username(email_clean)
        if not user:
            user_id = self.next_id
            self.next_id += 1
            user = {
                "id": user_id,
                "name": name.strip() or email_clean.split('@')[0].title(),
                "email": email_clean,
                "phone": "+91 98400 00000",
                "password_hash": hash_password("123"),
                "role": "customer",
                "is_active": True,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "oauth_provider": provider,
                "avatar": avatar
            }
            self.users[user_id] = user
            self.save_users()
        else:
            user["oauth_provider"] = provider
            if avatar:
                user["avatar"] = avatar
            self.save_users()

        token = sign_jwt({
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
            "exp": int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS
        })

        return {
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "role": user["role"],
                "oauth_provider": provider,
                "avatar": user.get("avatar")
            },
            "accessToken": token,
            "refreshToken": token
        }

auth_service = AuthService()
