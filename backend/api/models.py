from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    """Custom user model using email as the unique identifier."""
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Prospecto(models.Model):
    """Modelo para almacenar información de prospectos."""
    documento = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    fecha = models.DateField()
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} ({self.email})"
