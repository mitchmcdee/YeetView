import csv
from flask import Flask, render_template, jsonify, request
from show_attend_and_tell.api import *

YEET_VIEW_APP = Flask(__name__)

test_model = show_and_tell_model()

@YEET_VIEW_APP.route("/")
def index():
    return render_template('index.html')

@YEET_VIEW_APP.route("/upload_image_list", methods=['POST'])
def image_list():
    json_data = request.get_json()
    test_model.process_list(json_data['images'])

@YEET_VIEW_APP.route("/get_result/<result>", methods=['GET'])
def get_results(result):
    return jsonify({'result': test_model.get_result(result)})

if __name__ == "__main__":
    YEET_VIEW_APP.run(ssl_context='adhoc', host='0.0.0.0', port=443)
