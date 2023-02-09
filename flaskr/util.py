from flask import current_app as app
from flask import render_template
from flask_mail import Mail, Message

from flaskr.database import db
from flaskr.database.User import User


def response_api(data={},message="", code=1):
    res = {}
    res["code"] = code
    res["message"] = message
    res["data"] = data
    return res

def getRefTransfer(tf): #not find doc to include the same sequelize js
    data = tf.to_dict() 
    try:
        data['receiver'] = db.session.execute(db.select(User).filter(User.id == tf.receiverId)).scalar_one().to_dict()
    except:
        data['receiver'] = None
    try:
        data['transfer'] = db.session.execute(db.select(User).filter(User.id == tf.transferId)).scalar_one().to_dict()
    except:
        data['transfer'] = None
    return data

def notificationTransfer(tf, user): #not find doc to include the same sequelize js
    tr_dict = getRefTransfer(tf)
    mail = Mail(app)
    msg = Message('Email transfer from EKYCDA.', sender = app.config['MAIL_USERNAME'] , recipients = [user.email])
    
    if tr_dict['typeOf'] == TYPEOF_TRANSFER.transfer:
        if tr_dict['receiverId'] == user.id:
            amountBalanceBf = user.amountBalance - tr_dict['money']*app.config['TRANSFER_FEES'] - tr_dict['money'] 
            transferFee = app.config['TRANSFER_FEES']
        else:
            amountBalanceBf = user.amountBalance + tr_dict['money']*app.config['TRANSFER_FEES'] + tr_dict['money'] 
            transferFee = app.config['TRANSFER_FEES']
    elif tr_dict['typeOf'] == TYPEOF_TRANSFER.withdraw:
        amountBalanceBf = user.amountBalance + tr_dict['money']*app.config['TRANSFER_FEES'] + tr_dict['money'] 
        transferFee = app.config['TRANSFER_FEES']
    elif tr_dict['typeOf'] == TYPEOF_TRANSFER.topup:
        amountBalanceBf = user.amountBalance - tr_dict['money']*app.config['TRANSFER_FEES'] - tr_dict['money']
        transferFee = 0

    msg.html = render_template('notification-transfer.html', 
        username = user.username,                               
        phone = user.phone,                               
        fullname = user.fullname,                               
        amountBalanceBf = "{:,}".format(int(amountBalanceBf)),
        amountBalanceAf = "{:,}".format(int(user.amountBalance)),
        transferFee = transferFee*100,
        id = tr_dict['id'], 
        transfer = tr_dict['transfer'], 
        receiver = tr_dict['receiver'], 
        money ="{:,}".format(int(tr_dict['money'])), 
        typeOf = tr_dict['typeOf'], 
        note = tr_dict['note'],
        createdDate = tr_dict['createdDate'], 
        updatedDate = tr_dict['updatedDate']
    )
    mail.send(msg)

class TYPEOF_TRANSFER:  #and also use in typeof otp
    verify = 0
    transfer = 1
    topup = 2
    withdraw = 3
    reset_password = 4

class STATUS_TRANSFER:
    new = 0
    completed = 1

class STATUS_ACCOUNT:
    verify_email = 0
    verify_process_email = 1
    verify_card = 2
    verify_process_card = 3
    verify_profile = 4
    verify_process_profile = 5
    verify_face = 6
    verify_process_face = 7
    done = 8

