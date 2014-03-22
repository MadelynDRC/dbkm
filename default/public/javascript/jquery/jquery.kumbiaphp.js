/**
 * KumbiaPHP web & app Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://wiki.kumbiaphp.com/Licencia
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@kumbiaphp.com so we can send you a copy immediately.
 *
 * Plugin para jQuery que incluye los callbacks basicos para los Helpers
 *
 * @copyright  Copyright (c) 2005-2014 Kumbia Team (http://www.kumbiaphp.com)
 * @license	http://wiki.kumbiaphp.com/Licencia	 New BSD License
 */

(function($) {
    /**
     * Objeto KumbiaPHP
     *
     */
    $.KumbiaPHP = {
        /**
         * Ruta al directorio public en el servidor
         *
         * @var String
         */
        publicPath : null,

        /**
         * Plugins cargados
         *
         * @var Array
         */
        plugin: [],

        /**
         * Muestra mensaje de confirmacion
         *
         * @param Object event
         */
        cConfirm: function(event) {
            event.preventDefault();
            var este        =$(this);
            var este_tmp    = this;
            var dialogo     = $("#modal_confirmar");
            var data_body   = este.attr('msg');
            var data_title  = este.attr('msg-title');
            if(data_title==undefined) {
                data_title = 'Mensaje de confirmación';
            }
            if ($("#modal_confirmar").size() > 0 ){
                dialogo.empty();
            } else {                
                dialogo = $('<div id="modal_confirmar" tabindex="-1" role="dialog" aria-labelledby="modal_confirmar" aria-hidden="true"></div>');
            }
            dialogo.addClass('modal fade');
            var cajon       = $('<div class="modal-dialog"></div>');
            var contenedor  = $('<div class="modal-content"></div>');
            var header      = $('<div><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h4 class="modal-title"><i class="icon-warning-sign" style="padding-right:5px; margin-top:5px;"></i>'+data_title+'</h4></div>').addClass('modal-header');
            var cuerpo      = (data_body!=undefined) ? $('<div><p>'+data_body+'</p></div>').addClass('modal-body') : $('<div><p>Está seguro de continuar con esta operación?</p></div>').addClass('modal-body');
            var footer      = $('<div></div>').addClass('modal-footer');

            contenedor.append(header);
            contenedor.append(cuerpo);
            contenedor.append(footer);                                                                                    
            cajon.append(contenedor);
            dialogo.append(cajon);

            if(este.hasClass('js-link')) {
                footer.append('<a class="btn btn-success js-link js-spinner" href="'+este.attr("href")+'">Aceptar</a>');
            } else {
                footer.append('<button class="btn btn-success">Aceptar</a>');
            }
            
            footer.append('<button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancelar</button>');
            $('.btn-success', dialogo).on('click',function(){
                dialogo.modal('hide')
                if(este.attr('on-confirm')!=undefined) {
                    fn = este.attr('on-confirm')+'(este)';
                    eval(fn);
                    return false;
                }
                if(!($(this).hasClass('js-link'))) {
                    document.location.href = este.attr('href');
                }
            });
            dialogo.modal();
            $('body').on('shown.bs.modal', '#modal_confirmar', function () {
                $('.btn-success', dialogo).focus();
            });
            
        },

        /**
         * Aplica un efecto a un elemento
         *
         * @param String fx
         */
        cFx: function(fx) {
            return function(event) {
                event.preventDefault();
                var este=$(this),
                    rel = $('#'+este.data('to'));
                rel[fx]();
            }
        },

        /**
         * Carga con AJAX
         *
         * @param Object event
         */
        cRemote: function(event) {
            
            event.preventDefault();
            var este = $(this);
            if(este.hasClass('no-ajax')) {
                if(este.attr('href') != '#' && este.attr('href') != '#/' && este.attr('href') != '#!/') {
                    location.href = ""+este.attr('href')+"";
                }
            }
            if(este.hasClass('no-load') || este.hasClass('js-confirm')) {
                return false;
            }
            var val = true;
            var capa        = (este.attr('data-to')!=undefined) ? este.attr('data-to') : 'shell-content';
            var spinner     = este.hasClass('js-spinner') ? true : false;
            var change_url  = este.hasClass('js-url') ? true : false;            
            var url         = este.attr('href');
            var before_load = este.attr('before-load');//Callback antes de enviar
            var after_load  = este.attr('after-load');//Callback después de enviar
            if(before_load!=null) {
                try { val = eval(before_load); } catch(e) { }
            }
            
            if(val) {                
                //@TODO Revisar la seguridad acá
                if(url!=$.KumbiaPHP.publicPath+'#' && url!=$.KumbiaPHP.publicPath+'#/' && url!='#' && url!='#/') {
                    options = { capa: capa, spinner: spinner, msg: true, url: url, change_url: change_url};
                    if($.kload(options)) {
                        if(after_load!=null) {
                            try { eval(after_load); } catch(e) { }
                        }
                    }
                }
            }
            
        },

        /**
         * Carga con AJAX y Confirmacion
         *
         * @param Object event
         */
        cRemoteConfirm: function(event) {
            var este=$(this), rel = $('#'+este.data('to'));
            event.preventDefault();
            if(confirm(este.data('msg'))) {
                rel.load(this.href);
            }
        },

        /**
         * Enviar formularios de manera asincronica, via POST
         * Y los carga en un contenedor
         */
        cFRemote: function(event){
            event.preventDefault();
            este = $(this);
            var button = $('[type=submit]', este);
            button.attr('disabled', 'disabled');
            var url = este.attr('action');
            var div = este.attr('data-to');
            $.post(url, este.serialize(), function(data, status){
                var capa = $('#'+div);
                capa.html(data);
                capa.hide();
                capa.show('slow');
                button.attr('disabled', null);
            });
        },

        /**
         * Carga con AJAX al cambiar select
         *
         * @param Object event
         */
        cUpdaterSelect: function(event) {
            var $t = $(this),$u= $('#' + $t.data('update'))
            url = $t.data('url');
            $u.empty();
            $.get(url, {'id':$t.val()}, function(d){
                for(i in d){
                    var a = $('<option />').text(d[i]).val(i);
                    $u.append(a);
                }
            }, 'json');
        },

        /**
         * Enlaza a las clases por defecto
         *
         */
        bind : function() {
            // Enlace y boton con confirmacion
            $("body").on('click', 'a.js-confirm, input.js-confirm', this.cConfirm);

            // Enlace ajax
            $("a.js-remote").on('click', this.cRemote);
            
            // Enlace ajax
            $("a.js-link").on('click', this.cRemote);

            // Enlace ajax con confirmacion
            $("a.js-remote-confirm").on('click', this.cRemoteConfirm);

            // Efecto show
            $("a.js-show").on('click', this.cFx('show'));

            // Efecto hide
            $("a.js-hide").on('click', this.cFx('hide'));

            // Efecto toggle
            $("a.js-toggle").on('click', this.cFx('toggle'));

            // Efecto fadeIn
            $("a.js-fade-in").on('click', this.cFx('fadeIn'));

            // Efecto fadeOut
            $("a.js-fade-out").on('click', this.cFx('fadeOut'));

            // Formulario ajax
            $("body").on('submit', "form.js-remote", this.cFRemote);

            // Lista desplegable que actualiza con ajax
            $("body").on('change', 'select.js-remote', this.cUpdaterSelect);
                        
            // Enlazar DatePicker
            $.KumbiaPHP.bindDatePicker();

        },

        /**
         * Implementa la autocarga de plugins, estos deben seguir
         * una convención para que pueda funcionar correctamente
         */
        autoload: function(){
            var elem = $("[class*='jp-']");
            $.each(elem, function(i, val){
                var este = $(this); //apunta al elemento con clase jp-*
                var classes = este.attr('class').split(' ');
                for (i in classes){
                    if(classes[i].substr(0, 3) == 'jp-'){
                        if($.inArray(classes[i].substr(3),$.KumbiaPHP.plugin) != -1)
                            continue;
                        $.KumbiaPHP.plugin.push(classes[i].substr(3))
                    }
                }
            });
            var head = $('head');
            for(i in $.KumbiaPHP.plugin){
                $.ajaxSetup({ cache: true});
                head.append('<link href="' + $.KumbiaPHP.publicPath + 'css/' + $.KumbiaPHP.plugin[i] + '.css" type="text/css" rel="stylesheet"/>');
                $.getScript($.KumbiaPHP.publicPath + 'javascript/jquery/jquery.' + $.KumbiaPHP.plugin[i] + '.js', function(data, text){});
            }
        },

        /**
         * Carga y Enlaza Unobstrusive DatePicker en caso de ser necesario
         *
         */
        bindDatePicker: function() {

            // Selecciona los campos input
            var inputs = $('div.datepicker');
            /**
             * Funcion encargada de enlazar el DatePicker a los Input
             */
            var bindInputs = function() {                               
                inputs.each(function() {                        
                    var input = $(this);
                    var opts = { language: 'es', pickTime: false };
                    // Verifica si hay mínimo
                    if(input.attr('min') != undefined) {
                        opts.startDate = input.attr('min');
                    }
                    // Verifica si hay máximo
                    if(input.attr('max') != undefined) {
                        opts.endDate = input.attr('max');
                    }
                    input.datetimepicker(opts);
                });                                
            }            
            // Si ya esta cargado el datetimepicker de bootstrap
            if(typeof($.datetimepicker) != "undefined") {
                return bindInputs();
            }            
            // Carga el datetimepicker, para poder usar cache
            $.ajax({ dataType: "script",cache: true, url: $.KumbiaPHP.publicPath + 'javascript/bootstrap/bootstrap-datetimepicker.min.js'}).done(function() {
                //Spanish translation for bootstrap-datetimepicker
                //Bruno Bonamin <bruno.bonamin@gmail.com>                
                (function($){
                    $.fn.datetimepicker.dates['es'] = {
                        days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
                        daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
                        daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
                        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                        monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                        today: "Hoy"
                    };
                }(jQuery)); 
                bindInputs();
            });            
            
        },

        /**
         * Inicializa el plugin
         *
         */
        initialize: function() {
            // Obtiene el publicPath, restando los caracteres que sobran
            // de la ruta, respecto a la ruta de ubicacion del plugin de KumbiaPHP
            // "javascript/jquery/jquery.kumbiaphp.js"
            var src = $('script:last').attr('src');
            this.publicPath = src.substr(0, src.length - 37);

            // Enlaza a las clases por defecto
            $(function(){
                $.KumbiaPHP.bind();
                $.KumbiaPHP.autoload();
            });
        }
    }

    // Inicializa el plugin
    $.KumbiaPHP.initialize();
})(jQuery);
