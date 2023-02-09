import random
import traceback
from datetime import datetime, timedelta

from flask import Blueprint
from flask import current_app as app
from flask import json, render_template, request
from flask_mail import Mail, Message
from sqlalchemy import or_, select, update

from flaskr.database import db
from flaskr.database.MailRecord import MailRecord
from flaskr.database.TransferRecord import TransferRecord
from flaskr.database.User import User
from flaskr.util import (STATUS_TRANSFER, TYPEOF_TRANSFER, getRefTransfer,
                         notificationTransfer, response_api)

bp = Blueprint("transfer", __name__, url_prefix="/transfer")

@bp.route("/top-up", methods=["POST"])
def topup():
    body =  request.get_json()
    money = body["money"]
    note = body["note"]
    
    user = db.session.execute(db.select(User).filter(User.id == body["user"]['id'])).scalar_one()
    user.amountBalance = user.amountBalance + money
    transfer_record = TransferRecord(
      transferId = user.id,  
      receiverId = user.id,
      note = note,
      money = money,
      typeOf = TYPEOF_TRANSFER.topup,
      status = STATUS_TRANSFER.completed
    )
    db.create_all()
    db.session.add(transfer_record)
    db.session.commit()

    # notification email
    notificationTransfer(transfer_record, user)
    
    data = {}
    data['transferRecord'] = transfer_record.to_dict()
    data['user'] = user.to_dict()
    return json.dumps(response_api(data))

@bp.route("/transfers", methods=["GET"])
def transfers():
    searchModel = json.loads(request.args.get('searchModel'))
    searchOption = json.loads(request.args.get('searchOption'))
    
    query = TransferRecord.query
    
    if 'userId' in searchModel:
        query = query.filter(or_(TransferRecord.receiverId == searchModel["userId"], TransferRecord.transferId == searchModel['userId']))

    if 'createdDates' in searchModel:
        if searchModel['createdDates'][0] and searchModel['createdDates'][1]:
            query = query.filter(
                TransferRecord.createdDate  >= searchModel['createdDates'][0], 
                TransferRecord.createdDate <= searchModel['createdDates'][1]
            )
        elif searchModel['createdDates'][0]:
            query = query.filter(
                TransferRecord.createdDate >= searchModel['createdDates'][0]
            )
        elif searchModel['createdDates'][1]:
            query = query.filter(
                TransferRecord.createdDate <= searchModel['createdDates'][1]
            )
    if 'typeOf' in searchModel:
        query = query.filter(
            TransferRecord.typeOf == TYPEOF_TRANSFER.withdraw
        )

    paginations = query.order_by(TransferRecord.id.desc()).paginate(page = searchOption['page'], per_page = searchOption['per_page'], error_out=False)
    data = {}
    data['records'] = list(map(lambda tf : getRefTransfer(tf), paginations.items))
    data['pages'] = paginations.pages
    data['hasNext'] = paginations.has_next
    data['hasPrev'] = paginations.has_prev
    return json.dumps(response_api(data))
   
@bp.route("/transfer/<id>", methods=["GET"])
def transferById(id):
    transfer_record = db.session.execute(db.select(TransferRecord).filter(TransferRecord.id == int(id))).scalar_one()
    data = {}
    data['transferRecord'] = getRefTransfer(transfer_record)
    return json.dumps(response_api(data))

@bp.route("/withdraw", methods=["POST"])
def withdraw():
    body =  request.get_json()
    money = body["money"]
    note = body["note"]
    
    user = db.session.execute(db.select(User).filter(User.id == body["user"]['id'])).scalar_one()
    user.amountBalance = user.amountBalance - money - app.config["TRANSFER_FEES"] *money
    
    if user.amountBalance < 0:
        data = {}
        return json.dumps(response_api(data, "", -1)) #Your account has insufficient funds.

    transfer_record = TransferRecord(
      transferId = user.id,  
      receiverId = user.id,
      note = note,
      money = money,
      typeOf = TYPEOF_TRANSFER.withdraw,
      status = STATUS_TRANSFER.completed
    )
    db.create_all()
    db.session.add(transfer_record)
    db.session.commit()

    # notification email
    notificationTransfer(transfer_record, user)

    data = {}
    data['transferRecord'] = transfer_record.to_dict()
    data['user'] = user.to_dict()
    return json.dumps(response_api(data))

@bp.route("/transfer", methods=["POST"])
def transfer():
    mail = Mail(app)
    body =  request.get_json()
    money = body["money"]
    receiverId = body['receiverId']
    note = body["note"]
    
    user = db.session.execute(db.select(User).filter(User.id == body["user"]['id'])).scalar_one()
    
    if user.amountBalance - money - app.config["TRANSFER_FEES"] *money < 0:
        data = {}
        return json.dumps(response_api(data, "", -1)) #Your account has insufficient funds.

    transfer_record = TransferRecord(
      transferId = user.id,  
      receiverId = receiverId,
      note = note,
      money = money,
      typeOf = TYPEOF_TRANSFER.transfer,
      status = STATUS_TRANSFER.new
    )
    expiresDate = datetime.now() + timedelta(minutes = app.config['TIME_EMAIL_EXPIRED'])
    code = f'{random.randint(0,999999)}'
    for i in range(0, len(code)-6):
        code = "0"+ code
    db.create_all()
    db.session.add(transfer_record)
    db.session.commit()
    mail_record = MailRecord(
            userId = user.id,
            used = False,
            token = code,
            transferId = transfer_record.id,
            expiresDate = expiresDate,
            typeOf = TYPEOF_TRANSFER.transfer
        )    
    db.session.add(mail_record)
    db.session.commit()

    msg = Message('Email verify transfer from EKYCDA.', sender = app.config['MAIL_USERNAME'] , recipients = [user.email])
    msg.html = render_template('transfer.html', 
        code =  mail_record.token
    )
    mail.send(msg)

    data = {}
    data['transferRecord'] = transfer_record.to_dict()
    data['user'] = user.to_dict()
    return json.dumps(response_api(data))

@bp.route("/transfer-confirm", methods=["POST"])
def transfer_confirm():
    body =  request.get_json()
    userId = body["user"]['id']
    transferId = body["transferId"]
    code = body["code"]

    user = db.session.execute(db.select(User).filter(User.id == userId)).scalar_one()
    transfer = db.session.execute(db.select(TransferRecord).filter(TransferRecord.id == transferId)).scalar_one()

    try:
        mail_record = db.session.execute(
            select(MailRecord).filter(
                MailRecord.used == False, 
                MailRecord.expiresDate >= datetime.now(), 
                MailRecord.userId == user.id, 
                MailRecord.token == code,
                MailRecord.transferId == transfer.id,
                MailRecord.typeOf == TYPEOF_TRANSFER.transfer
            )
        ).scalar_one()
    except: 
        traceback.print_exc()
        data={}
        return json.dumps(response_api(data, "", -2)) #Code not match

    user.amountBalance = user.amountBalance - transfer.money - app.config["TRANSFER_FEES"]*transfer.money
    if user.amountBalance < 0:
        data = {}
        return json.dumps(response_api(data, "", -1)) #Your account has insufficient funds.
    receiver = db.session.execute(db.select(User).filter(User.id == transfer.receiverId)).scalar_one()
    receiver.amountBalance += transfer.money
    mail_record.used = True
    transfer.status = STATUS_TRANSFER.completed    
    db.session.commit()

    # notification email
    notificationTransfer(transfer, user)
    notificationTransfer(transfer, receiver)

    data = {}
    data['transferRecord'] = getRefTransfer(transfer)
    data['user'] = user.to_dict()
    return json.dumps(response_api(data))

