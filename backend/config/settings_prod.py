"""
Production settings for the Radiology Report backend.
This file extends the base settings.py with production-safe overrides.

HOW TO USE:
    set DJANGO_SETTINGS_MODULE=config.settings_prod
    waitress-serve --port=8000 config.wsgi:application
"""

# --- Import everything from base dev settings ---
from .settings import *
import os

# ─────────────────────────────────────────────
# SECURITY — override insecure dev defaults
# ─────────────────────────────────────────────

# Load secret key from environment variable (NEVER hardcode in production)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY environment variable is not set. "
        "Generate one and set it before starting the production server."
    )

# Turn off debug mode — CRITICAL for production
DEBUG = False

# Set the real server IP or domain name here
# Examples: ['192.168.1.50', 'radiology.kims.local', 'yourdomain.com']
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ─────────────────────────────────────────────
# DATABASE — load credentials from environment
# ─────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME':     os.environ.get('DB_NAME',     'old_lab_report'),
        'USER':     os.environ.get('DB_USER',     'report'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),   # Must be set in .env
        'HOST':     os.environ.get('DB_HOST',     'localhost'),
        'PORT':     os.environ.get('DB_PORT',     '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# ─────────────────────────────────────────────
# STATIC & MEDIA FILES
# ─────────────────────────────────────────────

# Collected static files go here (run: python manage.py collectstatic)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# Media files (patient reports) — served by Waitress in this setup
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ─────────────────────────────────────────────
# CORS — restrict to real frontend origin only
# ─────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173'
).split(',')

# ─────────────────────────────────────────────
# ELASTICSEARCH
# ─────────────────────────────────────────────
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': os.environ.get('ELASTICSEARCH_HOST', 'http://localhost:9200')
    },
}

# ─────────────────────────────────────────────
# SECURITY HEADERS (production hardening)
# ─────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# ─────────────────────────────────────────────
# LOGGING — write warnings/errors to a log file
# ─────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django_prod.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'WARNING',
    },
}
