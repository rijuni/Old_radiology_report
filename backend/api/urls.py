from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, CustomAuthToken, UserViewSet, ServeReportView, SessionViewSet, LogoutView

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'users', UserViewSet)
router.register(r'sessions', SessionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'), # Login
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/reports/view/', ServeReportView.as_view(), name='serve_report_view'),
]
