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
        citas: 'pegasso_citas',
        eventos: 'pegasso_eventos',
        asistencias: 'pegasso_asistencias',
        seed: 'pegasso_seed_version'
    };

    var SEED_VERSION = '4';

    // Disponibilidad de cada libro en el catálogo (RF2 y RF7).
    var DISPONIBILIDAD = ['Disponible', 'Últimas copias', 'Agotado', 'Próximamente'];

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

    var GENEROS = ['Infantil', 'Juvenil', 'Educativo', 'Didáctico', 'Idiomas', 'Religioso', 'Novela', 'Ensayo', 'Poesía'];

    /* ------------------------------------------------------- Catálogo semilla */
    /* Libros que ya existen en el sitio, cargados la primera vez que se abre. */

    var LIBROS_SEED = [
        /* ---------------------------------------------- Coleccion Rody Matematicas */
        {
            titulo: 'Rody Matemáticas - Bloque 1',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2021,
            paginas: 180,
            precio: 320,
            isbn: '978-607-0001-01-1',
            portada: 'EDUCATIVO/MATEMATICAS/rody matematicas.png',
            descripcion: 'Cuaderno de trabajo para desarrollar el pensamiento matemático conforme a la Nueva Escuela Mexicana.',
            keywords: ['matematicas', 'primaria', 'nem', 'ejercicios', 'rody'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Rody Matemáticas - Bloque 2',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2022,
            paginas: 176,
            precio: 320,
            isbn: '978-607-0001-02-8',
            portada: 'EDUCATIVO/MATEMATICAS/rody matematicas bloque-2.png',
            descripcion: 'Segundo bloque de la colección: operaciones, fracciones y resolución de problemas cotidianos.',
            keywords: ['matematicas', 'fracciones', 'problemas', 'primaria', 'rody'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Rody Matemáticas - Bloque 3',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2023,
            paginas: 184,
            precio: 340,
            isbn: '978-607-0001-03-5',
            portada: 'EDUCATIVO/MATEMATICAS/rody matematicas bloque-3.png',
            descripcion: 'Geometría, medición y estadística básica con actividades para trabajar en casa y en el aula.',
            keywords: ['matematicas', 'geometria', 'medicion', 'estadistica', 'rody'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Rody Matemáticas - Guía del Docente',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2023,
            paginas: 96,
            precio: 260,
            isbn: '978-607-0001-04-2',
            portada: 'EDUCATIVO/MATEMATICAS/f92d7a03-b020-4093-9464-c714ab4b06dd.png',
            descripcion: 'Secuencias didácticas, rúbricas y soluciones para acompañar los tres bloques de la colección.',
            keywords: ['docente', 'planeacion', 'rubricas', 'matematicas', 'nem'],
            formato: 'Digital (PDF)'
        },

        /* ------------------------------------------------ Coleccion Lectoescritura */
        {
            titulo: 'Lectoescritura Rody - Cuaderno 1',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2022,
            paginas: 160,
            precio: 310,
            isbn: '978-607-0001-05-9',
            portada: 'EDUCATIVO/LECTOESCRITURA/PORTA LECTO 1.png',
            descripcion: 'Método integral de lectoescritura con actividades graduadas para primeros lectores.',
            keywords: ['lectoescritura', 'lectura', 'escritura', 'preescolar', 'trazos'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Lectoescritura Rody - Cuaderno 2',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2022,
            paginas: 158,
            precio: 310,
            isbn: '978-607-0001-06-6',
            portada: 'EDUCATIVO/LECTOESCRITURA/PORTA LECTO 2.png',
            descripcion: 'Sílabas compuestas, formación de palabras y primeras oraciones con apoyo visual.',
            keywords: ['lectoescritura', 'silabas', 'palabras', 'primaria'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Lectoescritura Rody - Cuaderno 3',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2023,
            paginas: 164,
            precio: 320,
            isbn: '978-607-0001-07-3',
            portada: 'EDUCATIVO/LECTOESCRITURA/PORTA LECTO 3.png',
            descripcion: 'Comprensión lectora, dictado y redacción de textos breves para segundo grado.',
            keywords: ['comprension lectora', 'dictado', 'redaccion', 'lectoescritura'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Lectoescritura Rody - Cuaderno 4',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Educativo',
            anio: 2024,
            paginas: 168,
            precio: 330,
            isbn: '978-607-0001-08-0',
            portada: 'EDUCATIVO/LECTOESCRITURA/PORTA LECTO 4.png',
            descripcion: 'Ortografía, tipos de texto y producción escrita con proyectos integradores.',
            keywords: ['ortografia', 'redaccion', 'proyectos', 'lectoescritura'],
            formato: 'Digital (PDF)'
        },

        /* --------------------------------------------------- Coleccion de Idiomas */
        {
            titulo: 'Curso de Inglés PEGASSO - Nivel Básico',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Idiomas',
            anio: 2024,
            paginas: 210,
            precio: 380,
            isbn: '978-607-0001-09-7',
            portada: 'EDUCATIVO/CURSO DE INGLÉS/c0bf3554-eed0-4809-8c1e-5a6e8d0509c1.png',
            descripcion: 'Curso de inglés con audios y ejercicios prácticos para el nivel básico escolar.',
            keywords: ['ingles', 'idiomas', 'curso', 'basico', 'bilingue'],
            formato: 'Digital (PDF + audio)'
        },
        {
            titulo: 'Curso de Inglés PEGASSO - Nivel Intermedio',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Idiomas',
            anio: 2025,
            paginas: 224,
            precio: 410,
            isbn: '978-607-0001-10-3',
            portada: 'EDUCATIVO/CURSO DE INGLÉS/4451c69d-7956-4bc8-8260-7424a651e0c-2.png',
            descripcion: 'Segundo nivel: tiempos verbales, conversación guiada y comprensión auditiva.',
            keywords: ['ingles', 'idiomas', 'intermedio', 'conversacion', 'gramatica'],
            formato: 'Digital (PDF + audio)'
        },

        /* --------------------------------------------- Coleccion Conoce y Descubre */
        {
            titulo: 'Conoce y Descubre 1: Dinosaurios',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2022,
            paginas: 140,
            precio: 290,
            isbn: '978-607-0001-11-0',
            portada: 'EDUCATIVO/CONOCE Y DESCUBRE/libro-tomo-dinosaurio-web.png',
            descripcion: 'Los gigantes que habitaron la Tierra, explicados con ilustraciones y datos sorprendentes.',
            keywords: ['dinosaurios', 'ciencia', 'prehistoria', 'infantil', 'descubrir'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Conoce y Descubre 2: El Cuerpo Humano',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2023,
            paginas: 140,
            precio: 290,
            isbn: '978-607-0001-12-7',
            portada: 'EDUCATIVO/CONOCE Y DESCUBRE/RODY-CONOCE-2.png',
            descripcion: 'Un recorrido por los sistemas del cuerpo humano con lenguaje claro para niñas y niños.',
            keywords: ['cuerpo humano', 'anatomia', 'ciencia', 'salud', 'infantil'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Conoce y Descubre 3: Grandes Inventos',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2023,
            paginas: 144,
            precio: 295,
            isbn: '978-607-0001-13-4',
            portada: 'EDUCATIVO/CONOCE Y DESCUBRE/RODY-CONOCE-3.png',
            descripcion: 'Los inventos que cambiaron la historia y las mentes curiosas que los hicieron posibles.',
            keywords: ['inventos', 'historia', 'tecnologia', 'ciencia', 'descubrir'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Conoce y Descubre 4: Nuestro Planeta',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2024,
            paginas: 148,
            precio: 300,
            isbn: '978-607-0001-14-1',
            portada: 'EDUCATIVO/CONOCE Y DESCUBRE/RODY-CONOCE.png',
            descripcion: 'Ecosistemas, biodiversidad y cuidado del medio ambiente en un libro borrable y reutilizable.',
            keywords: ['planeta', 'ecologia', 'biodiversidad', 'medio ambiente', 'ciencia'],
            formato: 'Digital (PDF)'
        },

        /* ------------------------------------------------- Coleccion El Principito */
        {
            titulo: 'El Principito - Edición Ilustrada',
            autor: 'Antoine de Saint-Exupéry',
            genero: 'Infantil',
            anio: 2023,
            paginas: 120,
            precio: 249,
            isbn: '978-607-0001-15-8',
            portada: 'EDUCATIVO/EL PRINCIPITO/PRINCIPITO.PNG',
            descripcion: 'Una historia mágica llena de enseñanzas valiosas, con ilustraciones originales de PEGASSO.',
            keywords: ['principito', 'ilustrado', 'infantil', 'clasico', 'lectura'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'El Principito - Cuaderno de Actividades',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Infantil',
            anio: 2023,
            paginas: 64,
            precio: 180,
            isbn: '978-607-0001-16-5',
            portada: 'EDUCATIVO/EL PRINCIPITO/PRINCIPITO-2.PNG',
            descripcion: 'Juegos, recortables y ejercicios de comprensión para acompañar la lectura del clásico.',
            keywords: ['principito', 'actividades', 'juegos', 'comprension', 'infantil'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'El Principito - Edición Escolar Comentada',
            autor: 'Antoine de Saint-Exupéry',
            genero: 'Juvenil',
            anio: 2024,
            paginas: 156,
            precio: 285,
            isbn: '978-607-0001-17-2',
            portada: 'EDUCATIVO/EL PRINCIPITO/PRINCIPITO-5.PNG',
            descripcion: 'Texto íntegro con notas al margen, contexto histórico y preguntas de análisis para secundaria.',
            keywords: ['principito', 'escolar', 'comentada', 'secundaria', 'analisis'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'El Principito - Guía de Lectura para Docentes',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Didáctico',
            anio: 2024,
            paginas: 72,
            precio: 195,
            isbn: '978-607-0001-18-9',
            portada: 'EDUCATIVO/EL PRINCIPITO/PRINCIPITO-7.PNG',
            descripcion: 'Planeación por sesiones, dinámicas de grupo y evaluación para trabajar la obra en el aula.',
            keywords: ['docente', 'guia', 'planeacion', 'principito', 'lectura'],
            formato: 'Digital (PDF)'
        },

        /* ----------------------------------------------------- Coleccion Religiosa */
        {
            titulo: 'Biblia de Estudio PEGASSO',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2024,
            paginas: 1450,
            precio: 890,
            isbn: '978-607-0001-19-6',
            portada: 'img/RELIGIOSO/BIBLIA DE ESTUDIO/BIBLIA-ESTUDIO.png',
            descripcion: 'Biblia con notas de estudio, mapas, cronologías y comentarios versículo por versículo.',
            keywords: ['biblia', 'estudio', 'comentarios', 'escrituras', 'mapas'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Biblia de Estudio - Edición de Bolsillo',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2025,
            paginas: 1180,
            precio: 620,
            isbn: '978-607-0001-20-2',
            portada: 'img/RELIGIOSO/BIBLIA DE ESTUDIO/BIBLIA-ESTUDIO-2.png',
            descripcion: 'La misma edición de estudio en formato compacto, ideal para grupos parroquiales y viaje.',
            keywords: ['biblia', 'bolsillo', 'estudio', 'parroquia', 'grupos'],
            formato: 'Digital (EPUB)'
        },
        {
            titulo: 'Biblia de Estudio - Edición Familiar',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2025,
            paginas: 1520,
            precio: 980,
            isbn: '978-607-0001-21-9',
            portada: 'img/RELIGIOSO/BIBLIA DE ESTUDIO/BIBLIA-ESTUDIO-3.png',
            descripcion: 'Edición con árbol genealógico, guía de lectura anual y espacio para registros familiares.',
            keywords: ['biblia', 'familiar', 'lectura anual', 'hogar', 'estudio'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Biblia de Arte',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Religioso',
            anio: 2023,
            paginas: 980,
            precio: 1250,
            isbn: '978-607-0001-22-6',
            portada: 'img/RELIGIOSO/BIBLIA DE ARTE/AIE23072-biblia-de-arte-PEGASSO-1.JPG',
            descripcion: 'Edición de lujo que acompaña el texto bíblico con obras maestras del arte sacro universal.',
            keywords: ['biblia', 'arte', 'lujo', 'coleccion', 'sacro'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Biblia Infantil Ilustrada',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Infantil',
            anio: 2023,
            paginas: 220,
            precio: 350,
            isbn: '978-607-0001-23-3',
            portada: 'img/RELIGIOSO/BIBLIA INFANTIL/PORTADA.png',
            descripcion: 'Relatos bíblicos adaptados para niños con ilustraciones a todo color.',
            keywords: ['biblia', 'infantil', 'ilustrada', 'catequesis', 'relatos'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Biblia Infantil - Nuevo Testamento para Niños',
            autor: 'Comité Bíblico PEGASSO',
            genero: 'Infantil',
            anio: 2024,
            paginas: 190,
            precio: 320,
            isbn: '978-607-0001-24-0',
            portada: 'img/RELIGIOSO/BIBLIA INFANTIL/biblia infantil pegasso.png',
            descripcion: 'La vida y las parábolas de Jesús contadas con lenguaje sencillo para primeros lectores.',
            keywords: ['nuevo testamento', 'jesus', 'parabolas', 'infantil', 'catequesis'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Mariología',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Religioso',
            anio: 2022,
            paginas: 250,
            precio: 420,
            isbn: '978-607-0001-25-7',
            portada: 'img/RELIGIOSO/MARIOLOGIA/PORTADA LIBRO-2.png',
            descripcion: 'Estudio sobre la figura de María en la tradición y el magisterio de la Iglesia.',
            keywords: ['mariologia', 'maria', 'teologia', 'catolico', 'fe'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Mariología - Edición de Estudio',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Ensayo',
            anio: 2024,
            paginas: 310,
            precio: 520,
            isbn: '978-607-0001-26-4',
            portada: 'img/RELIGIOSO/MARIOLOGIA/PORTADA LIBRO-3.png',
            descripcion: 'Versión ampliada con aparato crítico, fuentes patrísticas y guía para seminarios.',
            keywords: ['mariologia', 'patristica', 'seminario', 'teologia', 'estudio'],
            formato: 'Digital (PDF)'
        },
        {
            titulo: 'Defendiendo la Fe - Tomo I',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Ensayo',
            anio: 2024,
            paginas: 310,
            precio: 460,
            isbn: '978-607-0001-27-1',
            portada: 'img/RELIGIOSO/DEFENDIENDO LA FE/EN-DEFENSA-1-PAGINADO-TERMINA-EN-IZQ-2024-2.png',
            descripcion: 'Apologética accesible para responder las preguntas más frecuentes sobre la fe católica.',
            keywords: ['apologetica', 'fe', 'ensayo', 'catolico', 'defensa'],
            formato: 'Digital (PDF/EPUB)'
        },
        {
            titulo: 'Defendiendo la Fe - Tomo II',
            autor: 'Pbro. J. Rodríguez',
            genero: 'Ensayo',
            anio: 2025,
            paginas: 328,
            precio: 480,
            isbn: '978-607-0001-28-8',
            portada: 'img/RELIGIOSO/DEFENDIENDO LA FE/EN-DEFENSA-2-PAGINADO-TERMINA-EN-IZQ-RECUPERADO-2024-2-2.png',
            descripcion: 'Segunda parte: sacramentos, historia de la Iglesia y objeciones contemporáneas.',
            keywords: ['apologetica', 'sacramentos', 'historia', 'iglesia', 'fe'],
            formato: 'Digital (PDF/EPUB)'
        },

        /* ------------------------------ Ediciones EPUB con lector en línea */
        {
            titulo: 'Guía del Autor PEGASSO',
            autor: 'Equipo Editorial PEGASSO',
            genero: 'Didáctico',
            anio: 2026,
            paginas: 86,
            precio: 0,
            isbn: '978-607-0001-29-5',
            portada: 'img/epub/guia-del-autor.png',
            descripcion: 'Todo lo que necesitas saber para preparar tu obra, enviarla a dictamen y acompañarla hasta el catálogo digital.',
            keywords: ['guia', 'autores', 'manuscrito', 'dictamen', 'edicion', 'epub'],
            formato: 'Digital (EPUB)',
            epub: 'libros-epub/guia-del-autor-pegasso.epub'
        },
        {
            titulo: 'Rody y el Bosque de las Preguntas',
            autor: 'Equipo Pedagógico PEGASSO',
            genero: 'Infantil',
            anio: 2026,
            paginas: 64,
            precio: 149,
            isbn: '978-607-0001-30-1',
            portada: 'img/epub/rody-bosque.png',
            descripcion: 'Rody entra a un bosque donde los árboles solo dejan pasar a quien se atreve a preguntar. Un cuento para lectores de 7 a 11 años.',
            keywords: ['rody', 'cuento', 'infantil', 'preguntas', 'curiosidad', 'epub'],
            formato: 'Digital (EPUB)',
            epub: 'libros-epub/rody-y-el-bosque-de-las-preguntas.epub'
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
            // Disponibilidad repartida: la mayoría disponible, con algunos
            // agotados o por salir para que el catálogo se vea realista.
            var disp = 'Disponible';
            if (i % 9 === 4) { disp = 'Últimas copias'; }
            if (i % 13 === 7) { disp = 'Agotado'; }
            if (l.anio >= 2025 && i % 5 === 0) { disp = 'Próximamente'; }
            return Object.assign({}, l, {
                id: 'lib-seed-' + (i + 1),
                fechaPublicacion: fechaMenos(15 + i * 12),
                keywords: l.keywords.slice(),
                editorial: 'PEGASSO Editorial',
                sinopsis: l.descripcion,
                disponibilidad: disp,
                epub: l.epub || null,
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
            var publicado = new Date(libro.fechaPublicacion);
            for (var mes = 11; mes >= 0; mes--) {
                var operaciones = 1 + Math.floor(rnd() * 4);
                for (var k = 0; k < operaciones; k++) {
                    var f = new Date(hoy.getFullYear(), hoy.getMonth() - mes, 1 + Math.floor(rnd() * 27));
                    // Un libro no puede tener ventas anteriores a su publicación.
                    if (f < publicado) { continue; }
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

        // Agenda de eventos de la editorial (RF9)
        function enDias(dias, hora) {
            var d = new Date();
            d.setDate(d.getDate() + dias);
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0') + (hora ? 'T' + hora : '');
        }

        escribir(KEYS.eventos, [
            {
                id: 'eve-seed-1', titulo: 'Taller: Cómo preparar tu manuscrito',
                tipo: 'Taller', fecha: enDias(4), hora: '17:00', duracion: 120,
                lugar: 'Sala de juntas PEGASSO, Puebla', capacidad: 25,
                descripcion: 'Guía práctica sobre formato, estructura y errores frecuentes al enviar una obra a dictamen.',
                creado: ahora()
            },
            {
                id: 'eve-seed-2', titulo: 'Reunión del comité editorial',
                tipo: 'Reunión', fecha: enDias(9), hora: '10:00', duracion: 180,
                lugar: 'Oficina central', capacidad: 12,
                descripcion: 'Dictamen de los manuscritos recibidos durante el mes y calendario de publicación.',
                creado: ahora()
            },
            {
                id: 'eve-seed-3', titulo: 'Debate: La lectura en la Nueva Escuela Mexicana',
                tipo: 'Debate', fecha: enDias(16), hora: '18:30', duracion: 90,
                lugar: 'Auditorio Casa de Cultura', capacidad: 80,
                descripcion: 'Mesa de discusión con docentes sobre materiales de lectura en el aula.',
                creado: ahora()
            },
            {
                id: 'eve-seed-4', titulo: 'Presentación: Biblia de Arte',
                tipo: 'Evento', fecha: enDias(23), hora: '19:00', duracion: 120,
                lugar: 'Librería Central, Puebla', capacidad: 120,
                descripcion: 'Presentación editorial con firma de ejemplares y recorrido por las láminas de arte sacro.',
                creado: ahora()
            },
            {
                id: 'eve-seed-5', titulo: 'Taller de lectoescritura para docentes',
                tipo: 'Taller', fecha: enDias(-12), hora: '16:00', duracion: 150,
                lugar: 'Escuela Primaria Benito Juárez', capacidad: 30,
                descripcion: 'Sesión práctica con la colección Rody Lectoescritura.',
                creado: ahora()
            }
        ]);

        escribir(KEYS.asistencias, [
            { id: 'asi-seed-1', eventoId: 'eve-seed-5', miembro: 'María Fernanda Luna', email: 'mf.luna@ejemplo.com', estado: 'asistio', registro: fechaMenos(14) },
            { id: 'asi-seed-2', eventoId: 'eve-seed-5', miembro: 'Ricardo Solís', email: 'r.solis@ejemplo.com', estado: 'asistio', registro: fechaMenos(15) },
            { id: 'asi-seed-3', eventoId: 'eve-seed-1', miembro: 'Claudia Ibarra', email: 'c.ibarra@ejemplo.com', estado: 'registrado', registro: fechaMenos(2) }
        ]);

        // Solicitudes de cita (RF6)
        escribir(KEYS.citas, [
            {
                id: 'cit-seed-1', nombre: 'Jorge Antonio Vega', email: 'ja.vega@ejemplo.com',
                telefono: '222 111 2233', fecha: enDias(3), hora: '11:00',
                motivo: 'Revisión de contrato de edición', estado: 'confirmada', creado: fechaMenos(3)
            },
            {
                id: 'cit-seed-2', nombre: 'Guadalupe Ramos', email: 'g.ramos@ejemplo.com',
                telefono: '222 445 8890', fecha: enDias(6), hora: '13:30',
                motivo: 'Presentación de propuesta de colección catequética', estado: 'pendiente', creado: fechaMenos(1)
            }
        ]);

        window.localStorage.setItem(KEYS.seed, SEED_VERSION);
    }

    /* --------------------------------------------------------------- API */

    var API = {
        KEYS: KEYS,
        ESTADOS: ESTADOS,
        GENEROS: GENEROS,
        DISPONIBILIDAD: DISPONIBILIDAD,
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
                sinopsis: datos.sinopsis || datos.descripcion || '',
                editorial: datos.editorial || 'PEGASSO Editorial',
                disponibilidad: datos.disponibilidad || 'Disponible',
                keywords: (datos.keywords || '').split(',').map(function (k) {
                    return k.trim();
                }).filter(Boolean),
                formato: datos.formato || 'Digital (PDF)',
                epub: datos.epub || null,
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

        // Edición y baja de libros del catálogo (RF7)
        actualizarLibro: function (id, datos) {
            var actualizado = null;
            var lista = leer(KEYS.libros).map(function (l) {
                if (l.id !== id) { return l; }
                ['titulo', 'autor', 'genero', 'editorial', 'isbn', 'portada', 'formato', 'disponibilidad'].forEach(function (campo) {
                    if (datos[campo] !== undefined && datos[campo] !== '') { l[campo] = datos[campo]; }
                });
                if (datos.anio !== undefined && datos.anio !== '') { l.anio = Number(datos.anio); }
                if (datos.paginas !== undefined && datos.paginas !== '') { l.paginas = Number(datos.paginas); }
                if (datos.precio !== undefined && datos.precio !== '') { l.precio = Number(datos.precio); }
                if (datos.sinopsis !== undefined) { l.sinopsis = datos.sinopsis; l.descripcion = datos.sinopsis; }
                if (datos.keywords !== undefined) {
                    l.keywords = (datos.keywords || '').split(',').map(function (k) { return k.trim(); }).filter(Boolean);
                }
                l.actualizado = ahora();
                actualizado = l;
                return l;
            });
            escribir(KEYS.libros, lista);
            return actualizado;
        },

        eliminarLibro: function (id) {
            escribir(KEYS.libros, leer(KEYS.libros).filter(function (l) { return l.id !== id; }));
        },

        /* Búsqueda con puntaje de relevancia (RF8).
           El título pesa más que el autor, el autor más que el género y las
           palabras clave cierran; una coincidencia exacta o al inicio suma. */
        buscarLibros: function (filtros) {
            filtros = filtros || {};
            var q = normalizar(filtros.q);
            var campo = filtros.campo || 'todos';

            var resultados = API.getLibros().map(function (libro) {
                if (filtros.soloPublicados !== false && !libro.publicado) { return null; }
                if (filtros.genero && libro.genero !== filtros.genero) { return null; }
                if (filtros.anio && String(libro.anio) !== String(filtros.anio)) { return null; }
                if (filtros.precioMax && Number(libro.precio) > Number(filtros.precioMax)) { return null; }
                if (filtros.disponibilidad && libro.disponibilidad !== filtros.disponibilidad) { return null; }
                if (!q) { return { libro: libro, score: 0 }; }

                var titulo = normalizar(libro.titulo);
                var autor = normalizar(libro.autor);
                var genero = normalizar(libro.genero);
                var texto = normalizar(libro.sinopsis || libro.descripcion);
                var keys = (libro.keywords || []).map(normalizar);

                var score = 0;
                if (campo === 'todos' || campo === 'titulo') {
                    if (titulo === q) { score += 120; }
                    else if (titulo.indexOf(q) === 0) { score += 90; }
                    else if (titulo.indexOf(q) !== -1) { score += 70; }
                }
                if (campo === 'todos' || campo === 'autor') {
                    if (autor === q) { score += 60; }
                    else if (autor.indexOf(q) !== -1) { score += 45; }
                }
                if (campo === 'todos' || campo === 'genero') {
                    if (genero === q) { score += 40; }
                    else if (genero.indexOf(q) !== -1) { score += 30; }
                }
                if (campo === 'todos' || campo === 'keywords') {
                    keys.forEach(function (k) {
                        if (k === q) { score += 25; }
                        else if (k.indexOf(q) !== -1) { score += 15; }
                    });
                    if (texto.indexOf(q) !== -1) { score += 10; }
                }

                return score > 0 ? { libro: libro, score: score } : null;
            }).filter(Boolean);

            resultados.sort(function (a, b) {
                if (b.score !== a.score) { return b.score - a.score; }
                return a.libro.titulo.localeCompare(b.libro.titulo, 'es');
            });

            return resultados.map(function (r) {
                r.libro.relevancia = r.score;
                return r.libro;
            });
        },

        /* -------------------------------------------- Citas con la editorial (RF6) */
        getCitas: function () {
            return leer(KEYS.citas).sort(function (a, b) {
                return new Date(b.creado) - new Date(a.creado);
            });
        },

        solicitarCita: function (datos) {
            var lista = leer(KEYS.citas);
            // Una misma fecha y hora no puede tener dos citas confirmadas.
            var ocupada = lista.some(function (c) {
                return c.fecha === datos.fecha && c.hora === datos.hora && c.estado !== 'cancelada';
            });
            var cita = {
                id: uid('cit'),
                folio: 'CITA-' + new Date().getFullYear() + '-' + String(100 + lista.length + 1),
                nombre: datos.nombre,
                email: datos.email,
                telefono: datos.telefono,
                fecha: datos.fecha,
                hora: datos.hora,
                motivo: datos.motivo,
                estado: ocupada ? 'en-espera' : 'pendiente',
                creado: ahora()
            };
            lista.push(cita);
            escribir(KEYS.citas, lista);
            return cita;
        },

        cambiarEstadoCita: function (id, estado) {
            var lista = leer(KEYS.citas).map(function (c) {
                if (c.id === id) { c.estado = estado; c.actualizado = ahora(); }
                return c;
            });
            escribir(KEYS.citas, lista);
        },

        eliminarCita: function (id) {
            escribir(KEYS.citas, leer(KEYS.citas).filter(function (c) { return c.id !== id; }));
        },

        horarioOcupado: function (fecha, hora) {
            return leer(KEYS.citas).some(function (c) {
                return c.fecha === fecha && c.hora === hora && c.estado !== 'cancelada';
            });
        },

        /* ------------------------------------- Eventos y asistencia (RF9 y RF10) */
        getEventos: function () {
            return leer(KEYS.eventos).sort(function (a, b) {
                return new Date(a.fecha + 'T' + (a.hora || '00:00')) - new Date(b.fecha + 'T' + (b.hora || '00:00'));
            });
        },

        getEvento: function (id) {
            return leer(KEYS.eventos).filter(function (e) { return e.id === id; })[0] || null;
        },

        guardarEvento: function (datos) {
            var lista = leer(KEYS.eventos);
            if (datos.id) {
                lista = lista.map(function (e) {
                    return e.id === datos.id ? Object.assign({}, e, datos, { actualizado: ahora() }) : e;
                });
                escribir(KEYS.eventos, lista);
                return API.getEvento(datos.id);
            }
            var evento = {
                id: uid('eve'),
                titulo: datos.titulo,
                tipo: datos.tipo || 'Evento',
                fecha: datos.fecha,
                hora: datos.hora,
                duracion: Number(datos.duracion) || 60,
                lugar: datos.lugar || '',
                descripcion: datos.descripcion || '',
                capacidad: Number(datos.capacidad) || 0,
                creado: ahora()
            };
            lista.push(evento);
            escribir(KEYS.eventos, lista);
            return evento;
        },

        eliminarEvento: function (id) {
            escribir(KEYS.eventos, leer(KEYS.eventos).filter(function (e) { return e.id !== id; }));
            escribir(KEYS.asistencias, leer(KEYS.asistencias).filter(function (a) { return a.eventoId !== id; }));
        },

        getAsistencias: function (filtros) {
            filtros = filtros || {};
            return leer(KEYS.asistencias).filter(function (a) {
                if (filtros.eventoId && a.eventoId !== filtros.eventoId) { return false; }
                if (filtros.email && normalizar(a.email) !== normalizar(filtros.email)) { return false; }
                return true;
            }).sort(function (a, b) { return new Date(b.registro) - new Date(a.registro); });
        },

        cupoDisponible: function (eventoId) {
            var evento = API.getEvento(eventoId);
            if (!evento) { return 0; }
            var inscritos = API.getAsistencias({ eventoId: eventoId }).length;
            return Math.max(0, (Number(evento.capacidad) || 0) - inscritos);
        },

        inscribirse: function (eventoId, miembro, email) {
            var evento = API.getEvento(eventoId);
            if (!evento) { return { ok: false, mensaje: 'El evento ya no existe.' }; }

            var yaInscrito = API.getAsistencias({ eventoId: eventoId }).some(function (a) {
                return normalizar(a.email) === normalizar(email);
            });
            if (yaInscrito) { return { ok: false, mensaje: 'Ya estabas registrado en este evento.' }; }
            if (API.cupoDisponible(eventoId) <= 0) { return { ok: false, mensaje: 'El evento alcanzó su capacidad máxima.' }; }

            var lista = leer(KEYS.asistencias);
            var registro = {
                id: uid('asi'),
                eventoId: eventoId,
                miembro: miembro,
                email: email,
                estado: 'registrado',
                registro: ahora()
            };
            lista.push(registro);
            escribir(KEYS.asistencias, lista);
            return { ok: true, registro: registro, mensaje: 'Registro confirmado para "' + evento.titulo + '".' };
        },

        cambiarAsistencia: function (id, estado) {
            var lista = leer(KEYS.asistencias).map(function (a) {
                if (a.id === id) { a.estado = estado; }
                return a;
            });
            escribir(KEYS.asistencias, lista);
        },

        cancelarInscripcion: function (id) {
            escribir(KEYS.asistencias, leer(KEYS.asistencias).filter(function (a) { return a.id !== id; }));
        },

        // Historial de asistencia de un miembro (RF10)
        historialMiembro: function (email) {
            return API.getAsistencias({ email: email }).map(function (a) {
                var evento = API.getEvento(a.eventoId);
                return Object.assign({}, a, {
                    evento: evento ? evento.titulo : '(evento eliminado)',
                    fecha: evento ? evento.fecha : '',
                    hora: evento ? evento.hora : '',
                    lugar: evento ? evento.lugar : '',
                    tipo: evento ? evento.tipo : ''
                });
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

        /* Catálogo completo en PDF (RF5).
           Se arma una hoja imprimible con los datos actuales del catálogo y se
           manda a imprimir: el navegador ofrece "Guardar como PDF". Se genera
           en el momento, así que siempre refleja el catálogo vigente. */
        catalogoPDF: function (libros) {
            var lista = (libros && libros.length ? libros : API.buscarLibros({}));
            if (!lista.length) { return false; }

            var generado = new Date().toLocaleDateString('es-MX', {
                day: '2-digit', month: 'long', year: 'numeric'
            });

            // Agrupado por género para que el PDF salga por categorías.
            var porGenero = {};
            lista.forEach(function (l) {
                (porGenero[l.genero] = porGenero[l.genero] || []).push(l);
            });

            var secciones = Object.keys(porGenero).sort().map(function (genero) {
                var filas = porGenero[genero].map(function (l) {
                    return '<tr>' +
                        '<td class="t">' + escapeHtml(l.titulo) + '</td>' +
                        '<td>' + escapeHtml(l.autor) + '</td>' +
                        '<td>' + escapeHtml(l.genero) + '</td>' +
                        '<td class="c">' + escapeHtml(l.anio) + '</td>' +
                        '<td class="s">' + escapeHtml(l.sinopsis || l.descripcion || '') + '</td>' +
                        '</tr>';
                }).join('');
                return '<h2>' + escapeHtml(genero) + ' <span>(' + porGenero[genero].length + ')</span></h2>' +
                    '<table><thead><tr><th>Título</th><th>Autor</th><th>Género</th><th>Año</th><th>Sinopsis</th></tr></thead>' +
                    '<tbody>' + filas + '</tbody></table>';
            }).join('');

            var html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
                '<title>Catálogo PEGASSO Editorial</title><style>' +
                'body{font-family:Georgia,"Times New Roman",serif;color:#00394f;margin:32px;}' +
                'header{border-bottom:3px solid #17a2b8;padding-bottom:12px;margin-bottom:24px;}' +
                'h1{margin:0 0 4px;font-size:26px;}' +
                'header p{margin:0;color:#5a6b73;font-size:12px;}' +
                'h2{font-size:16px;margin:26px 0 8px;color:#0c6b7a;border-left:4px solid #17a2b8;padding-left:8px;}' +
                'h2 span{color:#8a9aa1;font-weight:normal;font-size:12px;}' +
                'table{width:100%;border-collapse:collapse;font-size:11px;}' +
                'th{background:#00394f;color:#fff;text-align:left;padding:6px 8px;font-size:11px;}' +
                'td{border-bottom:1px solid #dde5e8;padding:6px 8px;vertical-align:top;}' +
                'td.t{font-weight:bold;width:22%;}td.c{text-align:center;width:7%;}td.s{width:37%;color:#3d5560;}' +
                'tr{page-break-inside:avoid;}h2{page-break-after:avoid;}' +
                'footer{margin-top:28px;border-top:1px solid #dde5e8;padding-top:10px;font-size:10px;color:#8a9aa1;text-align:center;}' +
                '@page{margin:14mm;}' +
                '</style></head><body>' +
                '<header><h1>PEGASSO Editorial · Catálogo de libros</h1>' +
                '<p>' + lista.length + ' títulos · generado el ' + generado + '</p></header>' +
                secciones +
                '<footer>PEGASSO Editorial · dir.gral.pegasso@gmail.com · +52 222 755 6588</footer>' +
                '</body></html>';

            var ventana = window.open('', '_blank');
            if (!ventana) { return false; }
            ventana.document.open();
            ventana.document.write(html);
            ventana.document.close();
            ventana.focus();
            setTimeout(function () { ventana.print(); }, 400);
            return true;
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
