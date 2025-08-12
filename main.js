/*librerías necesarias*/
let facturas = [];
let productosActuales = [];
let contadorFactura = 1;

const formFactura = document.getElementById('formFactura');
const clienteInput = document.getElementById('cliente');
const descripcionInput = document.getElementById('descripcion');
const precioNetoInput = document.getElementById('precioNeto');
const ivaInput = document.getElementById('iva');
const cuotasInput = document.getElementById('cuotas');
const agregarProdBtn = document.getElementById('agregarProd');
const limpiarProdBtn = document.getElementById('limpiarProd');
const listaProductos = document.getElementById('listaProductos');
const totalFacturaDiv = document.getElementById('totalFactura');
const totalIVAdiv = document.getElementById('totalIVA');
const tablaFacturas = document.getElementById('tablaFacturas');
const numFacturaInput = document.getElementById('numFactura');
const fechaFacturaInput = document.getElementById('fechaFactura');
const crearFacturaBtn = document.getElementById('crearFacturaBtn');
const mensajeExito = document.getElementById('mensajeExito');
const observacionesInput = document.getElementById('observaciones');
const cantidadProdDiv = document.getElementById('cantidadProd');

// Inicializar contador de factura desde el localStorage
function formatCurrency(value) {
    return Number(value).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function setFacturaInfo() {
    numFacturaInput.value = String(contadorFactura).padStart(5, "0");
    fechaFacturaInput.value = new Date().toISOString().slice(0,10);
}
setFacturaInfo();

function actualizarEstadoBoton() {
    crearFacturaBtn.disabled = !(clienteInput.value.trim() && productosActuales.length > 0);
}

function actualizarCantidadProd() {
    cantidadProdDiv.innerHTML = productosActuales.length === 0 ?
        "" : `Productos agregados: <b>${productosActuales.length}</b>`;
}

function actualizarTotalIVA() {
    let ivaTotal = productosActuales.reduce((acc, p) => acc + (p.precio * (p.iva / 100)) * p.cuotas, 0);
    totalIVAdiv.innerHTML = productosActuales.length
        ? `IVA/Intereses total: <b>${formatCurrency(ivaTotal)}</b>`
        : '';
}

agregarProdBtn.addEventListener('click', () => agregarProducto());
descripcionInput.addEventListener('keydown', handleEnterAdd);
precioNetoInput.addEventListener('keydown', handleEnterAdd);
ivaInput.addEventListener('keydown', handleEnterAdd);
cuotasInput.addEventListener('keydown', handleEnterAdd);

function handleEnterAdd(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        agregarProducto();
    }
}

function agregarProducto() {
    const desc = descripcionInput.value.trim();
    const precio = parseFloat(precioNetoInput.value.replace(',', '.'));
    const iva = parseFloat(ivaInput.value.replace(',', '.'));
    const cuotas = parseInt(cuotasInput.value, 10);

    if (!desc || isNaN(precio) || isNaN(iva) || isNaN(cuotas) || precio < 0 || iva < 0 || cuotas < 1) {
        agregarProdBtn.blur();
        agregarProdBtn.style.background = "#c0392b";
        setTimeout(() => agregarProdBtn.style.background = "#ffdc00", 700);
        return;
    }

    const ivaMonto = (precio * iva / 100);
    const total = (precio + ivaMonto) * cuotas;
    productosActuales.push({ desc, precio, iva, cuotas, total });
    renderListaProductos();
    descripcionInput.value = '';
    precioNetoInput.value = '';
    ivaInput.value = '';
    cuotasInput.value = 1;
    descripcionInput.focus();
    actualizarEstadoBoton();
    actualizarCantidadProd();
    actualizarTotalIVA();
}

limpiarProdBtn.addEventListener('click', () => {
    if (productosActuales.length === 0) return;
    if (confirm('¿Seguro que quieres limpiar todos los productos agregados?')) {
        productosActuales = [];
        renderListaProductos();
        actualizarEstadoBoton();
        actualizarCantidadProd();
        actualizarTotalIVA();
    }
});

