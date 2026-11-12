from flask import Flask, render_template, request
from database import DBhandler

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
    return render_template('product_list.html')

@app.route('/list')
def view_list():
    return render_template('list.html')

@app.route('/review')
def view_review():
    return render_template('review.html')

@app.route('/register-items')
def register_items():
    return render_template('reg_items.html')

@app.route('/register-reviews')
def register_reviews():
    return render_template('reg_reviews.html')

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
    return render_template("product_list.html")

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


if __name__ == '__main__':
    app.run(debug=True)