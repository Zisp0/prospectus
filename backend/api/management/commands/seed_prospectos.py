import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Prospecto

NOMBRES = [
    "Ana Torres", "Carlos Ruiz", "María González", "Luis Herrera",
    "Sara Medina", "Pedro Gómez", "Laura Díaz", "Javier Rojas",
    "Camila Vargas", "Diego Morales", "Valentina Cruz", "Andrés Jiménez",
    "Lucía Castillo", "Martín Silva", "Paula Romero", "Roberto Flores",
    "Isabella Reyes", "Fernando López", "Daniela Sánchez", "Miguel Ángel",
]


class Command(BaseCommand):
    help = "Crea prospectos de prueba distribuidos en los últimos 7 días para visualizar estadísticas."

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            type=int,
            default=30,
            help="Cantidad de prospectos a crear (default: 30)",
        )
        parser.add_argument(
            "--clean",
            action="store_true",
            help="Elimina todos los prospectos existentes antes de crear los nuevos",
        )

    def handle(self, *args, **options):
        total = options["total"]
        clean = options["clean"]

        if clean:
            deleted, _ = Prospecto.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Se eliminaron {deleted} prospectos existentes."))

        now = timezone.now()
        hoy = now.date()
        ultimo_doc = int(Prospecto.objects.order_by("-documento").values_list("documento", flat=True).first() or "0")
        creados = []

        for i in range(total):
            doc = str(ultimo_doc + i + 1).zfill(8)
            nombre = random.choice(NOMBRES)
            email = f"{nombre.split()[0].lower()}{doc[-4:]}@email.com"

            # Distribuir uniformemente en los últimos 7 días
            dias_atras = random.randint(0, 6)
            fecha_evento = hoy - timedelta(days=random.randint(0, 365))
            creado_en = now - timedelta(days=dias_atras, hours=random.randint(0, 23), minutes=random.randint(0, 59))

            p = Prospecto(
                documento=doc,
                nombre=nombre,
                email=email,
                fecha=fecha_evento,
            )
            p.save()
            #Override auto_now_add: actualizar creado_en directamente en la BD
            Prospecto.objects.filter(id=p.id).update(creado_en=creado_en)
            creados.append(p)

        self.stdout.write(self.style.SUCCESS(f"Se crearon {total} prospectos distribuidos en los últimos 7 días."))
        self.stdout.write(f"  Día 0 (hoy):    {sum(1 for p in creados if (now - Prospecto.objects.get(id=p.id).creado_en).days == 0)}")
        self.stdout.write(f"  Total en BD:     {Prospecto.objects.count()}")
