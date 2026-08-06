# Sistema Editorial PEGASSO

Módulos agregados al sitio para cubrir los cinco requerimientos funcionales.
Todo funciona del lado del cliente (HTML + Bootstrap 4 + JavaScript), sin backend:
los datos se guardan en `localStorage` del navegador, así que el sitio sigue
publicándose igual en GitHub Pages.

## Páginas nuevas

| Requerimiento | Página | Qué hace |
|---|---|---|
| 1. Gestión de manuscritos | `manuscritos.html` | Formulario de envío (genera folio `MS-AAAA-###`), tabla de seguimiento con filtros, cambio de estado, historial (línea de tiempo) y consulta pública por folio o correo. |
| 2. Publicación de libros digitales | `publicar.html` | Toma un manuscrito **aprobado** o captura uno nuevo, con vista previa en vivo de la ficha; al publicar entra al catálogo, el manuscrito pasa a *Publicado* y se notifica al autor. |
| 3. Búsqueda de libros | `catalogo.html` | Búsqueda por título, autor, género o palabras clave, más filtros de año y precio, orden, resaltado de coincidencias, detalle en modal y exportación CSV. |
| 4. Reportes de ventas | `reportes.html` | KPIs (ingresos, ejemplares, operaciones, ticket promedio), gráfica mensual, ranking de libros, desglose por canal y género, detalle de operaciones, exportar CSV e imprimir/PDF. |
| 5. Notificaciones a autores | `notificaciones.html` | Bandeja de avisos con estado leído/no leído, envío manual de mensajes y plantillas automáticas por cada estado del manuscrito. |

## Acceso al panel interno

`login.html` — usuario `admin`, contraseña `123456`.

| Sección | Acceso |
|---|---|
| `index.html`, `catalogo.html`, envío y consulta de manuscrito por folio | Público |
| Panel de seguimiento de `manuscritos.html` (datos de contacto y dictámenes) | Requiere sesión |
| `publicar.html`, `reportes.html`, `notificaciones.html` | Requieren sesión (redirigen al login) |

La sesión vive en `sessionStorage`, o en `localStorage` si se marca "mantener la sesión iniciada".
El menú muestra el usuario conectado con la opción de cerrar sesión.

> **Importante:** el sitio es estático, así que la validación ocurre en el navegador
> (`js/pegasso-auth.js`). Sirve para separar la parte pública de la interna, pero **no es
> seguridad real**: cualquiera puede leer el archivo. Para proteger datos sensibles de
> verdad hace falta un servidor que valide las credenciales y solo entregue la información
> a usuarios autenticados.

## Archivos de soporte

- `js/pegasso-data.js` — capa de datos compartida: catálogo, manuscritos, ventas,
  notificaciones, búsquedas, agregados de reportes, exportación CSV y avisos flotantes.
  Incluye datos de demostración (10 libros del sitio, 5 manuscritos y 12 meses de ventas)
  que se cargan la primera vez que se abre el sitio.
- `js/pegasso-auth.js` — control de acceso: usuarios, sesión, guarda de páginas
  protegidas y menú de usuario en la barra de navegación.
- `css/pegasso-app.css` — estilos del sistema respetando la paleta original
  (`--primary #17a2b8`, `--secondary #00394f`, degradado del `bg-primary`, tarjetas y hovers).

## Flujo completo

1. El autor envía su obra desde `index.html` o `manuscritos.html` → estado **Recibido** + notificación.
2. El comité cambia el estado desde la tabla → cada cambio genera una notificación con plantilla.
3. Un manuscrito **Aprobado** aparece en `publicar.html` listo para cargarse en el formulario.
4. Al publicarlo entra a `catalogo.html` y el manuscrito queda como **Publicado**.
5. Las ventas registradas (desde el catálogo, `publicar.html` o `reportes.html`) alimentan los reportes.

## Notas

- Los datos viven en el navegador de cada usuario. Para volver al estado inicial,
  ejecuta en la consola del navegador: `PEGASSO.reiniciarDatos()`.
- Para migrar a un backend real solo hay que reemplazar las funciones de
  `js/pegasso-data.js` que leen y escriben en `localStorage` por llamadas a una API.
