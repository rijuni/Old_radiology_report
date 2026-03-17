from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    failed_login_attempts = models.PositiveIntegerField(default=0)

class Patient(models.Model):
    mrn = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    accession_no = models.CharField(max_length=50, unique=True)
    modality = models.CharField(max_length=10)
    study_description = models.CharField(max_length=255, blank=True, null=True)
    service_status = models.CharField(max_length=20) # New, Draft, Final
    patient_type = models.CharField(max_length=10) # OP, IP
    radiologist = models.CharField(max_length=255)
    report_path = models.CharField(max_length=500, blank=True, null=True)
    exam_date = models.DateField()


class UserSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    @property
    def duration(self):
        if self.login_time and self.logout_time:
            return self.logout_time - self.login_time
        return None

    def __str__(self):
        return f"{self.user.username} - {self.login_time}"
