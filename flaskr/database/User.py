import datetime

import sqlalchemy as sa
from sqlalchemy_serializer import SerializerMixin

from flaskr.database import db


class User(db.Model, SerializerMixin):

    id = sa.Column(sa.Integer, primary_key = True)
    avatarSrc = sa.Column(sa.String)
    idIdentityCard = sa.Column(sa.String)
    idIdentityCard = sa.Column(sa.String)
    fullname = sa.Column(sa.String)
    dateOfBirth = sa.Column(sa.String)
    sex = sa.Column(sa.String)
    placeOfOrigin = sa.Column(sa.String)
    placeOfResidence = sa.Column(sa.String)
    dateOfExpiry = sa.Column(sa.String)
    email = sa.Column(sa.String)
    firstname = sa.Column(sa.String)
    lastname = sa.Column(sa.String)
    username = sa.Column(sa.String, unique = True, nullable = False)
    password = sa.Column(sa.String, nullable = False)
    cardFrontSrc = sa.Column(sa.String)
    cardBackSrc = sa.Column(sa.String)
    faceSrc = sa.Column(sa.String)
    isLogin = sa.Column(sa.String)
    phone = sa.Column(sa.String)
    status = sa.Column(sa.Integer)
    amountBalance = sa.Column(sa.BigInteger, default=0)
    createdDate = sa.Column(sa.DATETIME, default = datetime.datetime.now)
    updatedDate = sa.Column(sa.DATETIME, default = datetime.datetime.now, onupdate = datetime.datetime.now)
   