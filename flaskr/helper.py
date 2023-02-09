import traceback

import jwt
from flask import Blueprint
from flask import current_app as app
from flask import json, request

from flaskr.util import response_api

bp = Blueprint("helper", __name__, url_prefix="/helper")

@bp.route("/decode", methods=["POST"])
def decode():
    body =  request.get_json()
    token = body["token"]
    try: 
        user = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except:
        traceback.print_exc()
        user = {}
    data = {}
    data["user"] = user
    return json.dumps(response_api(data))
    
