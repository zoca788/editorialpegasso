/* ==========================================================================
   PEGASSO Editorial - Menú y pie de página compartidos
   --------------------------------------------------------------------------
   Las páginas nuevas colocan <div id="pegasso-navbar"></div> y
   <div id="pegasso-footer"></div>, e indican cuál es la sección activa con
   <body data-pagina="catalogo">. En las páginas que ya traen su menú escrito
   a mano, este archivo solo agrega los accesos que falten.
   ========================================================================== */
(function (window, document) {
    "use strict";

    var ENLACES = [
        { id: 'index', href: 'index.html', texto: 'Inicio' },
        { id: 'educativo', href: 'educativo.html', texto: 'Educativo' },
        { id: 'religioso', href: 'religioso.html', texto: 'Religioso' },
        { id: 'catalogo', href: 'catalogo.html', texto: 'Catálogo' }
    ];

    // Accesos del desplegable "Editorial".
    var INTERNOS = [
        { id: 'manuscritos', href: 'manuscritos.html', texto: 'Manuscritos' },
        { id: 'publicar', href: 'publicar.html', texto: 'Publicar libro digital' },
        { id: 'reportes', href: 'reportes.html', texto: 'Reportes de ventas' },
        { id: 'notificaciones', href: 'notificaciones.html', texto: 'Notificaciones', badge: true },
        { id: 'eventos', href: 'eventos.html', texto: 'Eventos y asistencia' },
        { id: 'citas', href: 'citas.html', texto: 'Solicitar cita' }
    ];

    var FINALES = [
        { id: 'about', href: 'about.html', texto: 'Acerca de' },
        { id: 'contact', href: 'contact.html', texto: 'Contacto' }
    ];

    function navbar(activa) {
        function enlace(e) {
            return '<a href="' + e.href + '" class="nav-item nav-link' +
                (e.id === activa ? ' active' : '') + '">' + e.texto + '</a>';
        }
        var internoActivo = INTERNOS.some(function (e) { return e.id === activa; });

        return '' +
            '<div class="container-fluid bg-light position-relative shadow">' +
            '  <nav class="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0 px-lg-5">' +
            '    <a href="index.html" class="navbar-brand font-weight-bold text-secondary" style="font-size: 50px;">' +
            '      <img src="LOGO.png" alt="Logo" class="img-fluid" style="max-height: 120px;">' +
            '    </a>' +
            '    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">' +
            '      <span class="navbar-toggler-icon"></span>' +
            '    </button>' +
            '    <div class="collapse navbar-collapse justify-content-between" id="navbarCollapse">' +
            '      <div class="navbar-nav font-weight-bold mx-auto py-0">' +
            ENLACES.map(enlace).join('') +
            '        <div class="nav-item dropdown">' +
            '          <a href="#" class="nav-link dropdown-toggle' + (internoActivo ? ' active' : '') + '" data-toggle="dropdown">Editorial</a>' +
            '          <div class="dropdown-menu border-0 rounded-0 m-0">' +
            INTERNOS.map(function (e) {
                return '<a href="' + e.href + '" class="dropdown-item' + (e.id === activa ? ' active' : '') + '">' +
                    e.texto + (e.badge ? ' <span class="badge badge-primary ml-1" data-notif-badge>0</span>' : '') + '</a>';
            }).join('') +
            '          </div>' +
            '        </div>' +
            FINALES.map(enlace).join('') +
            '      </div>' +
            '    </div>' +
            '  </nav>' +
            '</div>';
    }

    function footer() {
        return '' +
            '<div class="container-fluid bg-secondary text-white mt-5 py-5 px-sm-3 px-md-5">' +
            '  <div class="row pt-5">' +
            '    <div class="col-lg-4 col-md-6 mb-5">' +
            '      <a href="index.html" class="navbar-brand font-weight-bold text-primary m-0 mb-4 p-0" style="font-size: 40px; line-height: 40px;">' +
            '        <i class="flaticon-032-book"></i><span class="text-white">PEGASSO</span></a>' +
            '      <p>PEGASSO Editorial se dedica a la publicación de obras literarias de calidad. Desde novelas hasta ensayos, conectamos autores con lectores apasionados por la literatura en todo el mundo.</p>' +
            '    </div>' +
            '    <div class="col-lg-4 col-md-6 mb-5">' +
            '      <h3 class="text-primary mb-4">Sistema Editorial</h3>' +
            '      <div class="d-flex flex-column justify-content-start">' +
            '        <a class="text-white mb-2" href="catalogo.html"><i class="fa fa-angle-right mr-2"></i>Catálogo digital</a>' +
            '        <a class="text-white mb-2" href="manuscritos.html"><i class="fa fa-angle-right mr-2"></i>Enviar manuscrito</a>' +
            '        <a class="text-white mb-2" href="registro.html"><i class="fa fa-angle-right mr-2"></i>Registro de autores</a>' +
            '        <a class="text-white mb-2" href="eventos.html"><i class="fa fa-angle-right mr-2"></i>Eventos y talleres</a>' +
            '        <a class="text-white" href="citas.html"><i class="fa fa-angle-right mr-2"></i>Solicitar una cita</a>' +
            '      </div>' +
            '    </div>' +
            '    <div class="col-lg-4 col-md-6 mb-5">' +
            '      <h3 class="text-primary mb-4">Contacto</h3>' +
            '      <div class="d-flex"><h4 class="fa fa-envelope text-primary"></h4>' +
            '        <div class="pl-3"><h5 class="text-white">Email</h5><p>dir.gral.pegasso@gmail.com</p></div></div>' +
            '      <div class="d-flex"><h4 class="fa fa-phone-alt text-primary"></h4>' +
            '        <div class="pl-3"><h5 class="text-white">Teléfono</h5><p>+52 222 755 6588</p></div></div>' +
            '    </div>' +
            '  </div>' +
            '  <div class="container-fluid pt-5" style="border-top: 1px solid rgba(23, 162, 184, .2);">' +
            '    <p class="m-0 text-center text-white">&copy; <a class="text-primary font-weight-bold" href="#">PEGASSO Editorial</a>. All Rights Reserved.</p>' +
            '  </div>' +
            '</div>';
    }

    // En las páginas que ya tienen su menú escrito, solo se agregan los
    // accesos nuevos para que todas ofrezcan lo mismo.
    function completarMenuExistente() {
        var menu = document.querySelector('.navbar-nav .dropdown-menu');
        if (!menu) { return; }
        INTERNOS.forEach(function (e) {
            if (menu.querySelector('a[href="' + e.href + '"]')) { return; }
            menu.insertAdjacentHTML('beforeend',
                '<a href="' + e.href + '" class="dropdown-item">' + e.texto + '</a>');
        });
    }

    function render() {
        var activa = document.body.getAttribute('data-pagina') || '';
        var slotNav = document.getElementById('pegasso-navbar');
        var slotPie = document.getElementById('pegasso-footer');

        if (slotNav) { slotNav.innerHTML = navbar(activa); } else { completarMenuExistente(); }
        if (slotPie) { slotPie.innerHTML = footer(); }

        // El menú de sesión se pinta después de que existe la barra.
        if (window.PEGASSO_AUTH && window.PEGASSO_AUTH.pintarMenu) {
            window.PEGASSO_AUTH.pintarMenu();
        }
        if (window.PEGASSO) {
            var badge = document.querySelector('[data-notif-badge]');
            if (badge) {
                var n = window.PEGASSO.noLeidas();
                badge.textContent = n;
                badge.style.display = n ? 'inline-block' : 'none';
            }
        }
    }

    window.PEGASSO_LAYOUT = { navbar: navbar, footer: footer, render: render };

    document.addEventListener('DOMContentLoaded', render);

})(window, document);
