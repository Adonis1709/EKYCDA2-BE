import mimetypes
import os
import traceback
from datetime import datetime, timedelta

import jwt
import requests
from flask import Blueprint
from flask import current_app as app
from flask import json, redirect, render_template, request
from flask_mail import Mail, Message
from minio import Minio
from sqlalchemy import select, update
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from flaskr.database import db
from flaskr.database.MailRecord import MailRecord
from flaskr.database.User import User
from flaskr.util import STATUS_ACCOUNT, TYPEOF_TRANSFER, response_api

client = Minio(
        "s3.techhaus.vn",
        access_key="dacntt2",
        secret_key="Thanhduy1997",
        region="ap-southeast-1",
        secure=True,
    )

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
def register():
    body =  request.get_json()
    user = User(
        firstname = body["firstname"],
        lastname = body["lastname"],
        email = body["email"],
        username = body["username"],
        password =  generate_password_hash(body["password"]),
        status =  body["status"],
        isLogin = body["isLogin"]
    )
    try:
        db.create_all()
        db.session.add(user)
        db.session.commit()
        data={}
        data["user"] = user.to_dict()
        return json.dumps(response_api(data))
    except :
        traceback.print_exc()
        error = f"User {user.username} is already registered."
        data={}
        return json.dumps(response_api(data, error, 0))


@bp.route("/login", methods=["POST"])
def login():
    body =  request.get_json()
    username = body["username"]
    password = body["password"]
    try:
        user = db.session.execute(db.select(User).filter(User.username == username)).scalar_one()
    except:
        traceback.print_exc()
        user = None

    if  user is None or not check_password_hash(user.password, password):
        data={}
        data["user"] = None
        return json.dumps(response_api(data,"Password no match",0))
    else:
        data={}
        data["user"] = user.to_dict()
        return json.dumps(response_api(data))

@bp.route("/get-user-verify", methods=["POST"])
def get_email_verify():
    body =  request.get_json()
    username = body["username"]
    user = db.session.execute(db.select(User).filter(User.username == username)).scalar_one()

    try:
        if int(user.status) >= STATUS_ACCOUNT.verify_card: #2 is status verify card
            data={}
            data["user"] = user.to_dict()
            return json.dumps(response_api(data))
        else:
            data={}
            return json.dumps(response_api(data, "", 0))
    except:
        traceback.print_exc()
        data={}
        return json.dumps(response_api(data,"Account was verify!",0))
   

@bp.route("/send-email-verify", methods=["POST"])
def send_email_verify():
    mail = Mail(app)
    body =  request.get_json()
    username = body["username"]
    
    try:
        user = db.session.execute(db.select(User).filter(User.username == username, User.status == 0)).scalar_one()
    except:
        traceback.print_exc()
        user = None

    if  user is None:
        data={}
        return json.dumps(response_api(data,"",0))
    else:
        expiresDate = datetime.now() + timedelta(minutes = app.config['TIME_EMAIL_EXPIRED'])
        token = jwt.encode({
            'userId': user.id,
            'token' : str(datetime.timestamp(expiresDate)) 
        }, app.config['SECRET_KEY'])
        mail_record = MailRecord(
            userId = user.id,
            used = False,
            token = token,
            expiresDate = expiresDate,
            typeOf = TYPEOF_TRANSFER.verify,
        )    
        db.create_all()
        db.session.add(mail_record)
        db.session.commit()

        msg = Message('Email verify account from EKYCDA2.', sender = app.config['MAIL_USERNAME'] , recipients = [body["email"]])
        msg.html = render_template('mail.html', 
            url_verify= app.config['IP_ADDRESS'] + "/auth/update-email-verify/" + token
            )
        mail.send(msg)
        return json.dumps(response_api({}))


@bp.route("/update-email-verify/<token>", methods=["GET"])
def update_email_verify(token):
    data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    try:
        mail_record = db.session.execute(
            select(MailRecord).where(
                MailRecord.used == False, 
                MailRecord.expiresDate >= datetime.now(), 
                MailRecord.userId == data["userId"], 
                MailRecord.token == token,
                MailRecord.typeOf == TYPEOF_TRANSFER.verify
            )
        ).scalar_one()
    except: 
        traceback.print_exc()
        return redirect("/")
  
    db.session.execute(
        update(MailRecord)
        .where(MailRecord.id == mail_record.id)
        .values(used = True)
    )
    db.session.execute(
        update(User)
        .where(User.id == data["userId"])
        .values(status = STATUS_ACCOUNT.verify_card)  #2 is status verify card
    )
    db.session.commit()
    user = db.session.execute(db.select(User).filter(User.id == data["userId"])).scalar_one()
    token = jwt.encode(user.to_dict(), app.config['SECRET_KEY'])
    return redirect(f'#!?token={token}')

