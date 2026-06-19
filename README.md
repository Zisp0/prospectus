# Prospectus

Sistema web para la gestión de prospectos con carga masiva vía CSV, dashboard de estadísticas y autenticación segura basada en JWT.

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Django%204.2-092E20?logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/DB-SQLite-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

---

## Tecnologías

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| **Django** | 4.2 | Framework web principal |
| **Django REST Framework** | 3.15.2 | API RESTful conserialización, vistas y permisos |
| **djangorestframework-simplejwt** | 5.3.1 | Autenticación JWT (access + refresh tokens) |
| **django-cors-headers** | 4.3.1 | Manejo de CORS para comunicación con el frontend |
| **drf-spectacular** | 0.27.2 | Documentación OpenAPI 3.0 y Swagger UI |
| **SQLite** | — | Base de datos embebida (desarrollo) |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2.6 | Librería de UI con componentes funcionales y hooks |
| **Vite** | 8.0.12 | Build tool y dev server de alta velocidad |
| **Tailwind CSS** | 4.3.1 | Framework de estilos utility-first |
| **React Router DOM** | 7.18.0 | Navegación SPA con rutas protegidas |
| **React Hook Form** | 7.79.0 | Manejo de formularios con validación declarativa |
| **Recharts** | 3.8.1 | Gráficos del dashboard (línea de tiempo) |
| **SweetAlert2** | 11.26.25 | Alertas y confirmaciones estilizadas |
| **React Icons** | 5.6.0 | Iconografía (Feather Icons) |
| **Axios** | 1.18.0 | Cliente HTTP con interceptores JWT |

---

## Arquitectura del proyecto

```
prospectus/
├── backend/                     # API Django REST Framework
│   ├── config/                   # Configuración del proyecto Django
│   │   ├── settings.py           # Settings globales (JWT, CORS, REST Framework)
│   │   ├── urls.py               # URL raíz → redirige a api/
│   │   ├── wsgi.py / asgi.py    # Puntos de entrada WSGI/ASGI
│   │   └── __pycache__/
│   ├── api/                      # App principal de la API
│   │   ├── models.py             # Modelos: Usuario (custom), Prospecto
│   │   ├── views.py              # Vistas: Auth, CRUD, CSV Upload, Stats
│   │   ├── serializers.py        # Serializadores con validación
│   │   ├── urls.py               # Endpoints de la API
│   │   ├── pagination.py         # Paginación personalizada
│   │   ├── utils/
│   │   │   └── csv_processor.py  # Lógica de procesamiento y validación CSV
│   │   └── migrations/
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3                # Base de datos (ignorada en git)
├── frontend/                     # SPA React + Vite
│   ├── src/
│   │   ├── App.jsx               # Rutas principales y proveedores
│   │   ├── main.jsx              # Punto de entrada
│   │   ├── api/axios.js          # Instancia Axios con interceptores JWT
│   │   ├── context/AuthContext.jsx # Estado global de autenticación
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navegación lateral con logout
│   │   │   ├── PrivateRoute.jsx  # Guardia de rutas autenticadas
│   │   │   └── LogoMark.jsx      # Logo SVG
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Dashboard con estadísticas y gráfico
│   │   │   ├── Login.jsx         # Autenticación de usuarios
│   │   │   ├── Prospects.jsx     # CRUD de prospectos con paginación/búsqueda
│   │   │   └── LoadCSV.jsx       # Carga masiva con reporte detallado
│   │   └── services/
│   │       ├── api.js            # Funciones fetch para la API REST
│   │       └── alerts.js         # SweetAlert2 helper (éxito, error, confirmar)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js / postcss.config.cjs
└── data/
    └── prospectos_ejemplo.csv   # CSV de ejemplo con casos válidos, duplicados y erróneos
```

---

## API Endpoints

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Login → access + refresh tokens + datos del usuario | No |
| `POST` | `/api/auth/register/` | Registro de nuevo usuario | No |
| `POST` | `/api/auth/refresh/` | Renovar access token | No |
| `GET` | `/api/auth/me/` | Datos del usuario autenticado | Sí |
| `POST` | `/api/auth/logout/` | Blacklist de tokens (access + refresh) | Sí |
| `GET` | `/api/dashboard/stats/` | Métricas: total, hoy, últimos 5, últimos 7 días | Sí |
| `GET` | `/api/prospectos/` | Listar prospectos (paginado, búsqueda con `?q=`) | Sí |
| `POST` | `/api/prospectos/` | Crear un prospecto | Sí |
| `GET` | `/api/prospectos/{id}/` | Detalle de un prospecto | Sí |
| `PUT` | `/api/prospectos/{id}/` | Actualizar un prospecto | Sí |
| `DELETE` | `/api/prospectos/{id}/` | Eliminar un prospecto | Sí |
| `POST` | `/api/prospectos/upload/` | Carga masiva vía CSV | Sí |
| `GET` | `/api/schema/` | Schema OpenAPI 3.0 | — |
| `GET` | `/api/docs/` | Swagger UI interactivo | — |

