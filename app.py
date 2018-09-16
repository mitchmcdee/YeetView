import csv
from flask import Flask, render_template, jsonify, request
from show_attend_and_tell.api import *

YEET_VIEW_APP = Flask(__name__)

test_model = show_and_tell_model()
images = set()

@YEET_VIEW_APP.route("/")
def index():
    return render_template('index.html')

@YEET_VIEW_APP.route("/upload_image_list", methods=['POST'])
def image_list():
    unique_images = []
    for image in request.get_json()['images']:
        if image not in images:
            unique_images.append(image)
            images.add(image)

    if len(unique_images) != 0:
        print(len(unique_images))
        test_model.process_list(unique_images)

    return '', 200

@YEET_VIEW_APP.route("/get_result", methods=['GET'])
def get_result():
    pano = request.args.get('pano')
    heading = request.args.get('heading')
    pitch = request.args.get('pitch')
    print(pano, heading, pitch)
    print('streetview?size=640x640&pano=' + pano + '&heading=' + heading + '&pitch=' + pitch)
    return jsonify({'result': test_model.get_result('streetview?size=640x640&pano=' + pano + '&heading=' + heading + '&pitch=' + pitch)})

if __name__ == "__main__":
    YEET_VIEW_APP.run(ssl_context='adhoc', host='0.0.0.0', port=443)
