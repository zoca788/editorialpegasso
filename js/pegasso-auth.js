/* ==========================================================================
   PEGASSO Editorial - Control de acceso al sistema editorial
   --------------------------------------------------------------------------
   AVISO: el sitio es estático (GitHub Pages), así que esta validación ocurre
   en el navegador. Sirve para separar la parte pública del panel interno,
   pero NO es seguridad real: cualquiera puede leer este archivo. Para
   proteger información sensible de verdad hace falta un servidor que valide
   las credenciales y entregue los datos solo a usuarios autenticados.

   Usuarios de demostración:
     admin / 123456   (administrador, acceso a todos los paneles)
   ========================================================================== */
(function (window) {
    "use strict";

    var CLAVE_SESION = 'pegasso_sesion';

    // Hash simple (djb2) para no dejar la contraseña en texto plano.
    function hash(texto) {
        var h = 5381;
        for (var i = 0; i < texto.length; i++) {
            h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
        }
        return h.toString(16);
    }

    var CLAVE_USUARIOS = 'pegasso_usuarios';

    var USUARIOS = [
        {
            usuario: 'admin',
            clave: hash('123456'),
            nombre: 'Administrador',
            rol: 'Administrador editorial',
            perfil: 'admin',
            iniciales: 'AD'
        }
    ];

    // Autores que se registran desde el portal (RF3).
    function usuariosRegistrados() {
        try {
            return JSON.parse(window.localStorage.getItem(CLAVE_USUARIOS) || '[]');
        } catch (e) {
            return [];
        }
    }

    function guardarUsuarios(lista) {
        try {
            window.localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
        } catch (e) { /* almacenamiento no disponible */ }
    }

    function todosLosUsuarios() {
        return USUARIOS.concat(usuariosRegistrados());
    }

    function iniciales(nombre) {
        return (nombre || '?').trim().split(/\s+/).slice(0, 2)
            .map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
    }

    // Páginas que exigen sesión iniciada.
    var PAGINAS_PROTEGIDAS = ['publicar.html', 'reportes.html', 'notificaciones.html'];

    function almacen() {
        // La sesión "recordada" vive en localStorage; la normal, solo en la pestaña.
        try {
            if (window.localStorage.getItem(CLAVE_SESION)) { return window.localStorage; }
            if (window.sessionStorage.getItem(CLAVE_SESION)) { return window.sessionStorage; }
        } catch (e) { /* almacenamiento no disponible */ }
        return null;
    }

    function sesion() {
        var store = almacen();
        if (!store) { return null; }
        try {
            return JSON.parse(store.getItem(CLAVE_SESION));
        } catch (e) {
            return null;
        }
    }

    var AUTH = {
        PAGINAS_PROTEGIDAS: PAGINAS_PROTEGIDAS,

        sesion: sesion,

        autenticado: function () {
            return !!sesion();
        },

        // Registro de autores desde el portal (RF3)
        registrarAutor: function (datos) {
            var usuario = (datos.usuario || datos.email || '').trim().toLowerCase();
            var email = (datos.email || '').trim().toLowerCase();

            if (!datos.nombre || !email || !datos.clave) {
                return { ok: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' };
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                return { ok: false, mensaje: 'El correo electrónico no tiene un formato válido.' };
            }
            if (String(datos.clave).length < 6) {
                return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
            }
            if (datos.confirmar !== undefined && datos.clave !== datos.confirmar) {
                return { ok: false, mensaje: 'Las contraseñas no coinciden.' };
            }
            if (todosLosUsuarios().some(function (u) { return u.usuario === usuario || u.email === email; })) {
                return { ok: false, mensaje: 'Ya existe una cuenta con ese usuario o correo.' };
            }

            var lista = usuariosRegistrados();
            var nuevo = {
                usuario: usuario,
                email: email,
                clave: hash(datos.clave),
                nombre: datos.nombre.trim(),
                telefono: (datos.telefono || '').trim(),
                genero: datos.genero || '',
                rol: 'Autor registrado',
                perfil: 'autor',
                iniciales: iniciales(datos.nombre),
                registro: new Date().toISOString()
            };
            lista.push(nuevo);
            guardarUsuarios(lista);
            return { ok: true, usuario: nuevo, mensaje: 'Cuenta creada correctamente.' };
        },

        getAutores: function () {
            return usuariosRegistrados();
        },

        entrar: function (usuario, clave, recordar) {
            var buscado = (usuario || '').trim().toLowerCase();
            var encontrado = todosLosUsuarios().filter(function (u) {
                return (u.usuario === buscado || u.email === buscado) && u.clave === hash(clave || '');
            })[0];

            if (!encontrado) { return null; }

            var datos = {
                usuario: encontrado.usuario,
                email: encontrado.email || '',
                nombre: encontrado.nombre,
                rol: encontrado.rol,
                perfil: encontrado.perfil || 'admin',
                iniciales: encontrado.iniciales,
                inicio: new Date().toISOString()
            };
            try {
                (recordar ? window.localStorage : window.sessionStorage)
                    .setItem(CLAVE_SESION, JSON.stringify(datos));
            } catch (e) { /* almacenamiento no disponible */ }
            return datos;
        },

        salir: function () {
            try {
                window.localStorage.removeItem(CLAVE_SESION);
                window.sessionStorage.removeItem(CLAVE_SESION);
            } catch (e) { /* almacenamiento no disponible */ }
        },

        esAdmin: function () {
            var s = sesion();
            return !!(s && s.perfil === 'admin');
        },

        esAutor: function () {
            var s = sesion();
            return !!(s && s.perfil === 'autor');
        },

        // Llamar desde el <head> de las páginas protegidas: si no hay sesión,
        // manda al login antes de que se pinte el contenido. Con el parámetro
        // 'admin' además exige perfil de administrador.
        requerirSesion: function (perfil) {
            var s = sesion();
            var pagina = window.location.pathname.split('/').pop() || 'index.html';

            if (!s) {
                window.location.replace('login.html?redirect=' + encodeURIComponent(pagina + window.location.search));
                return false;
            }
            if (perfil && s.perfil !== perfil) {
                window.location.replace('login.html?motivo=perfil&redirect=' + encodeURIComponent(pagina));
                return false;
            }
            return true;
        }
    };

    window.PEGASSO_AUTH = AUTH;

    // ------------------------------------------------------------------
    // Enlace de sesión en el menú de navegación (se agrega en toda página
    // que incluya este archivo).
    // ------------------------------------------------------------------
    function pintarMenu() {
        var nav = document.querySelector('.navbar-nav');
        if (!nav || nav.querySelector('[data-auth-item]')) { return; }

        var s = sesion();
        var html;

        if (s) {
            var accesos = s.perfil === 'admin'
                ? '<a href="manuscritos.html" class="dropdown-item">Panel de manuscritos</a>' +
                  '<a href="reportes.html" class="dropdown-item">Reportes de ventas</a>' +
                  '<a href="eventos.html" class="dropdown-item">Eventos y asistencia</a>' +
                  '<a href="citas.html" class="dropdown-item">Solicitudes de cita</a>'
                : '<a href="manuscritos.html" class="dropdown-item">Enviar manuscrito</a>' +
                  '<a href="eventos.html" class="dropdown-item">Eventos y mi asistencia</a>' +
                  '<a href="citas.html" class="dropdown-item">Agendar una cita</a>';

            html = '' +
                '<div class="nav-item dropdown" data-auth-item>' +
                '  <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">' +
                '    <i class="fa fa-user-circle text-primary mr-1"></i>' + s.nombre +
                '  </a>' +
                '  <div class="dropdown-menu dropdown-menu-right border-0 rounded-0 m-0">' +
                '    <span class="dropdown-item-text small text-muted">' + s.rol + '</span>' +
                '    <div class="dropdown-divider"></div>' +
                accesos +
                '    <a href="#" class="dropdown-item text-danger" data-salir>Cerrar sesión</a>' +
                '  </div>' +
                '</div>';
        } else {
            html = '<a href="login.html" class="nav-item nav-link" data-auth-item>' +
                '<i class="fa fa-lock text-primary mr-1"></i>Acceder</a>' +
                '<a href="registro.html" class="nav-item nav-link" data-auth-registro>' +
                '<i class="fa fa-user-plus text-primary mr-1"></i>Registrarse</a>';
        }

        nav.insertAdjacentHTML('beforeend', html);

        var salir = nav.querySelector('[data-salir]');
        if (salir) {
            salir.addEventListener('click', function (ev) {
                ev.preventDefault();
                AUTH.salir();
                var pagina = window.location.pathname.split('/').pop() || 'index.html';
                window.location.href = PAGINAS_PROTEGIDAS.indexOf(pagina) !== -1 ? 'login.html' : pagina;
            });
        }

        // Marca con candado los accesos internos cuando no hay sesión de administrador.
        if (!s || s.perfil !== 'admin') {
            Array.prototype.forEach.call(document.querySelectorAll('.dropdown-item'), function (item) {
                var destino = (item.getAttribute('href') || '').split('?')[0];
                if (PAGINAS_PROTEGIDAS.indexOf(destino) !== -1 && !item.querySelector('.fa-lock')) {
                    item.insertAdjacentHTML('beforeend', ' <i class="fa fa-lock text-muted small ml-1"></i>');
                }
            });
        }
    }

    AUTH.pintarMenu = pintarMenu;
    document.addEventListener('DOMContentLoaded', pintarMenu);

})(window);
