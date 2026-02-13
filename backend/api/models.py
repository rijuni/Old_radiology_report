from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

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

    def __str__(self):
        return f"{self.name} - {self.mrn}"
