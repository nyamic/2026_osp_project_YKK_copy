from flask import Flask, jsonify, render_template, request, session
from requests.exceptions import RequestException
from database import DBhandler
from requests.exceptions import RequestException

app = Flask(__name__)

try:
    DB = DBhandler()
except FileNotFoundError:
    DB = None

DB_DISABLED_MESSAGE = """
    <script>
        alert("DB가 연결되지 않아 사용할 수 없는 기능입니다.");
        history.back();
    </script>
"""

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )

@app.route('/')
def hello():
    return render_template('main.html')
    
@app.route("/view_detail/<name>")
def view_item_detail(name):
    data = DB.get_item_byname(str(name))
    img_path = data.get('img_path') if data else None
    return render_template("product_detail.html", name=name, data=data, img_path=img_path)

@app.route('/register-items')
def register_items():
    return render_template('reg_items.html')

@app.route("/submit_item")
def reg_item_submit():
    name=request.args.get("name")
    status=request.args.get("status")
    return "Input name:" + name + " input status:" + status

@app.route("/submit_item_post", methods=["POST"])
def reg_item_submit_post():
        if DB is None:
            return DB_DISABLED_MESSAGE
        image_file=request.files["picture"]
        if image_file and image_file.filename:
            if not allowed_file(image_file.filename):
                return """
    <script>
        alert("지원하지 않는 이미지 형식입니다.\\nPNG, JPG, JPEG, GIF, WEBP 파일만 업로드할 수 있습니다.");
        history.back();
    </script>
    """
        image_file.save("static/images/{}".format(image_file.filename))
        data=request.form
        DB.insert_item(data["product_name"], data, image_file.filename)
        return render_template("result.html", data=data,
                               img_path="static/images/{}".format(image_file.filename))

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/signup_post", methods=['POST'])
def register_user():
    if DB is None:
        return DB_DISABLED_MESSAGE
    data=request.form
    pw=request.form['pw']
    if DB.insert_user(data,pw):
        return render_template("login.html")
    else:
        return render_template("signup.html", error="User ID already exists!")

# TODO: 홈 화면은 이번 제출물에서 제외 - 임시 주석처리
# @app.route("/main")
# def main_page():
#     return render_template("main.html")

@app.route("/products")
def product_list():
    products = []
    list_error = None

    if DB is None:
        list_error = "DB 설정이 없어 상품 목록을 불러올 수 없습니다."
    else:
        try:
            products = DB.get_products()
        except RequestException:
            app.logger.exception("상품 목록 조회 실패")
            list_error = (
                "상품 목록을 불러오지 못했습니다. "
                "잠시 후 다시 시도해 주세요."
            )

    # 한 페이지에 상품 6개 표시
    per_page = 6
    total_pages = (len(products) + per_page - 1) // per_page

    # 잘못된 페이지 번호는 유효한 범위로 조정
    page = request.args.get("page", default=1, type=int)
    page = min(max(page, 1), max(total_pages, 1))

    start = (page - 1) * per_page

    return render_template(
        "product_list.html",
        products=products[start:start + per_page],
        page=page,
        total_pages=total_pages,
        list_error=list_error,
    ), (503 if list_error else 200)

@app.route("/products/detail")
def product_detail():
    return render_template("product_detail.html")

@app.route("/products/register")
def product_register():
    return render_template("product_register.html")

@app.route("/reviews")
def review_list():
    return render_template("review_list.html")

@app.route("/reviews/detail")
def review_detail():
    return render_template("review_detail.html")

@app.route("/reviews/register")
def review_register():
    return render_template("review_register.html")

@app.route("/item_like/<name>", methods=["GET", "POST"])
def item_like(name):
    user_id = session.get("id")
    if user_id is None:
        return jsonify({"error": "Login required"}), 401
    if request.method == "GET":
        return jsonify({"liked": DB.get_heart(user_id, name)})  
    data = request.get_json()
    saved = DB.set_heart(user_id, name, data["liked"])
    return jsonify({"liked": saved})
@app.route("/wishlist")
def wishlist():
    return render_template("wishlist.html")

@app.route("/giveaways")
def giveaway_home():
    giveaways = []
    list_error = None

    if DB is None:
        list_error = "DB 설정이 없어 무료나눔 목록을 불러올 수 없습니다."
    else:
        try:
            giveaways = DB.get_giveaways()
        except (RequestException, ValueError, TypeError):
            app.logger.exception("무료나눔 목록 조회 실패")
            list_error = (
                "무료나눔 목록을 불러오지 못했습니다. "
                "잠시 후 다시 시도해 주세요."
            )

    # 한 페이지에 물품 6개 표시
    per_page = 6
    total_pages = (len(giveaways) + per_page - 1) // per_page

    # 잘못된 페이지 번호는 유효한 범위로 조정
    page = request.args.get("page", default=1, type=int)
    page = min(max(page, 1), max(total_pages, 1))

    start = (page - 1) * per_page

    # 현재 페이지 주변의 페이지 번호 표시
    page_numbers = range(
        max(1, page - 2),
        min(total_pages, page + 2) + 1
    )

    return render_template(
        "giveaway_home.html",
        giveaways=giveaways[start:start + per_page],
        page=page,
        total_pages=total_pages,
        page_numbers=page_numbers,
        list_error=list_error,
    ), (503 if list_error else 200)
  

if __name__ == '__main__':
    app.run(debug=True)
