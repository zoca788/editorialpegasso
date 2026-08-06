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

    var USUARIOS = [
        {
            usuario: 'admin',
            clave: hash('123456'),
            nombre: 'Administrador',
            rol: 'Administrador editorial',
            iniciales: 'AD'
        }
    ];

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

        entrar: function (usuario, clave, recordar) {
            var encontrado = USUARIOS.filter(function (u) {
                return u.usuario === (usuario || '').trim().toLowerCase() && u.clave === hash(clave || '');
            })[0];

            if (!encontrado) { return null; }

            var datos = {
                usuario: encontrado.usuario,
                nombre: encontrado.nombre,
                rol: encontrado.rol,
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

        // Llamar desde el <head> de las páginas protegidas: si no hay sesión,
        // manda al login antes de que se pinte el contenido.
        requerirSesion: function () {
            if (AUTH.autenticado()) { return true; }
            var pagina = window.location.pathname.split('/').pop() || 'index.html';
            window.location.replace('login.html?redirect=' + encodeURIComponent(pagina + window.location.search));
            return false;
        }
    };

    window.PEGASSO_AUTH = AUTH;

    // ------------------------------------------------------------------
    // Enlace de sesión en el menú de navegación (se agrega en toda página
    // que incluya este archivo).
    // ------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        var nav = document.querySelector('.navbar-nav');
        if (!nav || nav.querySelector('[data-auth-item]')) { return; }

        var s = sesion();
        var html;

        if (s) {
            html = '' +
                '<div class="nav-item dropdown" data-auth-item>' +
                '  <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">' +
                '    <i class="fa fa-user-circle text-primary mr-1"></i>' + s.nombre +
                '  </a>' +
                '  <div class="dropdown-menu dropdown-menu-right border-0 rounded-0 m-0">' +
                '    <span class="dropdown-item-text small text-muted">' + s.rol + '</span>' +
                '    <div class="dropdown-divider"></div>' +
                '    <a href="manuscritos.html" class="dropdown-item">Panel de manuscritos</a>' +
                '    <a href="reportes.html" class="dropdown-item">Reportes de ventas</a>' +
                '    <a href="#" class="dropdown-item text-danger" data-salir>Cerrar sesión</a>' +
                '  </div>' +
                '</div>';
        } else {
            html = '<a href="login.html" class="nav-item nav-link" data-auth-item>' +
                '<i class="fa fa-lock text-primary mr-1"></i>Acceder</a>';
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

        // Oculta los accesos internos del menú cuando no hay sesión iniciada.
        if (!s) {
            Array.prototype.forEach.call(document.querySelectorAll('.dropdown-item'), function (item) {
                var destino = (item.getAttribute('href') || '').split('?')[0];
                if (PAGINAS_PROTEGIDAS.indexOf(destino) !== -1) {
                    item.insertAdjacentHTML('beforeend', ' <i class="fa fa-lock text-muted small ml-1"></i>');
                }
            });
        }
    });

})(window);
