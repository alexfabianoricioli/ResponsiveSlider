;(function($) {
    $.fn.carousel = function(options) {
        var settings = $.extend({
            autoScroll: false,
            autoScrollTime: 6000,
            typeScroll: 'block',// single / block
            hoverPause: false,
            itemsToShow: 'auto',// integer or "auto"
            controlPosition: 'top',// top / inside / outside / outside-hover
            sliderImage: false,// center / full / responsive / false
            resposive: false,
            ajaxLoading: false,
            full: false,
            minWidthItems: 238,
            indicators: true
        }, options);

        return this.each(function() {
            var $this = $(this),
                $wrapper = $('.carousel-wrapper', $this),
                $slider  = $('.carousel-list', $wrapper),
                $items   = $('.carousel-item', $slider),

                $imgs    = $('img', $slider),
                $links   = $('a', $slider),

                visible = jQuery.isNumeric(settings.itemsToShow) ? settings.itemsToShow : Math.floor($this.width() / settings.minWidthItems),
                currentPage = 1,
                pages,
                primeiroItemPage,
                visibleReal = visible,
                sliderWidth,
                itemsWidth,
                pageLimit,
                timer,
                //===drag slide===//
                positionStart,
                positionAnterior,
                positionAtual,
                positionStop,
                deslocamentoTotal,
                htmlNewItems,
                varMouseOut = true;

            $items.css({'min-width': 'initial'});

            $this.off();//remove todos os eventos ja atribuidos (reseta os eventos antes de atribuir novamente)


            if (settings.full == true && $(this).closest('.products_slider') != 'undefined') {
              $(this).closest('.products_slider').addClass('carousel-full');
            }
//============================ INICIO - Responsivo FUTURA ============================//
            function responsivo() {

              if (settings.sliderImage == 'center') {
                if ($(window).width() < 1140) {
                  $('.carousel-container.slide-home').css('margin-top','0');
                } else {
                  $('.carousel-container.slide-home').css('margin-top','10px');
                }
              }

              if (!settings.sliderImage && $('.carousel-item', $slider).length >= currentPage * visibleReal) {
                $('.carousel-item:nth-of-type(1n+0)', $slider).css('border-right','1px solid #DDD');
              }

              //identifica o primeiro item da pagina antes da quebra
              if (settings.typeScroll == 'block' && visibleReal) {
                primeiroItemPage = ((visibleReal * (currentPage - 1)) + 1);
              }

              //muda a quantidade de itens visiveis de acordo com a tela
              if (settings.resposive) {
                visibleReal = Math.floor($this.width() / settings.minWidthItems);
                visibleReal = (visibleReal > 0) ? visibleReal : 1;
              }

              //marca a currentPage como a página que contem o primeiro item em exibição antes da quebra
              if (settings.typeScroll == 'block' && visibleReal) {
                currentPage = Math.ceil(primeiroItemPage / visibleReal);
              }

              calcula_larguras();
              addControlls();
            }

            responsivo();

            $(window).resize(function(){
              responsivo();
            });
//============================ FINAL - Responsivo FUTURA ============================//

            //Calcula as larguras do slider, dos items e define a página final
            function calcula_larguras() {
              if (settings.typeScroll == 'block') {
                /* Transição de um grupo de itens por vez */
                $items = $('.carousel-item', $slider);
                pages = Math.ceil($items.length / visibleReal);
                sliderWidth = pages * 100;
                itemsWidth = 100 / (visibleReal * pages);
                pageLimit = pages;//Define a ultima pagina a ser rolada antes do reinicio
              } else {
                /* Transição de um item por vez */
                pages = $items.length;
                sliderWidth = pages/visibleReal * 100;
                itemsWidth = 100 / pages;
                pageLimit = pages - visibleReal + 1;//Define o último item a ser rolado antes do reinicio
              }
              seta_larguras();
            }

            function seta_larguras() {
              //seta as larguras calculadas acima nos elementos
              $slider.css({'width': sliderWidth+"%"});
              $items.css({'width': itemsWidth+"%"});

              //vai para a pagina corrente (importante para manter o produto em exibicao no responsivo)
              goTo(1, false);
            }

            //Reseta a altura dos itens antes de recalcular
            $items.css({'height':'auto'});

            // var ie9 = false;
            // if(navigator.userAgent.indexOf("Trident/5")>-1) {
            //   ie9 = true;
            // }

            //Carrega a primeira imagem no banner principal
            if ($('.first-img', $items).length) {
              $('.first-img').attr('src', $('.first-img').attr('data-src'));
              $('.first-img').css({'display':'block'});
              $('.first-img').on('load', function(){
                $('.first-img ~ .img-loading').hide();
              });
            }
            if(settings.sliderImage && settings.indicators && pages > 1 && $(this).hasClass('slide-home')){
              $timeLine = $('<div>');
              $timeLine.addClass('time-line');
              $timeLine.append('<div class="time-line-current-time"></div>');

              $indicators = $('<div>');
              $indicators.addClass('indicators-container row x-small-space-xs vertical-no-margin hidden-overflow');
              for (var i = 0; i < pageLimit; i++) {
                $indicators.append('<div class="indicators col-xs bottom-padding-small"><div class="indicators-content"></div></div>');
              }
              $indicators.find('.indicators').append($timeLine);

              $this.append($indicators);
              $('.indicators', $this).eq(0).addClass('active');
              $('.active .time-line-current-time', $this).stop(true, true).css({width: '0%'}).animate({width: '100%'}, settings.autoScrollTime);

              $('.indicators', $this).on('click', function() {
                goTo($('.indicators', $this).index($(this)) + 1);
              });
            }

            //No banner full a imagem tem position:absolute então a altura do banner e definida aqui
            if(settings.sliderImage == 'responsive'){
              if ($(' > img', $items).length || $(' > a > img', $items).length) {
                //se o banner tem imagens define a altura do banner no mesma altura da imagem
                $slider.addClass('img-full-responsive img');
                if ($(' > img', $items).length) {
                  if ($slider.data('banner-height')) {
                    $items.height($slider.data('banner-height'));
                  } else {
                    $items.height($('> img', $items).height());
                  }
                } else {
                  if ($slider.data('banner-height')) {
                    $items.height($slider.data('banner-height'));
                  } else {
                    $items.height($('> a > img', $items).height());
                  }
                }
              } else {
                if ($slider.data('banner-height')) {
                  $items.height($slider.data('banner-height'));
                } else {
                  $items.height(400);
                }
              }

            } else if (settings.sliderImage == 'center') {

              $this.css({'max-width': '1140px', 'margin-top': '10px'});
              if (!$(' > img', $items).length && !$(' > a > img', $items).length) {
                if ($slider.data('banner-height')) {
                  $items.height($slider.data('banner-height'));
                } else {
                  $items.height(400);
                }
              }
              // if (ie9) {
              //   if ($(' > img', $items).length) {
              //     $items.height($('> img', $items).height());
              //   } else if ($(' > a > img', $items).length) {
              //     $items.height($('> a > img', $items).height());
              //   }
              // }

            } else if (settings.sliderImage == 'full') {

              if (!$(' > img', $items).length && !$(' > a > img', $items).length) {
                $items.height(400);
              } else {
                // if (ie9) {
                //   if ($(' > img', $items).length) {
                //     var aspect_ratio = ($('> img', $items).height() / $('> img', $items).width() * 100) + '%';
                //   } else if ($(' > a > img', $items).length) {
                //     var aspect_ratio = ($('> a > img', $items).height() / $('> a > img', $items).width() * 100) + '%';
                //   }
                //   $('.container-banner-html', $items).css({
                //     'height': '0',
                //     'padding-bottom': aspect_ratio,
                //     'display': 'table-cell',
                //     'vertical-align': 'middle'
                //   });
                //   $('.banner-product-image, .banner-product-details', $items).css({
                //     'margin-bottom': '-' + aspect_ratio,
                //     'height': '600px'
                //   });
                // }
              }

            } else  if (!settings.sliderImage) {
              if($slider.data('aspect-ratio')) {
                $('.container-img', $items).css({
                  'height': 0,
                  'padding-bottom':$slider.data('aspect-ratio'),
                });
              }
            }

            function carrega_imagem_banner_principal(page){
              //INICIO - BANNER-PRINCIPAL-HOME Carregamento parcial das imagens
              $('.slide-home .carousel-item:nth-child('+page+') .img-principal').attr('src', $('.slide-home .carousel-item:nth-child('+page+') .img-principal').attr('data-src'));
              $('.slide-home .carousel-item:nth-child('+page+') .img-principal').css({'display':'block'});
              $('.slide-home .carousel-item:nth-child('+page+') .img-principal').on('load', function(){
                $('.slide-home .carousel-item:nth-child('+page+') .img-loading').hide();
              });
              //FIM - BANNER-PRINCIPAL-HOME Carregamento parcial das imagens
            }

            $this.on('nextNewHtml', function(event, html) {
              htmlNewItems = html;
              goTo(currentPage + 1);
            });

            function goTo(page, get) {

              if ( typeof get == 'undefined' ) {
                get = true;
              }

              if ($items.length >= visibleReal) {

                var dir = page < currentPage ? -1 : 1;

                //====================Carregamento por ajax
                if (get && settings.sliderImage == false && settings.ajaxLoading) {
                  if (dir == 1) {
                    //chamada ajax
                    $(htmlNewItems).appendTo($slider);

                    //Só calcular as larguras se retornar algum produto via ajax
                    calcula_larguras();
                  }
                }

                if (page > pageLimit && dir == 1) {
                    page = 1;
                } else if (page == 0 && dir == -1) {
                    page = pageLimit;
                }

                currentPage = page;

                if ($this.hasClass('slide-home')) {
                  carrega_imagem_banner_principal(page);
                }

                if (!settings.sliderImage && $('.carousel-item', $slider).length >= currentPage * visibleReal) {
                  $('.carousel-item:nth-of-type(1n+0)', $slider).css('border-right','1px solid #DDD');
                  $('.carousel-item:nth-of-type(' + currentPage * visibleReal + ')', $slider).css('border-right','none');
                }

                //Faz a transição entre os slides
                $slider.filter(':not(:animated)').animate({"left": (page-1) * -(sliderWidth/pages) + "%"}, 600);

                $('.indicators', $this).removeClass('active');
                $('.indicators', $this).eq(page-1).addClass('active');
                if (varMouseOut && pages > 1) {
                  $('.active .time-line-current-time', $this).stop(true, true).css({width: '0%'}).animate({width: '100%'}, settings.autoScrollTime);
                }

              }
            }

            //posiciona os controles
            function controlPositioning() {
              switch(settings.controlPosition) {
                case 'inside':
                    $('.control', $this).addClass('control-inside');
                    break;
                case 'outside':
                    $('.control', $this).addClass('control-outside');
                    break;
                case 'outside-hover':
                    $('.control', $this).addClass('control-outside-hover');
                    break;
                case 'top':
                    $('.control', $this).addClass('control-top');
                    break;
                default:
                alert('O valor ' + settings.controlPosition + ' não é valido para "controlPosition"!');
              }
            }

            function addContollsEvents() {
              $('a.prev', $this).click(function(e) {
                  e.preventDefault();
                  goTo(currentPage - 1);
              });
              if (!settings.ajaxLoading) {
                $('a.next', $this).click(function(e) {
                    e.preventDefault();
                    goTo(currentPage + 1);
                });
              }
              $this.bind('next', function() {
                  goTo(currentPage + 1);
              });
            }

            //insere os controles
            function addControlls() {
              if($('.control', $this).length > 0){
                $('.control', $this).remove();
              }

              $wrapper.after('<a href="#" class="control prev hidden-sm-down"><i class="fa fa-angle-left"></i></a><a href="#" class="control next hidden-sm-down"><i class="fa fa-angle-right"></i></a>');

              controlPositioning();
              addContollsEvents();
            }
//================================= autoScroll e hoverPause - INICIO =================================//
            if (settings.autoScroll) {
                timer = setInterval(function() {
                    $this.trigger('next');
                }, settings.autoScrollTime);

                if (settings.hoverPause == true && settings.autoScroll == true) {
                    $this.mouseenter(function() {
                      $('.indicators-content', $this).stop(true, true);
                      $('.time-line-current-time').stop(true, true).css({width: '0%'})
                      varMouseOut = false;
                    }).mouseleave(function(event) {
                      varMouseOut = true;
                      if (varMouseOut && pages > 1) {
                        $('.active .time-line-current-time', $this).stop(true, true).css({width: '0%'}).animate({width: '100%'}, settings.autoScrollTime);
                      }
                    });
                    $this.mouseover(function() {
                        clearInterval(timer);
                    }).mouseout(function() {
                        timer = setInterval(function() {
                            $this.trigger('next');
                        }, settings.autoScrollTime);
                    })
                }
            }
//================================= autoScroll e hoverPause - FINAL =================================//
//============================ drag swipe Slide - INICIO ===========================//
            $this.disableSelection();
            $wrapper.disableSelection();
            $slider.disableSelection();
            $items.disableSelection();

            var myElement = $(this);
            var options = {
              // dragLockToAxis: true,
              // dragBlockHorizontal: true,
              // preventDefault: true,
              // domEvents: true
            };
            var hammertime = new Hammer(myElement[0], options);

            if ($items.length >= visibleReal) {

              hammertime.on('panstart', function(e) {

                positionStart = e.deltaX;

                hammertime.on('panright panleft', function(e) {
                  positionAtual = e.deltaX;
                  positionAnterior = (positionAnterior) ? positionAnterior : positionStart;
                  var deslocamento = positionAtual - positionAnterior;

                  var leftDrag = 'calc(' + $slider.css('left') + ' + ' + deslocamento + 'px)';
                  $($slider, $this).css({
                    left: leftDrag
                  });
                  positionAnterior = e.deltaX;
                });

                hammertime.on('panend', function(e) {
                  hammertime.off('panend panright panleft');

                  positionAnterior = 0;

                  positionStop = e.deltaX;

                  if (positionStop - positionStart > 100) {
                    goTo(currentPage - 1);
                  } else if (positionStop - positionStart < -100) {
                    goTo(currentPage + 1);
                  } else {
                    goTo(currentPage);
                  }
                });
              });

              $('a', $wrapper).on('click mousedown mousemove', function(e) {
                  e.preventDefault();
              });
              $('img', $wrapper).on('click mousedown mousemove', function(e) {
                  e.preventDefault();
              });
              $('a', $wrapper).hammer({preventDefault: true}).bind('tap', function(e) {
                e.preventDefault();
                if (!$(this).hasClass('no-redir-slider-link')) {
                  if($(this).attr('target')){
                    window.open($(this).attr('href'), $(this).attr('target'));
                  }else{
                    window.open($(this).attr('href'), '_parent');
                  }
                }
              });
            }
//============================= drag swipe Slide - FIM =============================//
        });
    }
})(jQuery);
