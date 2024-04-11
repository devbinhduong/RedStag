import PageManager from './page-manager';
import utils from '@bigcommerce/stencil-utils';

export default class Page extends PageManager {
    constructor(context) {
        super(context);
    }

    onReady() {
        /* All function use only Page Page */
        if ($('#list-product-detail-block').length > 0) {
            this.pageProductsListID();
        }
    }

    /* Custom Product Id */
    pageProductsListID() {
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

            var isHideLoading = true;

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
                                    if(isHideLoading) {
                                        wrap.parents('.productsByListId[data-list-id]')
                                        .find('.custom_productLoading')
                                        .remove();

                                        isHideLoading = false;
                                        
                                    }

                                    wrap.append(response);
                                }
                            }

                            num++;

                            if (num == list.length) {
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
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                mobileFirst: true,
                responsive: [
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: homeProColumn,
                            slidesToScroll: homeProColumn
                        },
                    },
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: homeProColumn - 1,
                            slidesToScroll: homeProColumn - 1
                        },
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: homeProColumn - 2,
                            slidesToScroll: homeProColumn - 2
                        },
                    },
                    {
                        breakpoint: 551,
                        settings: {
                            slidesToShow: homeProColumn - 3,
                            slidesToScroll: homeProColumn - 3
                        },
                    },
                ],
            });
        }
    }
}