---

## Instalación

### Requisitos previos

- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd prospectus
```

### 2. Backend

```bash
# Acceder al backend del proyecto
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Ejecutar la api
python manage.py runserver
```

El servidor quedará disponible en `http://localhost:8000`.  
La documentación interactiva Swagger UI en `http://localhost:8000/api/docs/`.

### 3. Frontend

```bash
# En otra terminal
cd frontend

# Instalar dependencias
npm install

# Ejecutar el frontend
npm run dev
```

La aplicación se abre en `http://localhost:5173`.

### CSV de ejemplo

El archivo `data/prospectos_ejemplo.csv` contiene registros de prueba que incluye casos válidos, un duplicado por documento, un registro con correo vacío y un registro con formato inválido — útil para probar el reporte de carga masiva.

---

## Decisiones técnicas

### 1. Modelo de usuario personalizado (`AUTH_USER_MODEL = 'api.Usuario'`)

Se definió `Usuario` extendiendo `AbstractUser` con el campo `email` como `unique=True` y `USERNAME_FIELD = 'email'`. Esto permite que el email sea el identificador de autenticación en vez del `username` heredado de Django, lo cual se aljeta con la UX moderna donde los usuarios recuerdan su correo, no un nombre de usuario arbitrario. Se eligió `AbstractUser` (no `AbstractBaseUser`) para conservar los campos `first_name`, `last_name`, `is_staff`, etc., sin reescribirlos.

### 2. JWT con blacklist de tokens

Se usó `djangorestframework-simplejwt` con la app `token_blacklist` habilitada. En lugar de depender únicamente de la expiración temporal del access token (8 horas), el endpoint `POST /auth/logout/` agrega tanto el refresh como el access token a la tabla `BlacklistedToken`. Esto garantiza que una sesión cerrada no pueda ser reutilizada, incluso si el access token aún no ha expirado. La vista `MeView` verifica explícitamente que el JTI del token no esté en la blacklist antes de devolver datos del usuario.

### 3. Paginación personalizada

Se implementó `CustomPageNumberPagination` que reemplaza el formato por defecto de DRF (`next`, `previous` URLs) por un objeto con `count`, `page`, `page_size` y `results`. Esta decisión se tomó porque el frontend consume los datos de paginación de forma declarativa (calculando `totalPages` en el cliente) y las URLs de navegación de DRF no eran útiles para un SPA con estado local en React. Además, se expuso `page_size_query_param` con un `max_page_size = 100` para que el frontend pueda ajustar la cantidad de registros por página sin exponer el servidor a consultas desmedidas.

### 4. Parámetro de búsqueda `q` en vez de `search`

Se creó `QSearchFilter` que extiende `SearchFilter` de DRF pero cambia el `search_param` de `search` a `q`. La razón es que `q` es más conciso en la URL (`?q=término` vs `?search=término`) y es la convención más extendida en APIs modernas, mejorando la legibilidad y la experiencia de开发者 al consumir la API directamente.

### 5. Procesamiento CSV con validación exhaustiva

El módulo `csv_processor.py` implementa una lógica de validación en 4 capas:
- **Campos vacíos**: cualquier campo requerido vacío se rechaza con mensaje específico.
- **Formato de email**: validación con regex (consistente entre frontend y backend).
- **Duplicados dentro del archivo**: un `set` en memoria rastrea documentos ya vistos en el CSV, evitando inserciones duplicadas en un mismo lote.
- **Duplicados en la base de datos**:consulta `Prospecto.objects.filter(documento=...)` antes de cada inserción.

El endpoint devuelve un reporte detallado clasificado en exitosos, rechazados y duplicados, con la fila de origen y los errores específicos por registro. Se decidió procesar registro a registro en vez de usar `bulk_create` para poder identificar exactamente cuál fila falló y por qué razón, priorizando la trazabilidad sobre la velocidad de inserción.

