/**
 * Created by Julio on 08-Feb-16.
 */
//variables
var empresa_seleccionada = null;

//funciones

var getRecord = function (table_id) {
    var record = {};
    $("#" + table_id + " tr.active > td").each(function (index, th) {
        var key = checkKey($(this).attr("key"));
        record[key] = $(this).html()
    });
    return record;
}

var cleanData = function (tipo, id, callback) {
    switch (tipo) {
        case "table":
            $("#" + id + ">tbody>tr").each(function (index, th) {
                $(this).removeClass('active');
            })
            break;
        case "form":
            var sel = "form[table=" + id + "] input[type!=hidden], form[table=" + id + "] select";
            $(sel).each(function (index, th) {
                $(this).val("");
            })
            break;
        case "select":
            $("#" + id + ">option").attr("selected", false);
            if (callback)
                callback();
            break;
    }
}

var checkKey = function (key) {
    switch (key) {
        case "#":
            return "id"
            break;
        case "no_identificacion":
            return "identificador"
            break;
        case "tipo_de_identificacion":
            return "tipo_id"
            break;
    }
    return key;
}

var updateRecords = function (table_id) {
    var record = getRecord(table_id)
    var sel_form = "form[table=" + table_id + "] ";
    //Selecciono el formulario asociado a la tabla pare llenar los campos
    $(sel_form + "input").each(function () {
        var name = $(this).attr("name");
        if (record[name]) {
            $(this).val(record[name]);
        }
    })
    $(sel_form + "select").each(function () {
        var name = $(this).attr("name");
        var record_id = name + "_id";
        var select_id = $(this).attr("id");
        cleanData("select", $(this).attr("id"), function () {
            $("#" + select_id + ">option[value=" + record[record_id] + "]").attr("selected", true);
        })
    })
}

var updateButtons = function (table_id) {
    var sel_btns = "button[table=" + table_id + "][accion!=add]";
    $(sel_btns).removeClass("disabled");
}

var selEmpresa = function () {
    empresa_seleccionada = getRecord("tabla-empresa");
    sessionStorage.setItem("empresa", JSON.stringify(empresa_seleccionada));

    token = $("#navtb-empresa input[name=csrfmiddlewaretoken]").attr("value");
    $.ajax({
        url: "../select-empresa",
        method: "post",
        dataType: 'json',
        async: true,
        data: {
            csrfmiddlewaretoken: token,
            empresa: empresa_seleccionada
        },
        success: function (data) {
            $(location).attr("href", "../");
        }
    })

}

var updateFooter = function () {
    var empresa = $.parseJSON(sessionStorage.getItem("empresa"));
    var usuario = sessionStorage.getItem("usuario");
    if (empresa)
        $("#empresa a").html("   " + empresa.nombre);
    if (usuario)
        $("#usuario a").html("   " + usuario);
}


var cambiarComillas = function (obj) {
    var result = '';
    for (var i = 0; i < obj.length; i++) {
        c = obj.charAt(i);
        if (c == "'")
            result += '"'
        else
            result += c;
    }
    return result;
}

var llenarDatosProducto = function (id, selector_id) {
    var productos = $('span[productos]').attr('productos');
    var str = cambiarComillas(productos);
    productos = $.parseJSON(str);
    for (var i in productos) {
        var producto = productos[i]
        if (producto.id == id) {
            $(selector_id + " input[name=producto]").val(producto.nombre)
            $(selector_id + " input[name=stock]").val(producto.stock)
        }
    }

}

detalle_venta_actual = {}
var llenarDatosImportesVenta = function () {
    var cant = $("#datos-producto-salida input[name=cantidad]").val(),
        igv = $("#datos-producto-salida input[name=igv]").val(),
        valor_unitario = $("#importes-unitarios-salida input[name=valor-unitario]").val(),
        igv_unitario = igv * cant,
        precio_unitario = igv_unitario + parseInt(valor_unitario),
        valor_venta = cant * valor_unitario,
        igv_total = cant * igv_unitario,
        precio_venta = valor_venta + igv_total;

    detalle_venta_actual = {
        cant: parseInt(cant),
        valor_unitario: parseInt(valor_unitario),
        igv: parseInt(igv),
        igv_unitario: igv_unitario,
        precio_unitario: precio_unitario,
        valor_venta: valor_venta,
        igv_total: igv_total,
        precio_venta: precio_venta
    }
    if (!cant || !valor_unitario)
        alert("Los campos cantidad y valor unitario no deben estar vacios");
    else {
        $("#importes-unitarios-salida input[name=igv-unitario]").val(igv_unitario);
        $("#importes-unitarios-salida input[name=precio-unitario]").val(precio_unitario);
        $(" #importes-totales-salida input[name=valor-venta]").val(valor_venta);
        $("#importes-totales-salida input[name=igv-total]").val(igv_total);
        $("#importes-totales-salida input[name=precio-venta]").val(precio_venta);
    }
}

