/* ─────────────────────────────────────────────────────────
   Boyate — script.js
   Funciones:
     1. Menú móvil (hamburguesa + drawer)
     2. Reveal on scroll
     3. Carrito de compras
     4. Toggle domicilio/recogida
     5. Formulario → WhatsApp
   ───────────────────────────────────────────────────────── */

(() => {
  'use strict';

  /* ── 1. MENÚ MÓVIL ──────────────────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const navDrawer  = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');

  function openDrawer() {
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('open');
    navOverlay.classList.add('open');
    navDrawer.removeAttribute('aria-hidden');
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
  }

  function closeDrawer() {
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('open');
    navOverlay.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = '';
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
    document.body.style.overflowX = '';
  }

  menuToggle.addEventListener('click', () => {
    navDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  navOverlay.addEventListener('click', closeDrawer);
  navDrawer.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) closeDrawer();
  });


  /* ── 2. REVEAL ON SCROLL ────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ── 3. CARRITO ─────────────────────────────────────────── */
  const cart = {};
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');

  function cartKey(name, size) {
    return name + '__' + size;
  }

  function fmtPrice(n) {
    return '$' + n.toLocaleString('es-CO');
  }

  function renderCart() {
    const keys = Object.keys(cart);

    if (keys.length === 0) {
      cartItemsEl.innerHTML = '<p class="empty-cart">Agrega productos con los botones del menu.</p>';
      cartTotalEl.textContent = '$0';
      return;
    }

    let total = 0;
    cartItemsEl.innerHTML = '';

    keys.forEach(function(k) {
      var item     = cart[k];
      var subtotal = item.unitPrice * item.qty;
      total += subtotal;
      var sizeLabel = (item.size === 'U') ? '' : ' (' + item.size + ')';

      var line = document.createElement('div');
      line.className = 'cart-line';
      line.innerHTML =
        '<div class="cart-line-info">' +
          '<strong>' + item.name + sizeLabel + '</strong>' +
          '<span>' + item.qty + ' x ' + fmtPrice(item.unitPrice) + '</span>' +
        '</div>' +
        '<b>' + fmtPrice(subtotal) + '</b>';
      cartItemsEl.appendChild(line);
    });

    cartTotalEl.textContent = fmtPrice(total);
  }

  function setCartItem(name, size, unitPrice, qty) {
    var k = cartKey(name, size);
    if (qty <= 0) {
      delete cart[k];
    } else {
      cart[k] = { name: name, size: size, unitPrice: unitPrice, qty: qty };
    }
    renderCart();
  }

  function bindItemControls(menuItem) {
    var name      = menuItem.dataset.name;
    var prices    = JSON.parse(menuItem.dataset.prices || '{}');
    var minusBtn  = menuItem.querySelector('.qty-minus');
    var plusBtn   = menuItem.querySelector('.qty-plus');
    var valueEl   = menuItem.querySelector('.quantity-value');
    var sizeSelect = menuItem.querySelector('.size-select');

    if (!minusBtn || !plusBtn || !valueEl) return;

    var qty = 0;

    function currentSize() {
      if (sizeSelect) return sizeSelect.value;
      return Object.keys(prices)[0] || 'U';
    }

    function currentPrice() {
      return prices[currentSize()] || Object.values(prices)[0] || 0;
    }

    function update() {
      valueEl.textContent = qty;
      setCartItem(name, currentSize(), currentPrice(), qty);
    }

    plusBtn.addEventListener('click', function() { qty++; update(); });
    minusBtn.addEventListener('click', function() { if (qty > 0) { qty--; update(); } });
    if (sizeSelect) {
      sizeSelect.addEventListener('change', function() { if (qty > 0) update(); });
    }
  }

  document.querySelectorAll('.menu-item[data-name]').forEach(bindItemControls);


  /* ── 4. TOGGLE DOMICILIO / RECOGIDA ──────────────────────── */
  var serviceRadios  = document.querySelectorAll('input[name="serviceType"]');
  var deliveryFields = document.querySelectorAll('.delivery-field');

  function updateDeliveryFields() {
    var val  = document.querySelector('input[name="serviceType"]:checked');
    var hide = val && val.value === 'Recogida';
    deliveryFields.forEach(function(f) {
      f.classList.toggle('is-hidden', hide);
    });
  }

  serviceRadios.forEach(function(r) { r.addEventListener('change', updateDeliveryFields); });
  updateDeliveryFields();


  /* ── 5. FORMULARIO → WHATSAPP ───────────────────────────── */
  var form      = document.getElementById('checkoutForm');
  var WA_NUMBER = '573133056850';

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var cartKeys = Object.keys(cart);
    if (cartKeys.length === 0) {
      alert('Tu pedido esta vacio. Agrega al menos un producto del menu.');
      return;
    }

    var serviceType = document.querySelector('input[name="serviceType"]:checked');
    serviceType = serviceType ? serviceType.value : 'Domicilio';

    var name      = document.getElementById('customerName').value.trim();
    var time      = document.getElementById('orderTime').value;
    var address   = document.getElementById('customerAddress').value.trim();
    var apartment = document.getElementById('customerApartment').value.trim();
    var notes     = document.getElementById('orderNotes').value.trim();

    if (!name) {
      document.getElementById('customerName').focus();
      alert('Por favor ingresa tu nombre.');
      return;
    }

    // Construir mensaje en texto plano (maxima compatibilidad WhatsApp)
    var lines = [];
    lines.push('🥤 *PEDIDO BOYATE*');
    lines.push('');

    var total = 0;
    cartKeys.forEach(function(k) {
      var item     = cart[k];
      var subtotal = item.unitPrice * item.qty;
      total += subtotal;
      var sizeLabel = (item.size === 'U') ? '' : ' (' + item.size + ')';
      lines.push('• ' + item.name + sizeLabel + ' x' + item.qty + ' = ' + fmtPrice(subtotal));
    });

    lines.push('');
    lines.push('💰 *Total: ' + fmtPrice(total) + '*');
    lines.push('');
    lines.push((serviceType === 'Domicilio' ? '🛵' : '🏠') + ' *Servicio:* ' + serviceType);

    if (serviceType === 'Domicilio') {
      var dir = address;
      if (apartment) dir += ' - ' + apartment;
      if (dir) lines.push('📍 *Dirección:* ' + dir);
    }

    if (name)  lines.push('👤 *Nombre:* ' + name);
    if (time)  lines.push('🕐 *Hora:* ' + time);
    if (notes) lines.push('📝 *Notas:* ' + notes);

    lines.push('');
    lines.push('👋 ¡Gracias!');

    var msg = lines.join('\n');
    window.open('https://api.whatsapp.com/send?phone=' + WA_NUMBER + '&text=' + encodeURIComponent(msg), '_blank');
  });

})();