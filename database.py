from datetime import date
import pyrebase
import json
import hashlib


class DBhandler:
    def __init__(self):
        with open('./authentication/firebase_auth.json') as f:
            config = json.load(f)
        firebase = pyrebase.initialize_app(config)
        self.db = firebase.database()
    
    def insert_item(self, name, data, img_path):
        item_info = {
            "seller_id": data["seller_id"],
            "price": int(data["price"]),
            "address": data["address"],
            "status": data["status"],
            "email": data["email"],
            "img_path": img_path
        }

        self.db.child("item").child(name).set(item_info)
        return True
    def user_duplicate_check(self, id_string):
        users = self.db.child("user").get()
        if users.val() is None:
            return True
        for res in users.each():
            if res.val()['id'] == id_string:
                return False
        return True

    def insert_user(self, data, pw):
        if not self.user_duplicate_check(str(data['id'])):
            return False
        user_info = {
            "id": data['id'],
            "pw": hashlib.sha256(pw.encode('utf-8')).hexdigest(),
            "nickname": data['nickname']
        }
        self.db.child("user").push(user_info)
        return True

    def get_products(self):
        records = self.db.child("item").get().val() or {}
        products = []

        for key, item in sorted(records.items()):
            if not isinstance(item, dict):
                continue

            products.append({
                "key": key,
                "name": key,
                "price": int(item.get("price", 0) or 0),
                "img_path": item.get("img_path") or "",
            })

        return products

    def get_items(self):
        return self.db.child("item").get().val()

    def get_item_byname(self, name):
        return self.db.child("item").child(name).get().val()
    
    def set_heart(self, user_id, name, liked):
        self.db.child("heart").child(str(user_id)).child(name).child("liked").set(liked)
        return liked
    def get_heart(self,user_id, name):
        result = self.db.child("heart").child(str(user_id)).child(name).child("liked").get()
        if result.val() is None:
            return False
        return result.val()

    def get_giveaways(self):
        records = self.db.child("giveaway").get().val()

        if records is None:
            return []

        if not isinstance(records, dict):
            raise ValueError("giveaway 데이터는 고유 키별로 저장해야 합니다.")

        status_labels = {
            "high": "상",
            "middle": "중",
            "low": "하",
        }

        weekdays = "월화수목금토일"
        giveaways = []

        for key, item in sorted(records.items()):
            if not isinstance(item, dict):
                continue

            sharing_date = str(item.get("sharingDate") or "").strip()
            sharing_time = str(item.get("sharingTime") or "").strip()
            status = str(item.get("productStatus") or "").strip()

            # 2026-11-23 → 11.23(월)
            if sharing_date:
                try:
                    parsed_date = date.fromisoformat(sharing_date)

                    sharing_date = (
                        f"{parsed_date.month:02}.{parsed_date.day:02}"
                        f"({weekdays[parsed_date.weekday()]})"
                    )
                except ValueError:
                    # "날짜 협의"처럼 날짜 형식이 아닌 내용은 그대로 표시
                    pass

            schedule = " ".join(
                value
                for value in [sharing_date, sharing_time]
                if value
            )

            giveaways.append({
                "key": key,
                "name": item.get("productName") or "이름 없는 물품",
                "image": item.get("freeImage") or "",
                "place": item.get("sharingLocation") or "장소 미입력",
                "schedule": schedule or "일정 미입력",
                "condition": status_labels.get(
                    status,
                    status or "미입력"
                ),
            })

        return giveaways

