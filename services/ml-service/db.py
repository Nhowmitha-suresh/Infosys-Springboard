"""
db.py

Shared PostgreSQL connection helper for the Medisphere-ML backend.

All configuration is read from environment variables (.env) via
python-dotenv. No connection is opened at import time -- callers must
explicitly call get_connection() when they need one, and are
responsible for closing it (a `with` block works, since psycopg2
connections are context managers that commit/rollback automatically).
"""

import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Load variables from the .env file that sits next to this module.
# This only populates os.environ -- it does not touch the database.
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

_REQUIRED_VARS = {
    "DB_HOST": DB_HOST,
    "DB_PORT": DB_PORT,
    "DB_NAME": DB_NAME,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
}


class DatabaseConfigError(Exception):
    """Raised when required database configuration is missing."""


class DatabaseConnectionError(Exception):
    """Raised when a connection to PostgreSQL cannot be established."""


def get_connection():
    """
    Create and return a new psycopg2 connection using credentials from
    the environment (.env).

    A new connection is created on every call -- nothing is cached or
    opened at import time. Callers should close the connection when
    done, e.g.:

        conn = get_connection()
        try:
            ...
        finally:
            conn.close()

    Raises:
        DatabaseConfigError: if one or more required env vars are missing.
        DatabaseConnectionError: if PostgreSQL cannot be reached (wrong
            host/port/credentials, DB down, etc).
    """
    missing = [name for name, value in _REQUIRED_VARS.items() if not value]
    if missing:
        raise DatabaseConfigError(
            "Missing required database configuration: "
            f"{', '.join(missing)}. Check your .env file."
        )

    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        )
        return connection
    except (psycopg2.OperationalError, ValueError) as exc:
        # ValueError covers a non-numeric DB_PORT.
        # We intentionally do not include the password in the error message.
        raise DatabaseConnectionError(
            f"Could not connect to the database at {DB_HOST}:{DB_PORT}/{DB_NAME}: {exc}"
        ) from exc