function renderListaProductos() {
    listaProductos.innerHTML = '';
    productosActuales.forEach((p, idx) => {
        const li = document.createElement('li');
        li.className = idx % 2 === 1 ? 'zebra' : '';
        li.innerHTML = `
            <b>${p.desc}</b> | Neto: ${formatCurrency(p.precio)} | IVA: ${p.iva}% | Cuotas: ${p.cuotas} | Total: <b>${formatCurrency(p.total)}</b>
            <button type="button" onclick="confirmQuitarProducto(${idx})">Quitar</button>
        `;
        listaProductos.appendChild(li);
    });
    const totalFactura = productosActuales.reduce((acc, p) => acc + p.total, 0);
    totalFacturaDiv.innerHTML = productosActuales.length
        ? `<b>Total de la factura: ${formatCurrency(totalFactura)}</b>`
        : '';
    actualizarCantidadProd();
    actualizarTotalIVA();
}

window.confirmQuitarProducto = function(idx) {
    if (confirm('¿Seguro que deseas quitar este producto?')) {
        productosActuales.splice(idx, 1);
        renderListaProductos();
        actualizarEstadoBoton();
        actualizarCantidadProd();
        actualizarTotalIVA();
    }
};

clienteInput.addEventListener('input', () => {
    actualizarEstadoBoton();
});

formFactura.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!clienteInput.value.trim() || productosActuales.length === 0) {
        alert('Completa cliente y al menos un producto/servicio');
        return;
    }
    const totalFactura = productosActuales.reduce((sum, p) => sum + p.total, 0);
    const factura = {
        numero: numFacturaInput.value,
        fecha: fechaFacturaInput.value,
        cliente: clienteInput.value.trim(),
        productos: [...productosActuales],
        observaciones: observacionesInput.value.trim(),
        total: totalFactura
    };
    facturas.push(factura);
    contadorFactura++;
    productosActuales = [];
    formFactura.reset();
    setFacturaInfo();
    renderListaProductos();
    renderFacturas();
    totalFacturaDiv.innerHTML = '';
    mensajeExito.innerText = "¡Factura creada exitosamente!";
    mensajeExito.style.display = "block";
    setTimeout(() => mensajeExito.style.display = "none", 2500);
    actualizarEstadoBoton();
    actualizarCantidadProd();
    actualizarTotalIVA();
    descripcionInput.focus();
});

// --- MEJORA VISUAL DE LA TABLA DE PRODUCTOS Y NOTAS ---