detalle_venta_list = {};
var addDetalleVenta = function () {
    var prod_id = $("#datos-producto-salida [name=codigo]").val();
    var codigo = $("#datos-producto-salida [name=codigo] option[value=" + prod_id + "]").html();
    detalle_venta_list[prod_id] = detalle_venta_actual;
    var det = '<tr>' +
        '<td name="producto">' + codigo + '</td>' +
        '<td name="codigo">' + $("#datos-producto-salida [name=producto]").val() + '</td>' +
        '<td name="cantidad">' + detalle_venta_actual.cant + '</td>' +
        '<td name="valor_unitario">' + detalle_venta_actual.valor_unitario + '</td>' +
        '<td name="valor_venta">' + detalle_venta_actual.valor_venta + '</td>' +
        '<td name="igv_total">' + detalle_venta_actual.igv_total + '</td>' +
        '<td name="precio_venta">' + detalle_venta_actual.precio_venta + '</td>' +
        '</tr>'
    $("#tabla-detalle-venta").removeClass("hidden");
    $(det).appendTo("#tabla-detalle-venta>tbody");

}

var addSalidaMercancia = function () {
    datos_venta = {
        tipo_comprobante: $("#datos-comprobante-salida [name=tipo-comprobante]").val(),
        fecha: $("#datos-comprobante-salida [name=fecha]").val(),
        serie: $("#datos-comprobante-salida [name=serie]").val(),
        numero: $("#datos-comprobante-salida [name=numero]").val(),
        cliente: $("#datos-comprobante-salida [name=identificador]").val(),
    }
    token = $("input[name=csrfmiddlewaretoken]").attr("value");
    $.ajax({
        url: "add",
        method: "post",
        dataType: 'json',
        async: true,
        data: {
            csrfmiddlewaretoken: token,
            detalle_venta_list: JSON.stringify(detalle_venta_list),
            datos_venta: JSON.stringify(datos_venta)
        },
        success: function (data) {
            $(location).attr("href", "/salida");
        }
    })
}

var verDetallesVenta = function () {
    var venta = getRecord("tabla-ventas");
    token = $("input[name=csrfmiddlewaretoken]").attr("value");
    $.ajax({
        url: "detalles",
        method: "post",
        dataType: 'json',
        async: true,
        data: {
            csrfmiddlewaretoken: token,
            id_venta: venta.id,
        },
        success: function (data) {
            //$(location).attr("href", "/salida");
            console.log(data);
            $("#tabla-d-venta-modal>tbody>tr").each(function (index, th) {
                $(th).remove();
            })
            detalle_list = data["d_list"]
            for (var i in detalle_list) {
                var detalle = detalle_list[i];
                var det = '<tr>' +
                    '<td name="codigo">' + detalle['codigo'] + '</td>' +
                    '<td name="descripcion">' + detalle['descripcion'] + '</td>' +
                    '<td name="cantidad">' + detalle['cantidad'] + '</td>' +
                    '<td name="valor_unitario">' + detalle['valor_unitario'] + '</td>' +
                    '<td name="valor_venta">' + detalle['valor_venta'] + '</td>' +
                    '<td name="igv">' + detalle['igv'] + '</td>' +
                    '<td name="importe">' + detalle['importe'] + '</td>' +
                    '</tr>';
                $(det).appendTo("#tabla-d-venta-modal>tbody")
            }
            $("#modal-detalles-venta").modal();
        }
    })
}

