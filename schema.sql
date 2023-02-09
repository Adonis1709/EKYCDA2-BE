-- -- Initialize the database.
-- -- Drop any existing data and create empty tables.

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS email_record;
DROP TABLE IF EXISTS transfer_record;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  avatarSrc TEXT,
  idIdentityCard TEXT,
  fullname TEXT,
  dateOfBirth TEXT,
  sex TEXT,
  placeOfOrigin TEXT,
  placeOfResidence TEXT,
  dateOfExpiry TEXT,
  email TEXT,
  firstname TEXT,
  lastname TEXT,
  username TEXT  UNIQUE NOT NULL,
  password TEXT NOT NULL,
  cardFrontSrc TEXT,
  cardBackSrc TEXT,
  faceSrc TEXT,
  isLogin TEXT,
  phone TEXT,
  amountBalance TEXT,
  status TEXT,
  createdDate DATETIME,
  updatedDate DATETIME
);

CREATE TABLE email_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  token TEXT NOT NULL,
  used BOOLEAN,
  expiresDate DATETIME,
  createdDate DATETIME,
  updatedDate DATETIME,
  typeOf: INTEGER,
  FOREIGN KEY (userId) REFERENCES user(id)
  FOREIGN KEY (updatedBy) REFERENCES user(id)
);

CREATE TABLE transfer_record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transferId INTEGER  NOT NULL,
  receiverId INTEGER  NOT NULL,
  note TEXT,
  createdDate DATETIME,
  updatedDate DATETIME,
  status DATETIME,
  FOREIGN KEY (transferId) REFERENCES user(id),
  FOREIGN KEY (receiverId) REFERENCES user(id)
);

