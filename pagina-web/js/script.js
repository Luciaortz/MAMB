/* 
   MUSEO DE ARTE MODERNO DE BARRANQUILLA — MAMB
   
  */

/* ──  ESPERAR A QUE EL HTML ESTÉ LISTO*/

document.addEventListener('DOMContentLoaded', function() {

  /* ──  NAVBAR: SOMBRA AL HACER SCROLL ────────────────────── */
 
  var navbar = document.querySelector('.navbar');

  // Cada vez que el usuario hace scroll, revisamos qué tan lejos bajó
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      // Si bajó más de 50px, le agrega la clase "scrolled" (que activa la sombra)
      navbar.classList.add('scrolled');
    } else {
      // Si está arriba, quita la sombra
      navbar.classList.remove('scrolled');
    }
  });

  /* ──  MENÚ HAMBURGUESA (móvil) ──────────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });

    // Cerrar el menú cuando el usuario hace clic en un link
    var allNavLinks = navLinks.querySelectorAll('a');
    allNavLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
      });
    });
  }

  /* ──  TABS DE EXPOSICIONES ──────────────────────────────── */
  var expoTabs = document.querySelectorAll('.expo-tab');
  var expoPanels = document.querySelectorAll('.expo-panel');

  expoTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      expoTabs.forEach(function(t) { t.classList.remove('active'); });
      expoPanels.forEach(function(p) { p.classList.remove('active'); });

      // Activar el tab que se clickeó
      tab.classList.add('active');

      // El tab tiene un atributo data-tab que indica qué panel mostrar
      var targetId = tab.getAttribute('data-tab');
      var targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  /* ── SCROLL REVEAL (animación al hacer scroll) ─────────── */
  var revealElements = document.querySelectorAll('.reveal');

  // IntersectionObserver detecta cuando un elemento entra en la pantalla
  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        // Si el elemento es visible en pantalla
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Dejamos de observar ese elemento (ya no necesitamos animarlo)
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 } // Se activa cuando el 12% del elemento es visible
  );

  // Observar cada elemento
  revealElements.forEach(function(el) {
    observer.observe(el);
  });

  /* ──  SMOOTH SCROLL PARA LINKS INTERNOS ─────────────────── */
  // Cuando hacen clic en un link tipo "#seccion", hace scroll suave
  var internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevenir el salto brusco por defecto

      // Obtener el id de la sección destino
      var targetId = this.getAttribute('href').substring(1);
      var targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Calcular posición descontando la altura del navbar (70px)
        var offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });


  /* ──  BOTÓN FAB: MOSTRAR DESPUÉS DE 2 SEGUNDOS ──────────── */
  var fabBtn = document.querySelector('.fab-btn');
  if (fabBtn) {
    // Empieza oculto
    fabBtn.style.opacity = '0';
    fabBtn.style.transform = 'translateY(20px)';
    fabBtn.style.transition = 'opacity .4s ease, transform .4s ease';

    // Aparece suavemente después de 2 segundos
    setTimeout(function() {
      fabBtn.style.opacity = '1';
      fabBtn.style.transform = 'translateY(0)';
    }, 2000);
  }

  /* ──  FORMULARIO DE CONTACTO ─────────────────────────────── */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevenir recarga de página

      // Recopilar datos del formulario
      var nombre = document.getElementById('nombre').value;
      var email = document.getElementById('email').value;
      var mensaje = document.getElementById('mensaje').value;

      // Validación básica: verificar que los campos no estén vacíos
      if (!nombre || !email || !mensaje) {
        mostrarAlerta('Por favor completa todos los campos 😊', 'error');
        return;
      }

      // Validación de email: debe tener @ y un punto después
      if (!email.includes('@') || !email.includes('.')) {
        mostrarAlerta('Por favor ingresa un email válido 📧', 'error');
        return;
      }

      // Si todo está bien, mostrar mensaje de éxito
      mostrarAlerta('¡Mensaje enviado! Te contactaremos pronto 🎨', 'success');
      contactForm.reset(); // Limpiar el formulario
    });
  }

  /* ──  FUNCIÓN AUXILIAR: MOSTRAR ALERTA ─────────────────── */
  // Crea un toast (mensajito flotante) en la parte inferior
  function mostrarAlerta(mensaje, tipo) {
    // Crear el elemento del toast
    var toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = [
      'position: fixed',
      'bottom: 100px',
      'left: 50%',
      'transform: translateX(-50%) translateY(20px)',
      'background: ' + (tipo === 'success' ? '#B4B534' : '#E36888'),
      'color: white',
      'padding: 14px 28px',
      'border-radius: 40px',
      'font-family: Nunito, sans-serif',
      'font-size: 14px',
      'font-weight: 800',
      'box-shadow: 0 4px 20px rgba(0,0,0,.2)',
      'z-index: 9999',
      'opacity: 0',
      'transition: opacity .3s, transform .3s',
      'white-space: nowrap'
    ].join(';');

    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Quitar el toast después de 3 segundos
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      // Eliminarlo del DOM después de que desaparezca
      setTimeout(function() { document.body.removeChild(toast); }, 400);
    }, 3000);
  }

  /* ──  MARCAR LINK ACTIVO EN NAVBAR AL HACER SCROLL ─────── */
  // Detecta qué sección es visible y resalta su link en el navbar
  var sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function() {
    var scrollPos = window.scrollY + 100; // +100px de margen

    sections.forEach(function(section) {
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute('id');

      // Si el scroll está dentro de los límites de esta sección
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        // Quitar "active" de todos los links
        var allLinks = document.querySelectorAll('.nav-links a');
        allLinks.forEach(function(l) { l.style.background = ''; });

        // Resaltar el link que corresponde a esta sección
        var activeLink = document.querySelector('.nav-links a[href="#' + sectionId + '"]');
        if (activeLink) {
          activeLink.style.background = 'rgba(255,255,255,.2)';
        }
      }
    });
  });

  /* ──  ANIMACIÓN DE TARJETAS ARTISTAS AL HOVER ──────────── */
  // Efecto: el fondo del artista cambia al pasar el mouse
  var artistCards = document.querySelectorAll('.artist-card');

  artistCards.forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      // Cambiar color del badge al pasar el mouse
      var badge = card.querySelector('.artist-style-badge');
      if (badge) {
        badge.style.background = 'var(--tangerine)';
        badge.style.color = 'white';
      }
    });

    card.addEventListener('mouseleave', function() {
      var badge = card.querySelector('.artist-style-badge');
      if (badge) {
        badge.style.background = 'var(--tangerine-light)';
        badge.style.color = 'var(--tangerine)';
      }
    });
  });

}); 