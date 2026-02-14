from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

metadata = MetaData(schema="public")
db = SQLAlchemy(metadata=metadata)