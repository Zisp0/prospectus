from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .views import (
    CustomTokenObtainPairView,
    TokenRefreshView,
    MeView,
    RegisterView,
    LogoutView,
    ProspectoViewSet,
    CSVUploadView,
    StatsView,
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
    # Dashboard stats endpoint
    path('dashboard/stats/', StatsView.as_view(), name='dashboard_stats'),
    # API router for Prospecto CRUD
    path('prospectos/upload/', CSVUploadView.as_view(), name='upload_csv'),
    path('', include(router.urls)),
    #Swagger endpoint
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]