detalle_compra_actual = {}
var llenarDatosImportesCompra = function () {
    var cant = $("#datos-producto-entrada input[name=cantidad]").val(),
        igv = $("#datos-producto-entrada input[name=igv]").val(),
        valor_unitario = $("#importes-unitarios-entrada input[name=valor-unitario]").val(),
        igv_unitario = igv * cant,
        precio_unitario = igv_unitario + parseInt(valor_unitario),
        valor_compra = cant * valor_unitario,
        igv_total = cant * igv_unitario,
        precio_compra = valor_compra + igv_total;

    detalle_compra_actual = {
        cant: parseInt(cant),
        valor_unitario: parseInt(valor_unitario),
        igv: parseInt(igv),
        igv_unitario: igv_unitario,
        precio_unitario: precio_unitario,
        valor_compra: valor_compra,
        igv_total: igv_total,
        precio_compra: precio_compra
    }
    if (!cant || !valor_unitario)
        alert("Los campos cantidad y valor unitario no deben estar vacios");
    else {
        $("#importes-unitarios-entrada input[name=igv-unitario]").val(igv_unitario);
        $("#importes-unitarios-entrada input[name=precio-unitario]").val(precio_unitario);
        $(" #importes-totales-entrada input[name=valor-compra]").val(valor_compra);
        $("#importes-totales-entrada input[name=igv-total]").val(igv_total);
        $("#importes-totales-entrada input[name=precio-compra]").val(precio_compra);
    }
}

detalle_compra_list = {};
var addDetalleCompra = function () {
    var prod_id = $("#datos-producto-entrada [name=codigo]").val();
    var codigo = $("#datos-producto-entrada [name=codigo] option[value=" + prod_id + "]").html();
    detalle_compra_list[prod_id] = detalle_compra_actual;
    var det = '<tr>' +
        '<td name="producto">' + codigo + '</td>' +
        '<td name="codigo">' + $("#datos-producto-entrada [name=producto]").val() + '</td>' +
        '<td name="cantidad">' + detalle_compra_actual.cant + '</td>' +
        '<td name="valor_unitario">' + detalle_compra_actual.valor_unitario + '</td>' +
        '<td name="valor_compra">' + detalle_compra_actual.valor_compra + '</td>' +
        '<td name="igv_total">' + detalle_compra_actual.igv_total + '</td>' +
        '<td name="precio_compra">' + detalle_compra_actual.precio_compra + '</td>' +
        '</tr>'
    $("#tabla-detalle-compra").removeClass("hidden");
    $(det).appendTo("#tabla-detalle-compra>tbody");

}

var addEntradaMercancia = function () {
    datos_compra = {
        tipo_comprobante: $("#datos-comprobante-entrada [name=tipo-comprobante]").val(),
        fecha: $("#datos-comprobante-entrada [name=fecha]").val(),
        serie: $("#datos-comprobante-entrada [name=serie]").val(),
        numero: $("#datos-comprobante-entrada [name=numero]").val(),
        proveedor: $("#datos-comprobante-entrada [name=identificador]").val(),
    }
    token = $("input[name=csrfmiddlewaretoken]").attr("value");
    $.ajax({
        url: "add",
        method: "post",
        dataType: 'json',
        async: true,
        data: {
            csrfmiddlewaretoken: token,
            detalle_compra_list: JSON.stringify(detalle_compra_list),
            datos_compra: JSON.stringify(datos_compra)
        },
        success: function (data) {
            $(location).attr("href", "/entrada");
        }
    })
}

var verDetallesCompra = function () {
    var compra = getRecord("tabla-compras");
    console.log(compra);
    token = $("input[name=csrfmiddlewaretoken]").attr("value");
    $.ajax({
        url: "detalles",
        method: "post",
        dataType: 'json',
        async: true,
        data: {
            csrfmiddlewaretoken: token,
            id_compra: compra.id,
        },
        success: function (data) {
            //$(location).attr("href", "/entrada");
            console.log(data);
            $("#tabla-d-compra-modal>tbody>tr").each(function (index, th) {
                $(th).remove();
            })
            detalle_list = data["d_list"]
            for (var i in detalle_list) {
                var detalle = detalle_list[i];
                var det = '<tr>' +
                    '<td name="codigo">' + detalle['codigo'] + '</td>' +
                    '<td name="descripcion">' + detalle['descripcion'] + '</td>' +
                    '<td name="cantidad">' + detalle['cantidad'] + '</td>' +
                    '<td name="valor_unitario">' + detalle['valor_unitario'] + '</td>' +
                    '<td name="valor_venta">' + detalle['valor_venta'] + '</td>' +
                    '<td name="igv">' + detalle['igv'] + '</td>' +
                    '<td name="importe">' + detalle['importe'] + '</td>' +
                    '</tr>';
                $(det).appendTo("#tabla-d-compra-modal>tbody")
            }
            $("#modal-detalles-compra").modal();
        }
    })
}

