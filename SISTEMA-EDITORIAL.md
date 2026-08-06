# Sistema Editorial PEGASSO

Módulos agregados al sitio para cubrir los requerimientos funcionales.
Todo funciona del lado del cliente (HTML + Bootstrap 4 + JavaScript), sin backend:
los datos se guardan en `localStorage` del navegador, así que el sitio sigue
publicándose igual en GitHub Pages.

## Requerimientos funcionales

| RF | Qué pide | Dónde está |
|---|---|---|
| **RF1** | Catálogo organizado por categorías con portada, título, género, páginas y año | [catalogo.html](catalogo.html) — chips de categoría con conteo, filtros y tarjetas con todos los datos |
| **RF2** | Ficha completa del libro y regreso al catálogo | [libro.html](libro.html) — portada, título, género, autor, sinopsis, páginas, año, disponibilidad, ISBN y botón "Volver al catálogo" que conserva los filtros |
| **RF3** | Registro de autor con validación y confirmación | [registro.html](registro.html) — valida correo, contraseña, duplicados y términos; al crear la cuenta inicia sesión y ofrece enviar el manuscrito |
| **RF4** | Envío de manuscrito por autor registrado, con archivo validado | [manuscritos.html](manuscritos.html) — sin cuenta muestra el aviso de registro; valida extensión (PDF/DOC/DOCX/ODT), tamaño (20 MB) y archivo vacío; confirma con folio |
| **RF5** | Descargar el catálogo en PDF | [catalogo.html](catalogo.html) → "Descargar catálogo en PDF": hoja generada al momento, agrupada por categoría, con título, autor, género, sinopsis y año |
| **RF6** | Solicitud de cita con confirmación | [citas.html](citas.html) — nombre, correo, teléfono, fecha, hora y motivo; detecta horarios ocupados y deja la solicitud en lista de espera |
| **RF7** | CRUD de libros para el administrador | [publicar.html](publicar.html) — alta, consulta, modificación y baja con editorial y disponibilidad; los cambios se ven de inmediato en el catálogo |
| **RF8** | Búsqueda por título, autor, género o palabras clave, por relevancia | [catalogo.html](catalogo.html) — puntaje: título > autor > género > palabras clave, con bonus por coincidencia exacta o al inicio |
| **RF9** | Programación de eventos y calendario | [eventos.html](eventos.html) — título, fecha, hora, duración, lugar, descripción y capacidad; calendario mensual navegable por tipo de evento |
| **RF10** | Registro de asistencia e historial por miembro | [eventos.html](eventos.html) — el miembro elige a qué evento asistir (con control de cupo) y consulta su historial; el administrador marca asistencia |

## Lectura en línea (EPUB)

[lector.html](lector.html) abre libros EPUB dentro de la propia página, sin descargas
ni aplicaciones externas. Incluye índice navegable, avance por secciones (botones,
teclado o índice), tamaño de letra ajustable, modo sepia, barra de progreso y memoria
del punto de lectura por libro.

Dos títulos del catálogo están en EPUB:

| Libro | Contenido |
|---|---|
| **Guía del Autor PEGASSO** | Cinco capítulos sobre cómo preparar un manuscrito, el proceso de dictamen, la edición y la publicación. Gratuito. |
| **Rody y el Bosque de las Preguntas** | Cuento infantil original en cinco capítulos, para lectores de 7 a 11 años. |

Ambos son obra original de la editorial y se generaron como EPUB 3 válidos
(`libros-epub/`), con portada, índice y hoja de estilos propia.

El lector también abre cualquier EPUB del equipo del usuario: el archivo se procesa en
el navegador y no se sube a ningún servidor. Está escrito sin librerías externas
(`js/pegasso-epub.js`): lee el ZIP a mano y descomprime con `DecompressionStream`, que
ya traen Chrome, Edge, Firefox y Safari recientes. Al mostrar cada capítulo se eliminan
`script`, `iframe` y `embed`, y las imágenes internas se sirven como blobs.

## Acceso

`login.html` — administrador: usuario `admin`, contraseña `123456`.
`registro.html` — cualquier autor crea su propia cuenta.

| Sección | Acceso |
|---|---|
| Inicio, catálogo, ficha de libro, calendario de eventos, formulario de cita | Público |
| Enviar manuscrito, inscribirse a eventos | Autor registrado |
| Panel de seguimiento de manuscritos, agenda de citas, gestión de eventos y asistencia | Administrador |
| `publicar.html`, `reportes.html`, `notificaciones.html` | Administrador (redirigen al login) |

La sesión vive en `sessionStorage`, o en `localStorage` si se marca "mantener la sesión iniciada".

> **Importante:** el sitio es estático, así que la validación ocurre en el navegador
> (`js/pegasso-auth.js`). Sirve para separar la parte pública de la interna, pero **no es
> seguridad real**: cualquiera puede leer el archivo. Para proteger datos sensibles de
> verdad hace falta un servidor que valide las credenciales y solo entregue la información
> a usuarios autenticados.

## Archivos de soporte

- `js/pegasso-data.js` — capa de datos compartida: catálogo, manuscritos, ventas,
  notificaciones, citas, eventos, asistencias, búsqueda con relevancia, reportes,
  exportación CSV y generación del PDF del catálogo.
  Incluye datos de demostración (28 libros, 5 manuscritos, 12 meses de ventas,
  5 eventos y 2 citas) que se cargan la primera vez que se abre el sitio.

  El catálogo cubre las colecciones reales con sus portadas: Rody Matemáticas (3 bloques
  y guía docente), Lectoescritura (4 cuadernos), Curso de Inglés (2 niveles), Conoce y
  Descubre (4 tomos), El Principito (4 ediciones) y la línea religiosa (Biblia de Estudio
  en 3 ediciones, Biblia de Arte, Biblia Infantil en 2 títulos, Mariología en 2 ediciones
  y Defendiendo la Fe en 2 tomos). Géneros: Infantil, Juvenil, Educativo, Didáctico,
  Idiomas, Religioso, Novela, Ensayo y Poesía.

- `js/pegasso-auth.js` — control de acceso: administradores, registro de autores,
  perfiles (`admin` / `autor`), sesión, guarda de páginas y menú de usuario.
- `js/pegasso-layout.js` — menú y pie compartidos; en las páginas antiguas solo agrega
  los accesos que falten.
- `css/pegasso-app.css` — estilos del sistema respetando la paleta original
  (`--primary #17a2b8`, `--secondary #00394f`).

## Publicación en GitHub Pages

El sitio se publica con el flujo `.github/workflows/pages.yml` (GitHub Actions), no con
el builder Jekyll heredado, que fallaba sin mostrar el motivo. El flujo excluye de la
publicación las carpetas que ninguna página referencia (`RELIGIOSO/`, que duplica
`img/RELIGIOSO/`, `LOGO RODY OBRAS/`, `ELEMENTOS/` y `scss/`) para bajar el peso del
sitio; siguen en el repositorio.

## Notas

- Los datos viven en el navegador de cada usuario. Para volver al estado inicial,
  ejecuta en la consola del navegador: `PEGASSO.reiniciarDatos()`.
- Al ampliar los datos se subió `SEED_VERSION`; la primera visita después de un cambio
  recarga los datos de demostración.
- Para migrar a un backend real solo hay que reemplazar las funciones de
  `js/pegasso-data.js` que leen y escriben en `localStorage` por llamadas a una API.
