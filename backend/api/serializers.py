from rest_framework import serializers
from .models import User, Patient

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class PatientSerializer(serializers.ModelSerializer):
    report_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'
    
    def get_report_url(self, obj):
        """Return full URL for the smart PDF viewer"""
        if obj.report_path:
            request = self.context.get('request')
            if request:
                # Point to the new API endpoint instead of direct media file
                # The view will handle DOC/DOCX -> PDF conversion
                path = obj.report_path
                # Ensure we handle paths with backslashes on Windows properly
                path = path.replace('\\', '/')
                return request.build_absolute_uri(f'/api/report-viewer/{path}')
        return None
