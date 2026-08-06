/* ==========================================================================
   PEGASSO Editorial - Lector de EPUB
   --------------------------------------------------------------------------
   Un EPUB es un ZIP con XHTML dentro. Aquí se lee el ZIP a mano (directorio
   central + entradas) y se descomprime con DecompressionStream, que ya traen
   los navegadores, así que no hace falta ninguna librería externa.

   Uso:
     var libro = await PEGASSO_EPUB.abrir(arrayBuffer);
     libro.titulo, libro.autor, libro.indice, libro.capitulos
     var html = await libro.capitulo(0);
   ========================================================================== */
(function (window) {
    "use strict";

    /* ------------------------------------------------------------ Lector ZIP */

    function leerUint32(vista, pos) { return vista.getUint32(pos, true); }
    function leerUint16(vista, pos) { return vista.getUint16(pos, true); }

    // Localiza el "End of Central Directory" al final del archivo.
    function finDirectorio(vista, largo) {
        var maximo = Math.min(largo, 66000);
        for (var i = largo - 22; i >= largo - maximo; i--) {
            if (i < 0) { break; }
            if (leerUint32(vista, i) === 0x06054b50) { return i; }
        }
        return -1;
    }

    function decodificarNombre(bytes, utf8) {
        try {
            return new TextDecoder(utf8 ? 'utf-8' : 'utf-8').decode(bytes);
        } catch (e) {
            return String.fromCharCode.apply(null, bytes);
        }
    }

    async function inflar(comprimido) {
        if (typeof window.DecompressionStream !== 'function') {
            throw new Error('Este navegador no puede descomprimir el archivo. ' +
                'Actualízalo o prueba con Chrome, Edge o Firefox recientes.');
        }
        var flujo = new Blob([comprimido]).stream()
            .pipeThrough(new window.DecompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(flujo).arrayBuffer());
    }

    async function abrirZip(buffer) {
        var datos = new Uint8Array(buffer);
        var vista = new DataView(buffer);
        var fin = finDirectorio(vista, datos.length);
        if (fin === -1) { throw new Error('El archivo no parece un EPUB válido.'); }

        var total = leerUint16(vista, fin + 10);
        var inicio = leerUint32(vista, fin + 16);
        var entradas = {};
        var pos = inicio;

        for (var i = 0; i < total; i++) {
            if (leerUint32(vista, pos) !== 0x02014b50) { break; }
            var metodo = leerUint16(vista, pos + 10);
            var banderas = leerUint16(vista, pos + 8);
            var comprimido = leerUint32(vista, pos + 20);
            var largoNombre = leerUint16(vista, pos + 28);
            var largoExtra = leerUint16(vista, pos + 30);
            var largoComentario = leerUint16(vista, pos + 32);
            var desplazamiento = leerUint32(vista, pos + 42);
            var nombre = decodificarNombre(datos.subarray(pos + 46, pos + 46 + largoNombre),
                (banderas & 0x800) !== 0);

            entradas[nombre] = { metodo: metodo, comprimido: comprimido, desplazamiento: desplazamiento };
            pos += 46 + largoNombre + largoExtra + largoComentario;
        }

        async function extraer(nombre) {
            var e = entradas[nombre];
            if (!e) { throw new Error('El EPUB no contiene "' + nombre + '".'); }

            // El encabezado local repite los tamaños de nombre y extra.
            var p = e.desplazamiento;
            if (leerUint32(vista, p) !== 0x04034b50) { throw new Error('Entrada dañada: ' + nombre); }
            var inicioDatos = p + 30 + leerUint16(vista, p + 26) + leerUint16(vista, p + 28);
            var crudo = datos.subarray(inicioDatos, inicioDatos + e.comprimido);

            if (e.metodo === 0) { return new Uint8Array(crudo); }
            if (e.metodo === 8) { return await inflar(crudo); }
            throw new Error('Compresión no soportada en "' + nombre + '".');
        }

        return {
            archivos: Object.keys(entradas),
            existe: function (n) { return !!entradas[n]; },
            bytes: extraer,
            texto: async function (nombre) {
                return new TextDecoder('utf-8').decode(await extraer(nombre));
            }
        };
    }

    /* ------------------------------------------------------------ EPUB */

    function resolver(base, relativa) {
        if (/^(https?:|data:|blob:|#)/.test(relativa)) { return relativa; }
        var partes = base.split('/');
        partes.pop();
        relativa.split('/').forEach(function (t) {
            if (t === '.' || t === '') { return; }
            if (t === '..') { partes.pop(); } else { partes.push(t); }
        });
        return partes.join('/');
    }

    function tipoMime(ruta) {
        var ext = ruta.split('.').pop().toLowerCase();
        return {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
            svg: 'image/svg+xml', webp: 'image/webp', css: 'text/css'
        }[ext] || 'application/octet-stream';
    }

    async function abrir(buffer) {
        var zip = await abrirZip(buffer);
        var parser = new DOMParser();

        // 1. container.xml apunta al OPF
        var contenedor = parser.parseFromString(
            await zip.texto('META-INF/container.xml'), 'application/xml');
        var rutaOpf = contenedor.querySelector('rootfile').getAttribute('full-path');

        // 2. OPF: metadatos, manifiesto y lomo
        var opf = parser.parseFromString(await zip.texto(rutaOpf), 'application/xml');

        function meta(etiqueta) {
            var n = opf.getElementsByTagName('dc:' + etiqueta)[0] ||
                opf.getElementsByTagName(etiqueta)[0];
            return n ? n.textContent.trim() : '';
        }

        var manifiesto = {};
        Array.prototype.forEach.call(opf.getElementsByTagName('item'), function (item) {
            manifiesto[item.getAttribute('id')] = {
                href: resolver(rutaOpf, item.getAttribute('href')),
                tipo: item.getAttribute('media-type'),
                propiedades: item.getAttribute('properties') || ''
            };
        });

        var lomo = Array.prototype.map.call(opf.getElementsByTagName('itemref'), function (ref) {
            return manifiesto[ref.getAttribute('idref')];
        }).filter(Boolean);

        // 3. Índice: nav.xhtml (EPUB 3) o los títulos de cada documento
        var indice = [];
        var nav = Object.keys(manifiesto).map(function (k) { return manifiesto[k]; })
            .filter(function (i) { return /nav/.test(i.propiedades); })[0];

        if (nav) {
            try {
                var doc = parser.parseFromString(await zip.texto(nav.href), 'application/xhtml+xml');
                Array.prototype.forEach.call(doc.querySelectorAll('nav a, a'), function (a) {
                    var destino = resolver(nav.href, (a.getAttribute('href') || '').split('#')[0]);
                    var pos = lomo.findIndex(function (i) { return i.href === destino; });
                    if (pos !== -1 && !indice.some(function (x) { return x.indice === pos; })) {
                        indice.push({ titulo: a.textContent.trim(), indice: pos });
                    }
                });
            } catch (e) { /* si el nav falla se arma el índice abajo */ }
        }

        if (!indice.length) {
            indice = lomo.map(function (item, i) {
                return { titulo: 'Sección ' + (i + 1), indice: i };
            });
        }

        // Portada declarada en el manifiesto
        var portada = Object.keys(manifiesto).map(function (k) { return manifiesto[k]; })
            .filter(function (i) { return /cover-image/.test(i.propiedades); })[0];

        var urlsCreadas = [];

        async function urlRecurso(ruta) {
            if (!zip.existe(ruta)) { return null; }
            var url = URL.createObjectURL(new Blob([await zip.bytes(ruta)], { type: tipoMime(ruta) }));
            urlsCreadas.push(url);
            return url;
        }

        // Devuelve el HTML del capítulo listo para insertar, con las imágenes
        // apuntando a blobs y sin scripts.
        async function capitulo(n) {
            var item = lomo[n];
            if (!item) { return ''; }
            var doc = parser.parseFromString(await zip.texto(item.href), 'application/xhtml+xml');

            if (doc.querySelector('parsererror')) {
                doc = parser.parseFromString(await zip.texto(item.href), 'text/html');
            }

            Array.prototype.forEach.call(doc.querySelectorAll('script, iframe, object, embed'), function (n) {
                n.parentNode.removeChild(n);
            });

            var imagenes = Array.prototype.slice.call(doc.querySelectorAll('img, image'));
            for (var i = 0; i < imagenes.length; i++) {
                var img = imagenes[i];
                var src = img.getAttribute('src') || img.getAttribute('xlink:href');
                if (!src) { continue; }
                var url = await urlRecurso(resolver(item.href, src));
                if (url) { img.setAttribute('src', url); } else { img.removeAttribute('src'); }
            }

            // Los enlaces internos no deben sacar al lector de la página.
            Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
                var href = a.getAttribute('href');
                if (!/^https?:/.test(href)) {
                    a.removeAttribute('href');
                    a.style.color = 'inherit';
                } else {
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'noopener noreferrer');
                }
            });

            var cuerpo = doc.body || doc.documentElement;
            return cuerpo ? cuerpo.innerHTML : '';
        }

        return {
            titulo: meta('title') || 'Libro sin título',
            autor: meta('creator') || 'Autor desconocido',
            editorial: meta('publisher') || '',
            descripcion: meta('description') || '',
            idioma: meta('language') || 'es',
            total: lomo.length,
            indice: indice,
            capitulo: capitulo,
            portada: function () { return portada ? urlRecurso(portada.href) : Promise.resolve(null); },
            liberar: function () {
                urlsCreadas.forEach(function (u) { URL.revokeObjectURL(u); });
                urlsCreadas = [];
            }
        };
    }

    async function abrirDesdeURL(url) {
        var respuesta = await fetch(url);
        if (!respuesta.ok) { throw new Error('No se pudo descargar el archivo (' + respuesta.status + ').'); }
        return abrir(await respuesta.arrayBuffer());
    }

    function abrirDesdeArchivo(archivo) {
        return new Promise(function (resolve, reject) {
            var lector = new FileReader();
            lector.onload = function () { abrir(lector.result).then(resolve, reject); };
            lector.onerror = function () { reject(new Error('No se pudo leer el archivo.')); };
            lector.readAsArrayBuffer(archivo);
        });
    }

    window.PEGASSO_EPUB = {
        abrir: abrir,
        abrirDesdeURL: abrirDesdeURL,
        abrirDesdeArchivo: abrirDesdeArchivo,
        soportado: typeof window.DecompressionStream === 'function'
    };

})(window);
