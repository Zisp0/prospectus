from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView,
    TokenRefreshView,
    MeView,
    RegisterView,
    LogoutView,
    ProspectoViewSet,
    CSVUploadView,
)

router = DefaultRouter()
router.register(r'prospectos', ProspectoViewSet, basename='prospecto')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('prospectos/upload/', CSVUploadView.as_view(), name='upload_csv'),
    # API router for Prospecto CRUD
    path('', include(router.urls)),
]


