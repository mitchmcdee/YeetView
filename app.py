import csv
from waitress import serve
from flask import Flask, render_template, jsonify


YEET_VIEW_APP = Flask(__name__)


@YEET_VIEW_APP.route("/")
def index():
    return render_template('index.html')


# @YEET_VIEW_APP.route("/getEquipmentUpdate", methods=['POST'])
# def get_equipment_update():
#     global equipment_index
#     equipment_update = {k: v[equipment_index % len(v)] for k, v in equipment.items()}
#     equipment_index += DELTA_UPDATE
#     return jsonify(equipment_update)


if __name__ == "__main__":
    serve(YEET_VIEW_APP)
