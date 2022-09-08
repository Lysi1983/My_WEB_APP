from flask import Flask, render_template, request,url_for


app = Flask(__name__, static_folder="Static", template_folder="template")

@app.route('/')
def home():
    return render_template("main_view.html")
@app.route('/work_data')
def work_data():
    return render_template("work_data.html")


if __name__ == "__main__":
    app.run(debug=True)