@bp.route("/verify-card", methods=["POST"])
def verify_card():
        
    image =  request.files["image"]
    type_image =  request.form["typeImage"]
    user = json.loads(request.form["user"])

    file = image

    isExist = os.path.exists(app.config['UPLOAD_FOLDER'])
    if not isExist:
        os.makedirs(app.config['UPLOAD_FOLDER'])
    else:
        print("The new directory is created!")

    filename = secure_filename("card-" + str(datetime.now())+"-" + file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    bucket_name =  app.config["BUCKET_NAME"]
    found = client.bucket_exists(bucket_name)
    if not found:
        client.make_bucket(app.config["BUCKET_NAME"])
    else:
        print("Bucket " + app.config["BUCKET_NAME"] + " already exists")

    client.fput_object(
        app.config["BUCKET_NAME"], 
        filename, 
        app.config['UPLOAD_FOLDER'] + "/" + filename,
        content_type= file.content_type
    )
    
    url = 'https://mailman.techhaus.vn/api/v2/ekyc/card'
    urlImage = client.get_presigned_url("GET",app.config["BUCKET_NAME"], filename, expires=timedelta(minutes = 1))
    payload = {
        "img_url": urlImage
        }
    headers = {
        'content-type': 'application/json',
        'Authorization': 'Basic YTk6NjBiMTgyMThiNGM3MGJmZTA1NzcwYjQ5ZDYwY2I0Mjg0'
        }
    try:
        res = requests.post(url, data=json.dumps(payload), headers=headers)
        data = res.json()["result"]

        if int(data["errorCode"]) == 0:
            data = data["data"]

            info = data["info"]
            
            if type_image == "cardFront" and  data["type"] == "chip_id_card_front":
                db.session.execute((
                    update(User)
                    .where(User.id == user["id"])
                    .values(cardFrontSrc = filename) 
                ))
                db.session.commit()

                user["cardFrontSrc"] = filename
                user["idIdentityCard"] = info["id"]
                user["fullname"] = info["name"]
                user["dateOfBirth"] = info["dob"]
                user["sex"] = info["gender"]
                user["placeOfOrigin"] = info["hometown"]
                user["placeOfResidence"] = info["address"]
                user["dateOfExpiry"] = info["due_date"]
                data={}
                data["user"]=user
                return json.dumps(response_api(data))
            elif type_image == "cardBack" and data["type"] == "chip_id_card_back":
                db.session.execute((
                    update(User)
                    .where(User.id == user["id"])
                    .values(cardBackSrc = filename) 
                ))
                db.session.commit()

                user["cardBackSrc"] = filename
                data={}
                data["user"]=user
                return json.dumps(response_api(data))
            else:
                client.remove_object(app.config["BUCKET_NAME"], filename)
                os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
                data={}
                return json.dumps(response_api(data,"No match type require!!!",-1))
        else:
            client.remove_object(app.config["BUCKET_NAME"], filename)
            os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
            return json.dumps(response_api({},"",0))
    except Exception as e:
        client.remove_object(app.config["BUCKET_NAME"], filename)
        os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
        return json.dumps(response_api({},"",0))


@bp.route("/verify-faceid", methods=["POST"])
def verify_faceid():
    
    face =  request.files["image"]
    user = json.loads(request.form["user"])
    type_image =  request.form["typeImage"]

    isExist = os.path.exists(app.config['UPLOAD_FOLDER'])
    if not isExist:
        os.makedirs(app.config['UPLOAD_FOLDER'])
    else:
        print("The new directory is created!")

    file = face
    filename = secure_filename("faceid-"+ str(datetime.now())+"-" + file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))


    type_image_front = mimetypes.guess_type(app.config['UPLOAD_FOLDER'] + "/" +  user["cardFrontSrc"])[0]
    client.fput_object(
        app.config["BUCKET_NAME"], 
        user["cardFrontSrc"], 
        app.config['UPLOAD_FOLDER'] + "/" + user["cardFrontSrc"],
        content_type = type_image_front
    )
    cardSrc = client.get_presigned_url("GET",app.config["BUCKET_NAME"], user["cardFrontSrc"], expires=timedelta(minutes = 100))


    found = client.bucket_exists(app.config["BUCKET_NAME"])
    if not found:
        client.make_bucket(app.config["BUCKET_NAME"])
    else:
        print("Bucket " + app.config["BUCKET_NAME"] + " already exists")

    client.fput_object(
        app.config["BUCKET_NAME"], 
        filename, 
        app.config['UPLOAD_FOLDER'] + "/" + filename,
        content_type = file.content_type
    )
    faceSrc = client.get_presigned_url("GET",app.config["BUCKET_NAME"], filename, expires=timedelta(minutes = 100))
    

    url = 'https://mailman.techhaus.vn/api/v2/ekyc/face_matching'
    payload = {
        "face": faceSrc,
        "card": cardSrc,
        }
    headers = {
        'content-type': 'application/json',
        'Authorization': 'Basic YTk6NjBiMTgyMThiNGM3MGJmZTA1NzcwYjQ5ZDYwY2I0Mjg0'
        }
    try:
        res = requests.post(url, data=json.dumps(payload), headers=headers)
        data = res.json()

        if int(data["result"]["errorCode"]) == 0:
            data = data["result"]["data"]
            user["faceSrc"] = filename
            db.session.execute((
                    update(User)
                    .where(User.id == user["id"])
                    .values(faceSrc = filename) 
                ))
            db.session.commit()

            if type_image == "faceid" and  int(data["match"]) == 1:
                data={}
                data["user"] = user
                return json.dumps(response_api(data))
            else:
                data={}
                os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
                client.remove_object(app.config["BUCKET_NAME"], filename)
                return json.dumps(response_api(data,"No match type require!!!",-1))
        else:
            os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
            client.remove_object(app.config["BUCKET_NAME"], filename)
            return json.dumps(response_api({}, "", 0))
    except Exception as e:
        traceback.print_exc()
        os.remove(app.config['UPLOAD_FOLDER'] + "/" + filename)
        client.remove_object(app.config["BUCKET_NAME"], filename)
        return json.dumps(response_api({},"",0))