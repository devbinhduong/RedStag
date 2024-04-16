import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

import viewAsLayout from './bspoq/viewAsLayout';
import productListingShowMore from './bspoq/productListingShowMore';
import toogleSidebarMobile from './bspoq/toogleSidebarMobile';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        this.initFacetedSearch();

        if (!$('#facetedSearch').length) {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);

            // Refresh range view when shop-by-price enabled
            const urlParams = new URLSearchParams(window.location.search);

            if (urlParams.has('search_query')) {
                $('.reset-filters').show();
            }

            $('input[name="price_min"]').attr('value', urlParams.get('price_min'));
            $('input[name="price_max"]').attr('value', urlParams.get('price_max'));
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();


        /* Custom Function Start */
        var check_JS_load = true;

        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if(check_JS_load) {
                    check_JS_load = false;
                    /* View as product listing layout */
                    viewAsLayout();
                    /* View More product */
                    productListingShowMore();
                    toogleSidebarMobile();

                    this.toogleReadMoreBanner();
                }
            });
        });
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container > nav');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }

    /* Read More Category Description */
    toogleReadMoreBanner() {
        const readMoreButton = document.querySelector('.categoryHeader__description--viewMore');
        const categoryDescription = document.querySelector('.categoryHeader__description');
        const categoryDescriptionContent = document.querySelector('.categoryHeader__description--wrapper');

        const defaultDescriptionHeight = 42;

        if (!readMoreButton || !categoryDescription || !categoryDescriptionContent) return;

        if (categoryDescriptionContent.clientHeight <= defaultDescriptionHeight) {
            readMoreButton.remove();
        }

        readMoreButton.addEventListener('click', (e) => {
            e.preventDefault();

            if (categoryDescriptionContent.clientHeight > categoryDescription.clientHeight) {
                categoryDescription.style.height = categoryDescriptionContent.clientHeight + 'px';
                readMoreButton.innerHTML = 'Read Less';
            } else {
                categoryDescription.style.height = defaultDescriptionHeight + 'px';
                readMoreButton.innerHTML = 'Read More';
            }

            categoryDescription.style.transition = 'height 0.3s ease-in-out';
        });
    }
}
