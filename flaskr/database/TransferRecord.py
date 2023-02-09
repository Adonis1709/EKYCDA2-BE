import datetime
import json

import sqlalchemy as sa
from sqlalchemy_serializer import SerializerMixin

from flaskr.database import db
from flaskr.database.User import User


class TransferRecord(db.Model, SerializerMixin):

    id = sa.Column(sa.Integer, primary_key = True)
    transferId = sa.Column(sa.Integer, sa.ForeignKey(User.id), nullable = False)
    receiverId = sa.Column(sa.Integer, sa.ForeignKey(User.id), nullable = False)
    money = sa.Column(sa.BigInteger)
    note = sa.Column(sa.String)
    status = sa.Column(sa.INTEGER)
    typeOf = sa.Column(sa.INTEGER)
    createdDate = sa.Column(sa.DATETIME, default = datetime.datetime.now)
    updatedDate = sa.Column(sa.DATETIME,  default = datetime.datetime.now, onupdate = datetime.datetime.now)
