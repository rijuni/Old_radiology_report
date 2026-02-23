from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, RegisterView, CustomAuthToken, SeedDataView, ServeReportView

router = DefaultRouter()
router.register(r'patients', PatientViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'), # Login
    path('api/seed-data/', SeedDataView.as_view(), name='seed_data'),
    path('api/report-viewer/<path:path>', ServeReportView.as_view(), name='report_viewer'),
]
