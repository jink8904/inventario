/**
 * Created by Julio on 03-Feb-16.
 */
$(document).ready(function () {
    updateFooter();
    $("#tabla-empresa").dynatable({
        params: {
            records: "empresas"
        }
    });
    $("#tabla-categoria").dynatable({
        params: {
            records: "categorias"
        }
    });
    $("#tabla-producto").dynatable({
        params: {
            records: "productos"
        }
    });
    $("#tabla-producto-inv").dynatable({
        params: {
            records: "productos"
        }
    });
    $("#tabla-proveedor").dynatable({
        params: {
            records: "proveedores"
        }
    });
    $("#tabla-cliente").dynatable({
        params: {
            records: "clientes"
        }
    });
    $("#tabla-ventas").dynatable({
        params: {
            records: "ventas"
        }
    });
    $("#tabla-compras").dynatable({
        params: {
            records: "compras"
        }
    });
    //Manejo global
    $("table[select=true]>tbody>tr").click(function (evt) {
        var id = $(this).parent().parent().attr("id");
        cleanData('table', id);
        var tr = $(this);
        tr.addClass('active');
        updateButtons(id);
    })


    //login
    $("form[role=login] button[type=submit]").click(function () {
        var usuario = $("form[role=login] input[name=username]").val();
        sessionStorage.setItem("usuario", usuario)
    })

    //empresa
    $("button[table=tabla-empresa][accion=add]").click(function () {
        cleanData("form", "tabla-empresa");
        $("#form-empresa-label").html("Adicionar empresa");
    })
    $("button[table=tabla-empresa][accion=mod]").click(function () {
        updateRecords("tabla-empresa");
        $("#form-empresa-label").html("Modificar empresa");
    })
    $("button[table=tabla-empresa][accion=del]").click(function () {
        var ruc = $("#tabla-empresa tr.active td[key=ruc]").html();
        $("form[accion=del] input[name=ruc]").val(ruc);
    })

    $("#sel-empresa").click(function () {
        selEmpresa();
    })

    //categoria
    $("button[table=tabla-categoria][accion=add]").click(function () {
        cleanData("form", "tabla-categoria");
        $("#form-empresa-label").html("Adicionar categor&iacute;a");
    })
    $("button[table=tabla-categoria][accion=mod]").click(function () {
        updateRecords("tabla-categoria");
        $("#form-empresa-label").html("Modificar categor&iacute;a");
    })
    $("button[table=tabla-categoria][accion=del]").click(function () {
        var codigo = $("#tabla-categoria tr.active td[key=codigo]").html();
        $("form[accion=del] input[name=codigo]").val(codigo);
    })

    //producto
    $("button[table=tabla-producto][accion=add]").click(function () {
        cleanData("form", "tabla-producto");
        $("#form-empresa-label").html("Adicionar producto");
    })
    $("button[table=tabla-producto][accion=mod]").click(function () {
        updateRecords("tabla-producto");
        $("#form-empresa-label").html("Modificar producto");
    })
    $("button[table=tabla-producto][accion=del]").click(function () {
        var codigo = $("#tabla-producto tr.active td[key=codigo]").html();
        $("form[accion=del] input[name=codigo]").val(codigo);
    })
    $("#id_unidad>option").click(function () {
        var abrv = $(this).attr("abrv");
        console.log(abrv);
        $("#id_abreviatura").val(abrv)
    })

    //inventario
    $("#tabla-producto-inv>tbody>tr").click(function () {
        updateRecords("tabla-producto-inv");
    });

    //proveedor
    $("button[table=tabla-proveedor][accion=add]").click(function () {
        cleanData("form", "tabla-proveedor");
        $("#form-empresa-label").html("Adicionar proveedor");
    })
    $("button[table=tabla-proveedor][accion=mod]").click(function () {
        updateRecords("tabla-proveedor");
        $("#form-empresa-label").html("Modificar proveedor");
    })
    $("button[table=tabla-proveedor][accion=del]").click(function () {
        var identificador = $("#tabla-proveedor tr.active td[key=no_identificacion]").html();
        $("form[accion=del] input[name=identificador]").val(identificador);
    })

    //cliente
    $("button[table=tabla-cliente][accion=add]").click(function () {
        cleanData("form", "tabla-cliente");
        $("#form-empresa-label").html("Adicionar cliente");
    })
    $("button[table=tabla-cliente][accion=mod]").click(function () {
        updateRecords("tabla-cliente");
        $("#form-empresa-label").html("Modificar cliente");
    })
    $("button[table=tabla-cliente][accion=del]").click(function () {
        var identificador = $("#tabla-cliente tr.active td[key=no_identificacion]").html();
        $("form[accion=del] input[name=identificador]").val(identificador);
    })

    //salida de mercancia
    $("#datos-producto-salida [name=codigo]>option").click(function () {
        var id = $(this).attr("value");
        var selector_id = "#datos-producto-salida";
        llenarDatosProducto(id, selector_id);
    })

    $("#datos-producto-salida input[name=cantidad], " +
        "#importes-unitarios-salida input[name=valor-unitario]").keypress(function (e) {
        if (e.which == 13)
            llenarDatosImportesVenta()
    })

    $("#add-detalle-venta").click(function () {
        addDetalleVenta()
    })

    $("#add-salida-merc").click(function () {
        addSalidaMercancia();
    })

    $("#datos-comprobante-salida [name=identificador]>option").click(function () {
        var value = $(this).val();
        $("#datos-comprobante-salida [name=nombre]").val(value);
    })

    $("#datos-comprobante-salida [name=nombre]>option").click(function () {
        var value = $(this).val();
        $("#datos-comprobante-salida [name=identificador]").val(value);
    })

    //ver detalle de venta
    $("#ver-detalle-venta").click(function () {
        verDetallesVenta();
    })

    //entrada de mercancia
    $("#datos-producto-entrada select[name=codigo]>option").click(function () {
        var id = $(this).attr("value");
        var selector_id = "#datos-producto-entrada";
        llenarDatosProducto(id, selector_id);
    })

    $("#datos-producto-entrada input[name=cantidad], " +
        "#importes-unitarios-entrada input[name=valor-unitario]").keypress(function (e) {
        //console.log(e.which)
        if (e.which == 13)
            llenarDatosImportesCompra()
    })

    $("#add-detalle-compra").click(function () {
        addDetalleCompra()
    })

    $("#add-entrada-merc").click(function () {
        addEntradaMercancia();
    })

    $("#datos-comprobante-entrada [name=identificador]>option").click(function () {
        var value = $(this).val();
        $("#datos-comprobante-entrada [name=nombre]").val(value);
    })

    $("#datos-comprobante-entrada [name=nombre]>option").click(function () {
        var value = $(this).val();
        $("#datos-comprobante-entrada [name=identificador]").val(value);
    })

    //ver detalle de compra
    $("#ver-detalle-compra").click(function () {
        verDetallesCompra();
    })

})