### 6. BOM UTF-8 en CSV

Se usa `utf-8-sig` al decodificar el contenido del CSV porque Excel exporta archivos CSV con BOM (Byte Order Mark) por defecto. Si se usara `utf-8` estándar, el primer campo del encabezado quedaría con caracteres invisibles y la validación de columnas fallaría silenciosamente.

### 7. Frontend con `fetch` nativo en `services/api.js`

Aunque existe una instancia de Axios configurada en `api/axios.js` (con interceptores de request/response para JWT), los servicios de `api.js` usan `fetch` nativo del navegador. Esta decisión fue pragmática: las funciones se escribieron directamente con `fetch` para simplicidad del flujo de datos y control explícito de errores, sin la capa de abstracción de Axios. La instancia de Axios queda disponible para ser adoptada progresivamente si se requiere interceptor automático de refresh token o manejo centralizado de reintentos.

### 8. AuthContext como estado global ligero

Se implementó autenticación con React Context (`AuthContext`) en lugar de una librería de estado global (Redux, Zustand). Dado que el estado de autenticación (usuario, tokens, login/logout) es simple y se consume en pocos componentes, Context + `useState` es suficiente y evita la complejidad de una store adicional. Los tokens se persisten en `localStorage` y se hidratan al montar la app verificando validez con `getCurrentUser()`.

### 9. Rutas protegidas con `<Outlet />`

`PrivateRoute` usa el patrón `<Outlet />` de React Router v7 en vez de `render` props o HOCs. Esto permite declarar rutas protegidas como hijos directos dentro de `<Route element={<PrivateRoute />}>`, resultando en un JSX más limpio y declarativo.

### 10. Sin vista pública de registro

El sistema no expone una interfaz de registro en el frontend. El acceso a la aplicación no debería obtenerse simplemente registrándose, sino con un acceso concedido por un administrador. El endpoint `POST /api/auth/register/` existe a nivel de API, pero está pensado para ser consumido de forma administrativa (por curl, un panel interno o un superusuario desde el admin de Django). Esto evita que cualquier usuario se autoprogrese y garantiza control sobre quién ingresa al sistema.

### 11. SQLite como base de datos de desarrollo

Se optó por SQLite por cero configuración y simpleza para un proyecto de demo/prototipo. La configuración de `DATABASES` se puede cambiar a PostgreSQL para producción cambiando el `ENGINE` y agregando las credenciales en `settings.py`, sin cambios en los modelos o la lógica de negocio.

### 12. Documentación API automática con drf-spectacular

Se integró `drf-spectacular` con `@extend_schema` en cada vista para generar documentación OpenAPI 3.0 automáticamente. Las vistas documentan sus requests, responses y códigos de error, lo que facilita la exploración interactiva en Swagger UI (`/api/docs/`) y la integración futura con herramientas de testing o generación de SDKs.

---

## Comandos útiles

### Crear un usuario (registro administrativo)

Como no existe vista pública de registro, los usuarios se crean llamando directamente al endpoint de la API:

```bash
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d "{\"email\": \"admin@ejemplo.com\", \"name\": \"Administrador\", \"password\": \"TuPassword123\", \"password2\": \"TuPassword123\"}"
```

O alternativamente desde el admin de Django:

```bash
cd backend
python manage.py createsuperuser
```

### Poblar la base de datos con prospectos de prueba

Management command que crea prospectos distribuidos en los últimos 7 días para visualizar el dashboard de estadísticas con datos reales en el gráfico:

```bash
cd backend
python manage.py seed_prospectos              # Crea 30 prospectos distribuidos en 7 días
python manage.py seed_prospectos --total=50   # Crea 50 prospectos
python manage.py seed_prospectos --clean      # Limpia todo antes de crear
```

---

## Formato del CSV

El archivo CSV debe tener encabezados exactos (no importa el orden):

```csv
documento,nombre,correo,fecha
10000001,Ana Torres,ana.torres@email.com,1990-05-20
```

| Columna | Requisitos |
|---|---|
| `documento` | Obligatorio. Único (en BD y dentro del archivo). |
| `nombre` | Obligatorio. No vacío. |
| `correo` | Obligatorio. Formato email válido. |
| `fecha` | Obligatorio. Formato `YYYY-MM-DD`. |

---

## Licencia

Proyecto privado — todos los derechos reservados.
