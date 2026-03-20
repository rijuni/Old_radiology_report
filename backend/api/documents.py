from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Patient

@registry.register_document
class PatientDocument(Document):
    class Index:
        # Name of the Elasticsearch index
        name = 'patients'
        # See Elasticsearch Indices API reference for available settings
        settings = {'number_of_shards': 1,
                    'number_of_replicas': 0}

    class Django:
        model = Patient # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'mrn',
            'name',
            'accession_no',
            'modality',
            'study_description',
            'service_status',
            'patient_type',
            'radiologist',
            'report_path',
            'exam_date',
        ]
