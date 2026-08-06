/* ==========================================================================
   PEGASSO Editorial - Capa de datos del sistema
   --------------------------------------------------------------------------
   El sitio es estático (GitHub Pages), así que la "base de datos" vive en
   localStorage del navegador. Todo el sistema (manuscritos, catálogo digital,
   ventas y notificaciones) comparte este archivo.

   Colecciones:
     pegasso_manuscritos   -> manuscritos recibidos y su seguimiento
     pegasso_libros        -> libros publicados en el catálogo digital
     pegasso_ventas        -> ventas registradas (para los reportes)
     pegasso_notificaciones-> avisos enviados a los autores
   ========================================================================== */
(function (window) {
    "use strict";

    var KEYS = {
        manuscritos: 'pegasso_manuscritos',
        libros: 'pegasso_libros',
        ventas: 'pegasso_ventas',
        notificaciones: 'pegasso_notificaciones',
        seed: 'pegasso_seed_version'
    };

    var SEED_VERSION = '1';

    /* ---------------------------------------------------------------- Estados */

    var ESTADOS = [
        { id: 'recibido', nombre: 'Recibido', clase: 'estado-recibido' },
        { id: 'en-revision', nombre: 'En revisión', clase: 'estado-en-revision' },
        { id: 'aprobado', nombre: 'Aprobado', clase: 'estado-aprobado' },
        { id: 'rechazado', nombre: 'Rechazado', clase: 'estado-rechazado' },
        { id: 'publicado', nombre: 'Publicado', clase: 'estado-publicado' }
    ];

    // Mensaje que recibe el autor en cada cambio de estado (requisito 5).
    var MENSAJES_ESTADO = {
        'recibido': 'Hemos recibido tu manuscrito "{titulo}". Nuestro comité editorial lo revisará y te informaremos del avance.',
        'en-revision': 'Tu manuscrito "{titulo}" entró a revisión editorial. El dictamen suele tardar entre 15 y 30 días hábiles.',
        'aprobado': '¡Felicidades! Tu manuscrito "{titulo}" fue aprobado para publicación. Pronto te contactaremos para la etapa de edición.',
        'rechazado': 'Tu manuscrito "{titulo}" no fue aprobado en esta convocatoria. Agradecemos tu confianza y te invitamos a enviarnos nuevas obras.',
        'publicado': 'Tu obra "{titulo}" ya está publicada en el catálogo digital de PEGASSO Editorial.'
    };

    var GENEROS = ['Infantil', 'Educativo', 'Religioso', 'Novela', 'Ensayo', 'Poesía', 'Didáctico'];

    /* ------------------------------------------------------- Catálogo semilla */
    /* Libros que ya existen en el sitio, cargados la primera vez que se abre. */

    var LIBROS_SEED = [
        {
            titulo: 'El Principito - Edición Ilustrada',
            autor: 'Antoine de Saint-Exupéry',
            genero: 'Infantil',
            anio: 2023,
            paginas: 120,
            precio: 249,
            isbn: '978-607-0001-01-1',
            portada: 'EDUCATIVO/EL PRINCIPITO/PRINCIPITO.PNG',
            descripcion: 'Una historia mágica llena de enseñanzas valiosas para los más pequeños, con ilustraciones originales de PEGASSO.',
            keywords: ['principito', 'ilustrado', 'infantil', 'clasico', 'lectura'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Rody Matemáticas',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2021,
            paginas: 180,
            precio: 320,
            isbn: '978-607-0001-02-8',
            portada: 'EDUCATIVO/MATEMATICAS/rody matematicas.png',
            descripcion: 'Cuaderno de trabajo por bloques para desarrollar el pensamiento matemático conforme a la Nueva Escuela Mexicana.',
            keywords: ['matematicas', 'primaria', 'nem', 'ejercicios', 'rody'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Lectoescritura Rody',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2022,
            paginas: 160,
            precio: 310,
            isbn: '978-607-0001-03-5',
            portada: 'EDUCATIVO/LECTOESCRITURA/PORTA LECTO 1.png',
            descripcion: 'Método integral de lectoescritura con actividades graduadas para primeros lectores.',
            keywords: ['lectoescritura', 'lectura', 'escritura', 'preescolar', 'primaria'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Curso de Inglés PEGASSO',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2024,
            paginas: 210,
            precio: 380,
            isbn: '978-607-0001-04-2',
            portada: 'EDUCATIVO/CURSO DE INGLÉS/c0bf3554-eed0-4809-8c1e-5a6e8d0509c1.png',
            descripcion: 'Curso de inglés por niveles con audios y ejercicios prácticos para nivel básico escolar.',
            keywords: ['ingles', 'idiomas', 'curso', 'bilingue'],
            formato: 'Digital (PDF + audio)'
        },
        {
            titulo: 'Conoce y Descubre',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2023,
            paginas: 140,
            precio: 290,
            isbn: '978-607-0001-05-9',
            portada: 'EDUCATIVO/CONOCE Y DESCUBRE/RODY-CONOCE.png',
            descripcion: 'Colección de tomos temáticos que despiertan la curiosidad científica de niñas y niños.',
            keywords: ['ciencia', 'descubrir', 'dinosaurios', 'coleccion', 'infantil'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Mariología',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Religioso',
            anio: 2022,
            paginas: 250,
            precio: 420,
            isbn: '978-607-0001-06-6',
            portada: 'img/RELIGIOSO/MARIOLOGIA/PORTADA LIBRO-2.png',
            descripcion: 'Estudio profundo sobre la figura de María en la tradición y el magisterio de la Iglesia.',
            keywords: ['mariologia', 'maria', 'teologia', 'catolico', 'fe'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Biblia de Estudio PEGASSO',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2024,
            paginas: 1450,
            precio: 890,
            isbn: '978-607-0001-07-3',
            portada: 'img/RELIGIOSO/BIBLIA DE ESTUDIO/BIBLIA-ESTUDIO.png',
            descripcion: 'Biblia con notas de estudio, mapas, cronologías y comentarios versículo por versículo.',
            keywords: ['biblia', 'estudio', 'comentarios', 'escrituras'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Biblia Infantil Ilustrada',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Infantil',
            anio: 2023,
            paginas: 220,
            precio: 350,
            isbn: '978-607-0001-08-0',
            portada: 'img/RELIGIOSO/BIBLIA INFANTIL/PORTADA.png',
            descripcion: 'Relatos bíblicos adaptados para niños con ilustraciones a todo color.',
            keywords: ['biblia', 'infantil', 'ilustrada', 'catequesis'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Defendiendo la Fe',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Ensayo',
            anio: 2024,
            paginas: 310,
            precio: 460,
            isbn: '978-607-0001-09-7',
            portada: 'img/RELIGIOSO/DEFENDIENDO LA FE/EN-DEFENSA-1-PAGINADO-TERMINA-EN-IZQ-2024-2.png',
            descripcion: 'Apologética accesible para responder las preguntas más frecuentes sobre la fe católica.',
            keywords: ['apologetica', 'fe', 'ensayo', 'catolico', 'defensa'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Biblia de Arte',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2023,
            paginas: 980,
            precio: 1250,
            isbn: '978-607-0001-10-3',
            portada: 'img/RELIGIOSO/BIBLIA DE ARTE/AIE23072-biblia-de-arte-PEGASSO-1.JPG',
            descripcion: 'Edición de lujo que acompaña el texto bíblico con obras maestras del arte sacro universal.',
            keywords: ['biblia', 'arte', 'lujo', 'coleccion', 'sacro'],
            formato: 'Digital (PDF)'
        }
    ];

    var MANUSCRITOS_SEED = [
        {
            titulo: 'Cuentos de la Sierra Norte',
            autor: 'María Fernanda Luna',
            email: 'mf.luna@ejemplo.com',
            genero: 'Infantil',
            paginas: 96,
            sinopsis: 'Seis relatos breves inspirados en leyendas de la sierra poblana, pensados para lectores de 8 a 12 años.',
            estado: 'en-revision',
            diasAtras: 26
        },
        {
            titulo: 'Álgebra para la Nueva Escuela Mexicana',
            autor: 'Ing. Ricardo Solís',
            email: 'r.solis@ejemplo.com',
            genero: 'Educativo',
            paginas: 240,
            sinopsis: 'Manual de álgebra con secuencias didácticas alineadas a los campos formativos de la NEM.',
            estado: 'aprobado',
            diasAtras: 54
        },
        {
            titulo: 'El Silencio de los Cerros',
            autor: 'Jorge Antonio Vega',
            email: 'ja.vega@ejemplo.com',
            genero: 'Novela',
            paginas: 320,
            sinopsis: 'Novela costumbrista sobre el regreso de un migrante a su pueblo natal después de veinte años.',
            estado: 'recibido',
            diasAtras: 5
        },
        {
            titulo: 'Catequesis Familiar en Casa',
            autor: 'Hna. Guadalupe Ramos',
            email: 'g.ramos@ejemplo.com',
            genero: 'Religioso',
            paginas: 150,
            sinopsis: 'Guía de 24 sesiones para acompañar la formación cristiana de los niños desde el hogar.',
            estado: 'publicado',
            diasAtras: 120
        },
        {
            titulo: 'Versos de Medianoche',
            autor: 'Claudia Ibarra',
            email: 'c.ibarra@ejemplo.com',
            genero: 'Poesía',
            paginas: 80,
            sinopsis: 'Poemario breve sobre el insomnio, la ciudad y la memoria.',
            estado: 'rechazado',
            diasAtras: 75
        }
    ];

    /* ------------------------------------------------------------ Utilidades */

    function ahora() {
        return new Date().toISOString();
    }

    function uid(prefijo) {
        return (prefijo || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    }

    function leer(key) {
        try {
            var raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('PEGASSO: no se pudo leer', key, e);
            return [];
        }
    }

    function escribir(key, valor) {
        try {
            window.localStorage.setItem(key, JSON.stringify(valor));
            return true;
        } catch (e) {
            console.warn('PEGASSO: no se pudo guardar', key, e);
            return false;
        }
    }

    function fechaMenos(dias) {
        var d = new Date();
        d.setDate(d.getDate() - dias);
        return d.toISOString();
    }

    // Generador pseudoaleatorio con semilla: los reportes se ven iguales
    // cada vez que se abre la página en el mismo navegador.
    function randomConSemilla(semilla) {
        var s = semilla % 2147483647;
        if (s <= 0) { s += 2147483646; }
        return function () {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    function normalizar(texto) {
        return (texto || '')
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    }

    function formatoMoneda(valor) {
        return '$' + Number(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatoFecha(iso) {
        if (!iso) { return '-'; }
        var d = new Date(iso);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatoFechaHora(iso) {
        if (!iso) { return '-'; }
        var d = new Date(iso);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(texto) {
        return (texto === null || texto === undefined ? '' : String(texto))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function estadoInfo(id) {
        for (var i = 0; i < ESTADOS.length; i++) {
            if (ESTADOS[i].id === id) { return ESTADOS[i]; }
        }
        return { id: id, nombre: id, clase: 'estado-recibido' };
    }

    /* ------------------------------------------------------------ Semilla */

    function sembrar() {
        if (window.localStorage.getItem(KEYS.seed) === SEED_VERSION) { return; }

        // Libros del catálogo
        var libros = LIBROS_SEED.map(function (l, i) {
            return Object.assign({}, l, {
                id: 'lib-seed-' + (i + 1),
                fechaPublicacion: fechaMenos(120 - i * 9),
                keywords: l.keywords.slice(),
                publicado: true,
                origen: 'catalogo'
            });
        });
        escribir(KEYS.libros, libros);

        // Manuscritos con su historial de seguimiento
        var flujo = ['recibido', 'en-revision', 'aprobado', 'rechazado', 'publicado'];
        var manuscritos = MANUSCRITOS_SEED.map(function (m, i) {
            var creado = fechaMenos(m.diasAtras);
            var historial = [{
                estado: 'recibido',
                fecha: creado,
                nota: 'Manuscrito recibido por el portal de autores.'
            }];
            var indiceFinal = flujo.indexOf(m.estado);
            var pasos = m.estado === 'rechazado' ? ['en-revision', 'rechazado']
                : m.estado === 'publicado' ? ['en-revision', 'aprobado', 'publicado']
                    : m.estado === 'aprobado' ? ['en-revision', 'aprobado']
                        : m.estado === 'en-revision' ? ['en-revision'] : [];
            pasos.forEach(function (paso, j) {
                historial.push({
                    estado: paso,
                    fecha: fechaMenos(Math.max(1, m.diasAtras - (j + 1) * Math.ceil(m.diasAtras / (pasos.length + 1)))),
                    nota: 'Actualización del comité editorial.'
                });
            });
            return {
                id: 'man-seed-' + (i + 1),
                folio: 'MS-' + (new Date(creado).getFullYear()) + '-' + String(100 + i + 1),
                titulo: m.titulo,
                autor: m.autor,
                email: m.email,
                genero: m.genero,
                paginas: m.paginas,
                sinopsis: m.sinopsis,
                estado: m.estado,
                fechaRecepcion: creado,
                actualizado: historial[historial.length - 1].fecha,
                historial: historial,
                indiceFinal: indiceFinal
            };
        });
        escribir(KEYS.manuscritos, manuscritos);

        // Notificaciones derivadas del historial de cada manuscrito
        var notificaciones = [];
        manuscritos.forEach(function (m) {
            m.historial.forEach(function (h, idx) {
                notificaciones.push({
                    id: 'not-seed-' + m.id + '-' + idx,
                    manuscritoId: m.id,
                    autor: m.autor,
                    email: m.email,
                    titulo: 'Estado actualizado: ' + estadoInfo(h.estado).nombre,
                    mensaje: (MENSAJES_ESTADO[h.estado] || '').replace('{titulo}', m.titulo),
                    estado: h.estado,
                    fecha: h.fecha,
                    leida: true,
                    canal: 'Correo electrónico'
                });
            });
        });
        escribir(KEYS.notificaciones, notificaciones);

        // Ventas de los últimos 12 meses (datos de demostración estables)
        var ventas = [];
        var rnd = randomConSemilla(20240719);
        var canales = ['Tienda en línea', 'Librería aliada', 'Venta directa', 'Distribuidor escolar'];
        var hoy = new Date();
        libros.forEach(function (libro, li) {
            for (var mes = 11; mes >= 0; mes--) {
                var operaciones = 1 + Math.floor(rnd() * 4);
                for (var k = 0; k < operaciones; k++) {
                    var f = new Date(hoy.getFullYear(), hoy.getMonth() - mes, 1 + Math.floor(rnd() * 27));
                    var unidades = 1 + Math.floor(rnd() * 18);
                    ventas.push({
                        id: 'ven-seed-' + li + '-' + mes + '-' + k,
                        libroId: libro.id,
                        titulo: libro.titulo,
                        genero: libro.genero,
                        unidades: unidades,
                        precioUnitario: libro.precio,
                        total: unidades * libro.precio,
                        canal: canales[Math.floor(rnd() * canales.length)],
                        fecha: f.toISOString()
                    });
                }
            }
        });
        escribir(KEYS.ventas, ventas);

        window.localStorage.setItem(KEYS.seed, SEED_VERSION);
    }

    /* --------------------------------------------------------------- API */

    var API = {
        KEYS: KEYS,
        ESTADOS: ESTADOS,
        GENEROS: GENEROS,
        MENSAJES_ESTADO: MENSAJES_ESTADO,

        // -------- utilidades expuestas
        uid: uid,
        estadoInfo: estadoInfo,
        normalizar: normalizar,
        formatoMoneda: formatoMoneda,
        formatoFecha: formatoFecha,
        formatoFechaHora: formatoFechaHora,
        escapeHtml: escapeHtml,

        // -------- Manuscritos (requisito 1)
        getManuscritos: function () {
            return leer(KEYS.manuscritos).sort(function (a, b) {
                return new Date(b.fechaRecepcion) - new Date(a.fechaRecepcion);
            });
        },

        getManuscrito: function (id) {
            return leer(KEYS.manuscritos).filter(function (m) { return m.id === id; })[0] || null;
        },

        agregarManuscrito: function (datos) {
            var lista = leer(KEYS.manuscritos);
            var fecha = ahora();
            var manuscrito = {
                id: uid('man'),
                folio: 'MS-' + new Date().getFullYear() + '-' + String(100 + lista.length + 1),
                titulo: datos.titulo,
                autor: datos.autor,
                email: datos.email,
                genero: datos.genero,
                paginas: Number(datos.paginas) || 0,
                sinopsis: datos.sinopsis || '',
                archivo: datos.archivo || '',
                estado: 'recibido',
                fechaRecepcion: fecha,
                actualizado: fecha,
                historial: [{
                    estado: 'recibido',
                    fecha: fecha,
                    nota: 'Manuscrito recibido por el portal de autores.'
                }]
            };
            lista.push(manuscrito);
            escribir(KEYS.manuscritos, lista);
            API.notificar(manuscrito, 'recibido');
            return manuscrito;
        },

        cambiarEstado: function (id, nuevoEstado, nota) {
            var lista = leer(KEYS.manuscritos);
            var actualizado = null;
            lista = lista.map(function (m) {
                if (m.id !== id) { return m; }
                var fecha = ahora();
                m.estado = nuevoEstado;
                m.actualizado = fecha;
                m.historial = (m.historial || []).concat([{
                    estado: nuevoEstado,
                    fecha: fecha,
                    nota: nota || 'Actualización del comité editorial.'
                }]);
                actualizado = m;
                return m;
            });
            escribir(KEYS.manuscritos, lista);
            if (actualizado) { API.notificar(actualizado, nuevoEstado, nota); }
            return actualizado;
        },

        eliminarManuscrito: function (id) {
            escribir(KEYS.manuscritos, leer(KEYS.manuscritos).filter(function (m) { return m.id !== id; }));
        },

        // -------- Libros / publicación digital (requisitos 2 y 3)
        getLibros: function () {
            return leer(KEYS.libros).sort(function (a, b) {
                return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion);
            });
        },

        getLibro: function (id) {
            return leer(KEYS.libros).filter(function (l) { return l.id === id; })[0] || null;
        },

        publicarLibro: function (datos) {
            var lista = leer(KEYS.libros);
            var libro = {
                id: uid('lib'),
                titulo: datos.titulo,
                autor: datos.autor,
                genero: datos.genero,
                anio: Number(datos.anio) || new Date().getFullYear(),
                paginas: Number(datos.paginas) || 0,
                precio: Number(datos.precio) || 0,
                isbn: datos.isbn || 'Por asignar',
                portada: datos.portada || 'img/LOGO SIN BIRRETE.png',
                descripcion: datos.descripcion || '',
                keywords: (datos.keywords || '').split(',').map(function (k) {
                    return k.trim();
                }).filter(Boolean),
                formato: datos.formato || 'Digital (PDF)',
                fechaPublicacion: ahora(),
                publicado: true,
                origen: datos.manuscritoId ? 'manuscrito' : 'manual',
                manuscritoId: datos.manuscritoId || null
            };
            lista.push(libro);
            escribir(KEYS.libros, lista);

            // Si viene de un manuscrito aprobado, se marca como publicado
            // y el autor recibe su notificación (requisitos 1 y 5).
            if (datos.manuscritoId) {
                API.cambiarEstado(datos.manuscritoId, 'publicado', 'Publicado en el catálogo digital con ISBN ' + libro.isbn + '.');
            }
            return libro;
        },

        despublicarLibro: function (id) {
            var lista = leer(KEYS.libros).map(function (l) {
                if (l.id === id) { l.publicado = !l.publicado; }
                return l;
            });
            escribir(KEYS.libros, lista);
        },

        buscarLibros: function (filtros) {
            filtros = filtros || {};
            var q = normalizar(filtros.q);
            return API.getLibros().filter(function (libro) {
                if (filtros.soloPublicados !== false && !libro.publicado) { return false; }
                if (filtros.genero && libro.genero !== filtros.genero) { return false; }
                if (filtros.anio && String(libro.anio) !== String(filtros.anio)) { return false; }
                if (filtros.precioMax && Number(libro.precio) > Number(filtros.precioMax)) { return false; }
                if (!q) { return true; }

                var campo = filtros.campo || 'todos';
                var enTitulo = normalizar(libro.titulo).indexOf(q) !== -1;
                var enAutor = normalizar(libro.autor).indexOf(q) !== -1;
                var enGenero = normalizar(libro.genero).indexOf(q) !== -1;
                var enKeywords = (libro.keywords || []).some(function (k) {
                    return normalizar(k).indexOf(q) !== -1;
                }) || normalizar(libro.descripcion).indexOf(q) !== -1;

                if (campo === 'titulo') { return enTitulo; }
                if (campo === 'autor') { return enAutor; }
                if (campo === 'genero') { return enGenero; }
                if (campo === 'keywords') { return enKeywords; }
                return enTitulo || enAutor || enGenero || enKeywords;
            });
        },

        // -------- Ventas (requisito 4)
        getVentas: function () {
            return leer(KEYS.ventas);
        },

        registrarVenta: function (datos) {
            var lista = leer(KEYS.ventas);
            var libro = API.getLibro(datos.libroId);
            var unidades = Number(datos.unidades) || 1;
            var precio = libro ? Number(libro.precio) : Number(datos.precioUnitario) || 0;
            var venta = {
                id: uid('ven'),
                libroId: datos.libroId,
                titulo: libro ? libro.titulo : datos.titulo,
                genero: libro ? libro.genero : datos.genero,
                unidades: unidades,
                precioUnitario: precio,
                total: unidades * precio,
                canal: datos.canal || 'Tienda en línea',
                fecha: datos.fecha ? new Date(datos.fecha).toISOString() : ahora()
            };
            lista.push(venta);
            escribir(KEYS.ventas, lista);
            return venta;
        },

        // Devuelve las ventas del rango indicado con los agregados del reporte.
        reporteVentas: function (filtros) {
            filtros = filtros || {};
            var desde = filtros.desde ? new Date(filtros.desde) : null;
            var hasta = filtros.hasta ? new Date(filtros.hasta) : null;
            if (hasta) { hasta.setHours(23, 59, 59, 999); }

            var ventas = API.getVentas().filter(function (v) {
                var f = new Date(v.fecha);
                if (desde && f < desde) { return false; }
                if (hasta && f > hasta) { return false; }
                if (filtros.genero && v.genero !== filtros.genero) { return false; }
                if (filtros.canal && v.canal !== filtros.canal) { return false; }
                if (filtros.libroId && v.libroId !== filtros.libroId) { return false; }
                return true;
            });

            var totalIngresos = 0, totalUnidades = 0;
            var porLibro = {}, porMes = {}, porCanal = {}, porGenero = {};

            ventas.forEach(function (v) {
                totalIngresos += v.total;
                totalUnidades += v.unidades;

                porLibro[v.titulo] = porLibro[v.titulo] || { titulo: v.titulo, genero: v.genero, unidades: 0, ingresos: 0, operaciones: 0 };
                porLibro[v.titulo].unidades += v.unidades;
                porLibro[v.titulo].ingresos += v.total;
                porLibro[v.titulo].operaciones += 1;

                var d = new Date(v.fecha);
                var claveMes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
                porMes[claveMes] = porMes[claveMes] || { mes: claveMes, unidades: 0, ingresos: 0 };
                porMes[claveMes].unidades += v.unidades;
                porMes[claveMes].ingresos += v.total;

                porCanal[v.canal] = porCanal[v.canal] || { canal: v.canal, unidades: 0, ingresos: 0 };
                porCanal[v.canal].unidades += v.unidades;
                porCanal[v.canal].ingresos += v.total;

                porGenero[v.genero] = porGenero[v.genero] || { genero: v.genero, unidades: 0, ingresos: 0 };
                porGenero[v.genero].unidades += v.unidades;
                porGenero[v.genero].ingresos += v.total;
            });

            function ordenar(obj, campo) {
                return Object.keys(obj).map(function (k) { return obj[k]; })
                    .sort(function (a, b) { return b[campo] - a[campo]; });
            }

            return {
                ventas: ventas,
                totalIngresos: totalIngresos,
                totalUnidades: totalUnidades,
                totalOperaciones: ventas.length,
                ticketPromedio: ventas.length ? totalIngresos / ventas.length : 0,
                porLibro: ordenar(porLibro, 'ingresos'),
                porCanal: ordenar(porCanal, 'ingresos'),
                porGenero: ordenar(porGenero, 'ingresos'),
                porMes: Object.keys(porMes).sort().map(function (k) { return porMes[k]; })
            };
        },

        // -------- Notificaciones (requisito 5)
        getNotificaciones: function () {
            return leer(KEYS.notificaciones).sort(function (a, b) {
                return new Date(b.fecha) - new Date(a.fecha);
            });
        },

        notificar: function (manuscrito, estado, notaExtra) {
            var lista = leer(KEYS.notificaciones);
            var plantilla = MENSAJES_ESTADO[estado] || 'Tu manuscrito "{titulo}" tuvo una actualización.';
            lista.push({
                id: uid('not'),
                manuscritoId: manuscrito.id,
                autor: manuscrito.autor,
                email: manuscrito.email,
                titulo: 'Estado actualizado: ' + estadoInfo(estado).nombre,
                mensaje: plantilla.replace('{titulo}', manuscrito.titulo) + (notaExtra ? ' Nota del editor: ' + notaExtra : ''),
                estado: estado,
                fecha: ahora(),
                leida: false,
                canal: 'Correo electrónico'
            });
            escribir(KEYS.notificaciones, lista);
        },

        enviarNotificacionManual: function (datos) {
            var lista = leer(KEYS.notificaciones);
            var notificacion = {
                id: uid('not'),
                manuscritoId: datos.manuscritoId || null,
                autor: datos.autor,
                email: datos.email,
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                estado: datos.estado || 'aviso',
                fecha: ahora(),
                leida: false,
                canal: datos.canal || 'Correo electrónico'
            };
            lista.push(notificacion);
            escribir(KEYS.notificaciones, lista);
            return notificacion;
        },

        marcarLeida: function (id, leida) {
            var lista = leer(KEYS.notificaciones).map(function (n) {
                if (n.id === id) { n.leida = leida !== false; }
                return n;
            });
            escribir(KEYS.notificaciones, lista);
        },

        marcarTodasLeidas: function () {
            var lista = leer(KEYS.notificaciones).map(function (n) { n.leida = true; return n; });
            escribir(KEYS.notificaciones, lista);
        },

        eliminarNotificacion: function (id) {
            escribir(KEYS.notificaciones, leer(KEYS.notificaciones).filter(function (n) { return n.id !== id; }));
        },

        noLeidas: function () {
            return leer(KEYS.notificaciones).filter(function (n) { return !n.leida; }).length;
        },

        // -------- Mantenimiento
        reiniciarDatos: function () {
            [KEYS.manuscritos, KEYS.libros, KEYS.ventas, KEYS.notificaciones, KEYS.seed].forEach(function (k) {
                window.localStorage.removeItem(k);
            });
            sembrar();
        },

        exportarCSV: function (filas, nombreArchivo) {
            if (!filas || !filas.length) { return; }
            var columnas = Object.keys(filas[0]);
            var csv = [columnas.join(',')].concat(filas.map(function (fila) {
                return columnas.map(function (c) {
                    var valor = fila[c] === null || fila[c] === undefined ? '' : String(fila[c]);
                    return '"' + valor.replace(/"/g, '""') + '"';
                }).join(',');
            })).join('\n');

            var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo || 'reporte-pegasso.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        toast: function (mensaje) {
            var el = document.querySelector('.app-toast');
            if (!el) {
                el = document.createElement('div');
                el.className = 'app-toast';
                document.body.appendChild(el);
            }
            el.textContent = mensaje;
            el.classList.add('visible');
            clearTimeout(el._t);
            el._t = setTimeout(function () { el.classList.remove('visible'); }, 3000);
        }
    };

    sembrar();
    window.PEGASSO = API;

    // Contador de notificaciones sin leer en el menú de navegación.
    document.addEventListener('DOMContentLoaded', function () {
        var badge = document.querySelector('[data-notif-badge]');
        if (badge) {
            var n = API.noLeidas();
            badge.textContent = n;
            badge.style.display = n ? 'inline-block' : 'none';
        }
    });

})(window);
