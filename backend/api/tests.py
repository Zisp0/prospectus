from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Usuario, Prospecto


class UserAuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.token_url = reverse('token_obtain_pair')
        self.me_url = reverse('me')
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@scala.com',
            'password': 'Password123!',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, {
            'name': self.user_data['username'],
            'email': self.user_data['email'],
            'password': self.user_data['password'],
            'password2': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertIn('id', response.data)

    def test_user_login(self):
        # Register user first
        Usuario.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        # Attempt login
        response = self.client.post(self.token_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_get_me_authenticated(self):
        user = Usuario.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])

    def test_get_me_unauthenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProspectoCRUDTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(
            username='authuser',
            email='authuser@scala.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)
        self.list_create_url = reverse('prospecto-list')
        
        self.prospecto_data = {
            'documento': '12345678',
            'nombre': 'Juan Perez',
            'email': 'juan.perez@example.com',
            'fecha': '1990-05-20'
        }

    def test_create_prospecto(self):
        response = self.client.post(self.list_create_url, self.prospecto_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['documento'], self.prospecto_data['documento'])

    def test_create_prospecto_duplicate_documento(self):
        Prospecto.objects.create(
            documento=self.prospecto_data['documento'],
            nombre=self.prospecto_data['nombre'],
            email=self.prospecto_data['email'],
            fecha='1990-05-20'
        )
        response = self.client.post(self.list_create_url, self.prospecto_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('documento', response.data)

    def test_create_prospecto_invalid_email(self):
        data = self.prospecto_data.copy()
        data['email'] = 'invalid-email'
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_list_prospectos_pagination_and_search(self):
        # Create multiple prospectos
        Prospecto.objects.create(documento='10000001', nombre='Ana Torres', email='ana@example.com', fecha='1990-01-01')
        Prospecto.objects.create(documento='10000002', nombre='Carlos Ruiz', email='carlos@example.com', fecha='1991-01-01')
        
        # Test pagination fields (count, page, page_size, results)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('page', response.data)
        self.assertIn('page_size', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

        # Test search filter (?q=Ana)
        response = self.client.get(f"{self.list_create_url}?q=Ana")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['nombre'], 'Ana Torres')

        # Test search filter (?q=10000002)
        response = self.client.get(f"{self.list_create_url}?q=10000002")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['documento'], '10000002')


class CSVBulkUploadTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(
            username='authuser',
            email='authuser@scala.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.user)
        self.upload_url = reverse('upload_csv')

    def test_upload_valid_csv(self):
        csv_data = (
            "documento,nombre,correo,fecha\n"
            "10000001,Ana Torres,ana.torres@email.com,1990-05-20\n"
            "10000002,Carlos Ruiz,carlos.ruiz@email.com,1985-11-03\n"
        )
        response = self.client.post(
            self.upload_url,
            data=csv_data.encode('utf-8'),
            content_type='text/csv'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_procesados'], 2)
        self.assertEqual(response.data['exitosos'], 2)
        self.assertEqual(response.data['rechazados'], 0)
        self.assertEqual(response.data['duplicados'], 0)
        self.assertEqual(Prospecto.objects.count(), 2)

    def test_upload_csv_with_errors_and_duplicates(self):
        # 10000001 exists in DB
        Prospecto.objects.create(
            documento='10000001',
            nombre='Ana Torres Original',
            email='ana.original@email.com',
            fecha='1990-05-20'
        )

        csv_data = (
            "documento,nombre,correo,fecha\n"
            "10000001,Ana Torres,ana.torres@email.com,1990-05-20\n"  # Duplicado DB
            "10000002,Carlos Ruiz,carlos.ruiz@email.com,1985-11-03\n"  # Exitoso
            "10000002,Carlos Ruiz Repetido,carlos@email.com,1985-11-03\n"  # Duplicado archivo
            "10000003,Pedro Sin Correo,,1991-04-01\n"  # Rechazado (correo vacio)
            ",Sin Documento,sin@email.com,2000-01-01\n"  # Rechazado (doc vacio)
            "10000004,Marta Fecha Invalida,marta@email.com,20-05-1990\n"  # Rechazado (fecha invalida)
        )

        response = self.client.post(
            self.upload_url,
            data=csv_data.encode('utf-8'),
            content_type='text/csv'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_procesados'], 6)
        self.assertEqual(response.data['exitosos'], 1)  # only Carlos Ruiz
        self.assertEqual(response.data['duplicados'], 2)  # Ana Torres (DB), Carlos Ruiz Repetido (File)
        self.assertEqual(response.data['rechazados'], 3)  # Pedro, Sin Documento, Marta

        # Check detail list lengths
        self.assertEqual(len(response.data['detalle_exitosos']), 1)
        self.assertEqual(len(response.data['detalle_duplicados']), 2)
        self.assertEqual(len(response.data['detalle_rechazados']), 3)

        # Check specific reasons/errors
        self.assertEqual(response.data['detalle_duplicados'][0]['razon'], 'Documento ya existe en la base de datos')
        self.assertEqual(response.data['detalle_duplicados'][1]['razon'], 'Documento duplicado en el mismo archivo')
        self.assertIn('Correo vacío', response.data['detalle_rechazados'][0]['errores'])
        self.assertIn('Documento vacío', response.data['detalle_rechazados'][1]['errores'])
        self.assertIn('Fecha inválida (usar YYYY-MM-DD): 20-05-1990', response.data['detalle_rechazados'][2]['errores'])
