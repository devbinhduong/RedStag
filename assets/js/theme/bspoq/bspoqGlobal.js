import utils from '@bigcommerce/stencil-utils';
import quickShop from './quickShop';
import ajaxAddToCart from './ajaxAddToCart';

export default function(context) {
    const themeSettings = context.themeSettings;

    /* Scroll position */
    var scroll_position = $(window).scrollTop();

    var check_JS_load = true;

    /* Contains all functions  that are needed to be executed after JS is loaded */
    function loadFunction () {
        if(check_JS_load) {
            check_JS_load = false;

            /* Add global function here */
            closeSidebar();
            clickOverlay();
            ajaxAddToCart(context);
            quickShop(context);
            openMenuMobileEffect();
            toogleFooterMobile();

            if ($('#list-product-detail-block').length > 0) {
                homeProductsListID();
            }
        }
    }

    function eventLoad(){
        /* Top Promotion Function */
        context.themeSettings.show_topPromotion && handleTopPromotion();

        $(document).ready(function() {
            var $header = $('header.header'),
                height_header = $header.outerHeight(),
                header_top_height = $('#bspoq_topPromotion').outerHeight();

            $header.css("--slide-up", `-${header_top_height}px`);

            /* Load when scroll */
            $(window).on('scroll', (e) => {
                const $target = $(e.currentTarget);
                const tScroll = $target.scrollTop();

                headerSticky(tScroll, $header, height_header, header_top_height);
            });
        });

        /* Load when DOM ready */
        window.addEventListener('load', (e) =>{
            /* Load Section when scroll */
            sectionLoad();
        });

        /* Load when user action on site */
        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                loadFunction();
            });
        });

        window.matchMedia('(max-width: 1400px)').addEventListener('change', () => {
            recentlyPostSlick();
        });

         /* Load When Match Media Function For Tablet */
        window.matchMedia('(max-width: 1024px)').addEventListener('change', () => {
            openMenuMobileEffect();
        });

        /* Load When Match Media Function For Mobile */
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => {});

        window.matchMedia('(max-width: 550px)').addEventListener('change', () => {
            toogleFooterMobile();
        });
    }
    eventLoad();

    /* Hide all Sidebar */
    function hideAllSidebar() {
        const body = document.body;
        const removeClassArray = ['has-activeNavPages', 'openCartSidebar'];
        const menuMobileIcon = document.querySelector('.mobileMenu-toggle');

        /* Hide menu sidebar */
        if(body.classList.contains('has-activeNavPages')) {
            menuMobileIcon.click();
        }

        removeClassArray.forEach((sidebarClass)=>{
            if(body.classList.contains(sidebarClass)) {
                body.classList.remove(sidebarClass);
            }
        });
    }

    /* Close sidebar */
    function closeSidebar() {
        const closeButtons = document.querySelectorAll('.custom-sidebar-close');
        if(!closeButtons) return;
        
        for(let i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', (e) => {
                e.preventDefault();
                hideAllSidebar();
            });
        }
    }

    function clickOverlay() {
        const backgroundOverlay = document.querySelector('.background-overlay');
        if(!backgroundOverlay) return;

        backgroundOverlay.addEventListener('click', (e) => {
            hideAllSidebar();
        });
    }

    /* Custom Animate */
    function customAnimate(section) {
        if(section.matches('.animate-loaded')) return;

        section.classList.add('animate-loaded');

        section.classList.add('animated');
    }

    /* Custom Slick Slider */
    function customSlickSlider(section) {
        if(section.matches('.slick-slider-loaded')) return;

        section.classList.add('slick-slider-loaded');

        const sectionSlickOptions = section.getAttribute('data-slick-options');
        if(!sectionSlickOptions) return;

        const options = JSON.parse(sectionSlickOptions);
        $(section).slick(options);
    }

    function recentlyPostSlick(section) {
        if (window.innerWidth > 1400) {
            $('.recentlyPost__list.slick-initialized').slick('unslick');

        } else {
            if($('.recentlyPost__list').hasClass('slick-initialized')) return;

            $('.recentlyPost__list').slick({
                dots: true,
                arrows: false,
                infinite: false,
                mobileFirst: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }
    }

    function sectionLoad() {
        const handler = (entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const section = entry.target;
                    const sectionType = section.getAttribute('data-section-load');

                    switch(sectionType) {
                        case 'animation':
                            customAnimate(section);
                            break;
                        
                        case 'slick-slider':
                            customSlickSlider(section);
                            break;

                        case 'recent-post': 
                            recentlyPostSlick(section);
                            break;
                        
                        default:
                            break;
                    }
                }
            });
        }

        const sections = document.querySelectorAll('[data-section-load]'),
        options = {
            threshold: .05
        };

        if(!sections) return;

        const observer = new IntersectionObserver(handler, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /* Header Top Promotion */
    function handleTopPromotion() {
        const closePromotion = document.querySelector('.promotion-close');
        if(!closePromotion) return;

        /* Handle when click close button */
        closePromotion.addEventListener('click', function(event) {
            event.preventDefault();
        
            $('#bspoq_topPromotion').slideToggle();

            /* Save Close Time */
            localStorage.setItem('lastHiddenTime', new Date().getTime());
        });

        /* Check if promotion is closed */
        const lastHiddenTime = localStorage.getItem('lastHiddenTime');

        if(lastHiddenTime) {
            const currentTime = new Date().getTime();
            const timeHide = 1; // 1 day
            const timeDiff = currentTime - lastHiddenTime;
            const timeDiffInDay = timeDiff / (1000 * 60 * 60 * 24);

            if(timeDiffInDay > timeHide) {
                $('#bspoq_topPromotion').removeClass("u-hidden");
            }
        } else {
            $('#bspoq_topPromotion').removeClass("u-hidden");
        }
    }

    /* Open Menu Mobile Effect */
    function openMenuMobileEffect() {
        if(window.innerWidth > 1024) return;

        const body = document.body, 
            menuMobileIcon = document.querySelector('.mobileMenu-toggle'),
            topPromotion = document.querySelector('#bspoq_topPromotion');

        if(!menuMobileIcon || !topPromotion || topPromotion.classList.contains("u-hidden")) return;
        
        menuMobileIcon.addEventListener('click', (event) => {
            event.preventDefault();
            if(!body.classList.contains('has-activeNavPages')) {
                $('header.header').removeClass('slide-up');
            } else {
                $('header.header').addClass('slide-up');
            }
        });
    }

    /* Header Sticky */
    function headerSticky(tScroll, $header, height_header, header_top_height) {
        if (themeSettings.show_sticky_header) {
            if (tScroll > header_top_height && tScroll < scroll_position) {
                if (!$('.header-height').length) {
                    $header.before(
                        '<div class="header-height" style="height: ' +
                            height_header +
                            'px"></div>'
                    );
                }
                $header.addClass('is-sticky');
                $header.css('animation-name', 'fadeInDown');

            } else {
                $header.removeClass('is-sticky');
                $('.header-height').remove();
                $header.css('animation-name', '');
            }

            scroll_position = tScroll;
        }
    }

    /* Footer Mobile Toggle */
    function toogleFooterMobile() {
        if(window.innerWidth > 550) return;

        const $footerHeadingToggle = $('.footer-info-heading--toggle');

        $footerHeadingToggle.on('click', (e) => {
            e.preventDefault();

            const $target = $(e.currentTarget);
            const $thisFooterInfo = $target.parents('.footer-info-col');
            const $thisFooterInfo_list = $thisFooterInfo.find('.footer-info-list');

            $thisFooterInfo.toggleClass('open-dropdown');

            if ($thisFooterInfo.hasClass('open-dropdown')) {
                $thisFooterInfo_list.slideDown(400);
            }
            else {
                $thisFooterInfo_list.slideUp(400);
            }
        });
    }

    /* Custom Product Id */
    function homeProductsListID() {
        var $options;

        $(document).ready(function () {
            const tScroll = $(this).scrollTop();

            homeListId(tScroll);
        });

        function homeListId(tScroll) {
            if ($('.productsByListId[data-list-id]').length > 0) {
                $('.productsByListId[data-list-id]').each((index, element) => {
                    let thisOffetTop =
                        $(element).offset().top - screen.height * 1.5;

                    if (!$(element).hasClass('is-loaded')) {
                        $(element).addClass('is-loaded');

                        var $prodWrapId = $(element).attr('id'),
                            $wrap,
                            $listId = $(element).data('list-id');
                        var homeProColumn = $(element)
                            .parents('.product-block')
                            .data('columns');
                        var dots = $(element)
                            .parents('.product-block')
                            .data('dots');
                        var limit = $(element)
                            .parents('.product-block')
                            .data('limit');

                        if ($(element).find('.productCarouselCustom').length > 0) {
                            $wrap = $(element).find('.productCarouselCustom');
                            $options = {
                                template:
                                    'bspoq/products/custom-product-block',
                            };
                        }

                        if (
                            !$(
                                '#product-by-list-' +
                                    $prodWrapId +
                                    ' .productCarouselCustom .productCarousel-slide'
                            ).length
                        ) {
                            if ($listId.length > 1) {
                                loadListID(
                                    $listId,
                                    $options,
                                    $wrap,
                                    homeProColumn,
                                    dots,
                                    limit
                                );
                            } else {
                                loadListID(
                                    $($listId),
                                    $options,
                                    $wrap,
                                    homeProColumn,
                                    dots,
                                    limit
                                );
                            }
                        }
                    }
                });
            }
        }

        function loadListID(id, options, wrap, homeProColumn, dots, limit) {
            if (id.length <= 1) {
                var arr = id;
            } else {
                var arr = id.split(',');
            }

            if (id.length > homeProColumn) {
                var list = arr.slice(0, parseInt(limit));
            } else {
                var list = arr;
            }

            var num = 0;

            for (var i = 0; i <= list.length; i++) {
                var $prodId = list[i];

                if ($prodId != undefined) {
                    utils.api.product.getById(
                        $prodId,
                        options,
                        (err, response) => {
                            let hasProd = $(response)
                                .find('.card')
                                .data('product-id');
                            if (
                                hasProd != undefined &&
                                hasProd != '' &&
                                hasProd != null &&
                                !$(response).find('.page-content--err').length
                            ) {
                                if (wrap.hasClass('slick-slider')) {
                                    wrap.slick('unslick');
                                    wrap.append(response);
                                } else {
                                    wrap.append(response);
                                }
                            }

                            num++;

                            if (num == list.length) {
                                wrap.parents('.productsByListId[data-list-id]')
                                    .find('.custom_productLoading')
                                    .remove();
                                wrap.parents(
                                    '.productsByListId[data-list-id]'
                                ).addClass('show');
                                if (wrap.hasClass('productCarouselCustom')) {
                                    slickCarouselListId(
                                        wrap,
                                        homeProColumn,
                                        dots
                                    );
                                }
                                return;
                            }
                        }
                    );
                }
            }
        }

        function slickCarouselListId($wrap, homeProColumn, dots) {
            $wrap.slick({
                infinite: false,
                slidesToShow: 2,
                slidesToScroll: 2,
                dots: true,
                arrows: false,
                mobileFirst: true,
                nextArrow:
                    "<svg class='slick-next slick-arrow'><use xlink:href='#slick-arrow-next'></use></svg>",
                prevArrow:
                    "<svg class='slick-prev slick-arrow'><use xlink:href='#slick-arrow-prev'></use></svg>",
                responsive: [
                    {
                        breakpoint: 1280,
                        settings: {
                            slidesToShow: homeProColumn,
                            slidesToScroll: homeProColumn,
                            arrows: true,
                            dots: dots,
                        },
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: homeProColumn - 2,
                            slidesToScroll: homeProColumn - 2,
                            arrows: true,
                            dots: dots,
                        },
                    },
                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: homeProColumn - 2,
                            slidesToScroll: homeProColumn - 2,
                            arrows: false,
                            dots: true,
                        },
                    },
                ],
            });
        }
    }
} 