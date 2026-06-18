from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, TokenRefreshView, MeView, RegisterView, ProspectoViewSet

router = DefaultRouter()
router.register(r'prospectos', ProspectoViewSet, basename='prospecto')

urlpatterns = [
    # Auth endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('register/', RegisterView.as_view(), name='register'),
    # API router for Prospecto CRUD
    path('', include(router.urls)),
]
