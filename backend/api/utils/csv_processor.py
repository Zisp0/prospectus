import csv
import io
import re
from datetime import datetime
from api.models import Prospecto


COLUMNAS_REQUERIDAS = {'documento', 'nombre', 'correo', 'fecha'}
FORMATO_FECHA = '%Y-%m-%d'  # Formato esperado en el CSV: 2024-01-15


def es_email_valido(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def es_fecha_valida(fecha_str: str):
    try:
        return datetime.strptime(fecha_str.strip(), FORMATO_FECHA).date()
    except ValueError:
        return None


def procesar_csv(archivo) -> dict:
    """
    Procesa un archivo CSV de prospectos.

    Reglas:
    - Columnas requeridas: documento, nombre, correo, fecha
    - Email debe ser válido
    - Documento debe ser único en la base de datos Y en el mismo archivo
    - Fecha debe tener formato YYYY-MM-DD
    - Campos vacíos se rechazan

    Retorna un dict con el reporte del procesamiento.
    """
    exitosos = []
    rechazados = []
    duplicados = []

    documentos_en_archivo = set()  # Para detectar duplicados dentro del mismo CSV

    try:
        # Accept both UploadedFile objects and plain file-like objects / raw bytes
        if hasattr(archivo, 'read'):
            raw_content = archivo.read()
        else:
            raw_content = archivo

        if isinstance(raw_content, bytes):
            contenido = raw_content.decode('utf-8-sig')  # utf-8-sig maneja BOM de Excel
        else:
            contenido = raw_content

        reader = csv.DictReader(io.StringIO(contenido))

        # Validar que el CSV tenga las columnas requeridas
        if not reader.fieldnames:
            return _reporte_error('El archivo CSV está vacío o no tiene encabezados.')

        columnas_csv = {c.strip().lower() for c in reader.fieldnames}
        faltantes = COLUMNAS_REQUERIDAS - columnas_csv
        if faltantes:
            return _reporte_error(
                f'Columnas faltantes en el CSV: {", ".join(faltantes)}'
            )

        filas = list(reader)
        total = len(filas)

        for i, fila in enumerate(filas, start=2):  # start=2 porque fila 1 es encabezado
            # Normalizar claves y valores de manera segura (evitando None en columnas extra)
            fila = {k.strip().lower(): v.strip() if isinstance(v, str) else '' for k, v in fila.items() if k is not None}

            documento = fila.get('documento', '')
            nombre = fila.get('nombre', '')
            correo = fila.get('correo', '')
            fecha_str = fila.get('fecha', '')

            errores = []

            # Validar campos vacíos
            if not documento:
                errores.append('Documento vacío')
            if not nombre:
                errores.append('Nombre vacío')
            if not correo:
                errores.append('Correo vacío')
            if not fecha_str:
                errores.append('Fecha vacía')

            # Validar email
            if correo and not es_email_valido(correo):
                errores.append(f'Correo inválido: {correo}')

            # Validar fecha
            fecha = None
            if fecha_str:
                fecha = es_fecha_valida(fecha_str)
                if not fecha:
                    errores.append(f'Fecha inválida (usar YYYY-MM-DD): {fecha_str}')

            if errores:
                rechazados.append({
                    'fila': i,
                    'documento': documento or '(vacío)',
                    'nombre': nombre or '(vacío)',
                    'errores': errores,
                })
                continue

            # Verificar duplicado dentro del mismo archivo
            if documento in documentos_en_archivo:
                duplicados.append({
                    'fila': i,
                    'documento': documento,
                    'nombre': nombre,
                    'razon': 'Documento duplicado en el mismo archivo',
                })
                continue

            # Verificar duplicado en la base de datos
            if Prospecto.objects.filter(documento=documento).exists():
                duplicados.append({
                    'fila': i,
                    'documento': documento,
                    'nombre': nombre,
                    'razon': 'Documento ya existe en la base de datos',
                })
                continue

            # Registro válido: guardar
            Prospecto.objects.create(
                documento=documento,
                nombre=nombre,
                email=correo,
                fecha=fecha,
            )
            documentos_en_archivo.add(documento)
            exitosos.append({
                'fila': i,
                'documento': documento,
                'nombre': nombre,
            })

    except UnicodeDecodeError:
        return _reporte_error('El archivo no es UTF-8. Guárdalo como CSV UTF-8.')
    except Exception as e:
        return _reporte_error(f'Error inesperado: {str(e)}')

    return {
        'total_procesados': total,
        'exitosos': len(exitosos),
        'rechazados': len(rechazados),
        'duplicados': len(duplicados),
        'detalle_exitosos': exitosos,
        'detalle_rechazados': rechazados,
        'detalle_duplicados': duplicados,
    }


def _reporte_error(mensaje: str) -> dict:
    return {
        'error': mensaje,
        'total_procesados': 0,
        'exitosos': 0,
        'rechazados': 0,
        'duplicados': 0,
    }