function renderFacturas() {
    tablaFacturas.innerHTML = '';
    facturas.forEach((f, idx) => {
        // Renderiza cada producto como un bloque claro y legible
        const productosHtml = f.productos.map((p) =>
            `<div class="tabla-producto">
                <strong>${p.desc}</strong>
                <span class="detalle">Neto: ${formatCurrency(p.precio)}, IVA: ${p.iva}%, Cuotas: ${p.cuotas}</span>
                <span class="producto-total">Total: ${formatCurrency(p.total)}</span>
            </div>`
        ).join('');
        // Nota debajo
        const notaHtml = f.observaciones
            ? `<span class="tabla-nota">Notas: ${f.observaciones}</span>`
            : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${f.numero}</td>
            <td>${f.fecha}</td>
            <td>${f.cliente}</td>
            <td>${productosHtml}${notaHtml}</td>
            <td><b>${formatCurrency(f.total)}</b></td>
            <td>
                <button onclick="descargarPDF(${idx})">PDF</button>
            </td>
        `;
        tablaFacturas.appendChild(tr);
    });
}

// PDF con mejoras visuales y observaciones
window.descargarPDF = function(idx) {
    const { jsPDF } = window.jspdf;
    const f = facturas[idx];
    const doc = new jsPDF({
        unit: "pt",
        format: "letter"
    });

    const left = 48;
    let y = 64;

    // Título grande
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("FACTURA", left, y);

    // Número y fecha
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    y += 32;
    doc.text(`N°: ${f.numero}`, left, y);
    doc.text(`Fecha: ${f.fecha}`, left + 230, y);

    // Cliente
    y += 28;
    doc.text(`Cliente: ${f.cliente}`, left, y);

    // Encabezado tabla
    y += 36;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN", left, y);
    doc.text("CANT", 270, y);
    doc.text("VALOR", 330, y);
    doc.text("TOTAL", 430, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    y += 10;
    doc.setDrawColor(180);
    doc.line(left, y, 520, y);

    // Productos/servicios
    y += 22;
    let subtotal = 0;
    let ivaTotal = 0;
    let MAX_ITEMS_PER_PAGE = 15;
    f.productos.forEach((p, i) => {
        // Zebra lines for legibility
        if(i % 2 === 1) {
            doc.setFillColor(240,240,255);
            doc.rect(left, y-13, 500, 20, 'F');
        }
        const cantidad = p.cuotas ? p.cuotas.toString() : "1";
        const valor = formatCurrency(p.precio);
        const total = formatCurrency(p.total);
        doc.text(p.desc, left, y, { maxWidth: 210 });
        doc.text(cantidad, 270, y);
        doc.text(valor, 330, y);
        doc.text(total, 430, y);
        y += 22;
        subtotal += p.precio * p.cuotas;
        ivaTotal += (p.precio * (p.iva / 100)) * p.cuotas;
        // Si hay muchos productos, agrega aviso y termina la página
        if (i === MAX_ITEMS_PER_PAGE - 1 && f.productos.length > MAX_ITEMS_PER_PAGE) {
            doc.setFontSize(10);
            doc.text("Continúa en la página siguiente...", left, y);
            doc.addPage();
            y = 64;
        }
    });

    // Línea previa a totales
    y += 10;
    doc.setDrawColor(180);
    doc.line(left, y, 520, y);

    // Subtotal, IVA, Total
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SUBTOTAL", 330, y);
    doc.text(formatCurrency(subtotal), 430, y);

    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("IVA/Intereses", 330, y);
    doc.text(formatCurrency(ivaTotal), 430, y);

    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16); // TOTAL más grande!
    doc.text("TOTAL", 330, y);
    doc.text(formatCurrency(f.total), 430, y);

    // Observaciones/notas
    if (f.observaciones) {
        y += 32;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Notas:", left, y);
        doc.setFont("helvetica", "italic");
        doc.text(f.observaciones, left + 55, y, { maxWidth: 440 });
        doc.setFont("helvetica", "normal");
    }

    // --- Firma y cliente, ambos centrados verticalmente ---
    let signaturesY = y + 64;

    // Tu firma e info (izquierda)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Responsable:", left, signaturesY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Johan Sebastián Tovar Méndez", left, signaturesY + 16);
    doc.text("CC 1015483764", left, signaturesY + 30);
    doc.text("Teléfono 3134464310", left, signaturesY + 44);

    // Línea y texto para firma del cliente (derecha)
    const clientSignX = 330;
    doc.setDrawColor(140);
    doc.line(clientSignX, signaturesY + 38, clientSignX + 200, signaturesY + 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Firma del cliente", clientSignX + 60, signaturesY + 52);

    // --- Marca de agua pequeña y abajo ---
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    doc.saveGraphicsState();
    doc.setFont("helvetica", "bold");
    doc.text(
        "designed by Roco Solutions", 
        306, 770,
        { angle: 0, opacity: 0.18, align: "center" }
    );
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);

    // Pie de página
    doc.setFontSize(9);
    doc.text("Este documento es válido sin firma digital.", left, 800);

    doc.save(`factura_${idx + 1}.pdf`);
};

renderFacturas();
