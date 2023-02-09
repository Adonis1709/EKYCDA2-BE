import os
import random
from datetime import datetime, timedelta

from flask import Blueprint
from flask import current_app as app
from flask import json, render_template, request
from flask_mail import Mail, Message
from sqlalchemy import or_, select, update
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from flaskr.database import db
from flaskr.database.MailRecord import MailRecord
from flaskr.database.User import User
from flaskr.util import TYPEOF_TRANSFER, response_api

bp = Blueprint("user", __name__, url_prefix="/user")

@bp.route("/users", methods=["GET"])
def users():
    searchModel = json.loads(request.args.get('searchModel'))
    searchOption = json.loads(request.args.get('searchOption'))

    query = User.query
    
    if 'phone' in searchModel and 'fullname' in searchModel and searchModel["phone"] != "" and searchModel["fullname"] != "" :
        query = query.filter(or_(User.fullname.like(f'%{searchModel["fullname"]}%'), User.phone.like(f'%{searchModel["phone"]}%')))
    if 'notIds' in  searchModel:
        query = query.filter(User.id.not_in(searchModel['notIds']))

    paginations = query.paginate(page = searchOption['page'], per_page = searchOption['per_page'])
    data = {}
    data['records'] = list(map(lambda tf : tf.to_dict(), paginations.items))
    data['pages'] = paginations.pages
    data['hasNext'] = paginations.has_next
    data['hasPrev'] = paginations.has_prev
    return json.dumps(response_api(data))
   
@bp.route("/user/<id>", methods=["GET"])
def userById(id):
    user = db.session.execute(db.select(User).filter(User.id == int(id))).scalar_one()
    data = {}
    data['user'] = user.to_dict()
    return json.dumps(response_api(data))

@bp.route("/user", methods=["PATCH"])
def update_account():
    user = json.loads(request.form["user"])

    if not os.path.exists(app.config['UPLOAD_PUBLIC']):
        os.makedirs(app.config['UPLOAD_PUBLIC'])
    else:
        print("The new directory is created!")

    try:
        image =  request.files["avatar"]
        file = image
        filename = secure_filename("avatar-"+ str(datetime.now())+"-" + file.filename)
        file.save(os.path.join(app.config['UPLOAD_PUBLIC'], filename))
    except:
        image = None
        filename = None
        
    
    if os.path.exists(app.config['UPLOAD_PUBLIC'] + "/" + user["avatarSrc"]) and image:
        os.remove(app.config['UPLOAD_PUBLIC'] + "/" + user["avatarSrc"])
    
    if filename:
        user["avatarSrc"] = filename
    try:
        db.session.execute((
                    update(User)
                    .where(User.id == user["id"])
                    .values(
                        amountBalance = user["amountBalance"],
                        status = user["status"],
                        avatarSrc = user["avatarSrc"],
                        idIdentityCard = user["idIdentityCard"],
                        fullname = user["fullname"],
                        dateOfBirth = user["dateOfBirth"],
                        sex = user["sex"],
                        placeOfOrigin = user["placeOfOrigin"],
                        placeOfResidence = user["placeOfResidence"],
                        dateOfExpiry = user["dateOfExpiry"],
                        phone = user["phone"],
                            )
                ))
        user = db.session.execute(db.select(User).filter(User.id == user['id'])).scalar_one()
        db.session.commit()
        data={}
        data["user"] = user.to_dict()
        return json.dumps(response_api(data))
    except Exception as e:
        print(e)
        print("Update account error")
        data={}
        return json.dumps(response_api(data,"",0))


@bp.route("/change-password", methods=["POST"])
def change_password():
    body =  request.get_json()
    user = body["user"]
    old_password = body["oldPassword"]
    new_password = body["newPassword"]
    try:
        userdb = db.session.execute(db.select(User).filter(User.id == user['id'])).scalar_one()
    except:
        data={}
        return json.dumps(response_api(data,'', 0)) #user not match

    if not check_password_hash(userdb.password, old_password):
        data={}
        return json.dumps(response_api(data,"Old password no match", -1))#Old password not match
    userdb.password = generate_password_hash(new_password)
    db.session.commit()
    data={}
    data["user"] = userdb.to_dict()
    return json.dumps(response_api(data))   
   

@bp.route("/reset-password", methods=["POST"])
def reset_password():
    body =  request.get_json()

    username = body["username"]
    email = body["email"]

    otp = body["otp"]

    password = body["password"]
    try:
        userdb = db.session.execute(db.select(User).filter(or_(User.username == username))).scalar_one()
    except:
        data={}
        return json.dumps(response_api(data,'', 0)) #user not match
    if  userdb.email != email:
        data={}
        return json.dumps(response_api(data,'', -1)) #email not match

    if otp == '' or otp is None:
        mail = Mail(app)
        code = f'{random.randint(0,999999)}'
        for i in range(0, len(code)-6):
            code = "0"+ code
        expiresDate = datetime.now() + timedelta(minutes = app.config['TIME_EMAIL_EXPIRED'])
        db.session.execute(
            update(MailRecord)
            .where(MailRecord.userId == userdb.id, MailRecord.typeOf == TYPEOF_TRANSFER.reset_password, MailRecord.expiresDate >= datetime.now() )
            .values(used = True)
        )
        mail_record = MailRecord(
                    userId = userdb.id,
                    used = False,
                    token = code,
                    transferId = None,
                    expiresDate = expiresDate,
                    typeOf = TYPEOF_TRANSFER.reset_password
                )    
        db.create_all()
        db.session.add(mail_record)
        db.session.commit()

        msg = Message('Email verify reset password from EKYCDA.', sender = app.config['MAIL_USERNAME'] , recipients = [userdb.email])
        msg.html = render_template('reset-password.html', 
            code =  mail_record.token
        )
        mail.send(msg)
        data={}
        return json.dumps(response_api(data,'', 1)) #send mail successs

    try:
        mail_record = db.session.execute(
            select(MailRecord).filter(
                MailRecord.used == False, 
                MailRecord.expiresDate >= datetime.now(), 
                MailRecord.userId == userdb.id, 
                MailRecord.token == otp,
                MailRecord.typeOf == TYPEOF_TRANSFER.reset_password
            )
        ).scalar_one()    
    except:
        data={}
        return json.dumps(response_api(data,'', -1)) #opt mail not match
        
    if password=='' or password is None:
        data={}
        return json.dumps(response_api(data,'', 1)) #Confirm otp code success

    userdb.password = generate_password_hash(password)
    mail_record.used = True
    db.session.commit()
    data={}
    data["user"] = userdb.to_dict()
    return json.dumps(response_api(data))   
   
