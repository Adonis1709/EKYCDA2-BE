import datetime

import sqlalchemy as sa
from sqlalchemy_serializer import SerializerMixin

from flaskr.database import db
from flaskr.database.TransferRecord import TransferRecord
from flaskr.database.User import User


class MailRecord(db.Model, SerializerMixin):

    id = sa.Column(sa.Integer, primary_key = True)
    userId = sa.Column(sa.Integer, sa.ForeignKey(User.id), nullable = False)
    token = sa.Column(sa.String, nullable = False)
    transferId = sa.Column(sa.Integer,  sa.ForeignKey(TransferRecord.id))
    used = sa.Column(sa.Boolean)
    typeOf = sa.Column(sa.Integer)
    expiresDate = sa.Column(sa.DATETIME)
    createdDate = sa.Column(sa.DATETIME, default = datetime.datetime.now)
    updatedDate = sa.Column(sa.DATETIME,  default = datetime.datetime.now, onupdate = datetime.datetime.now)