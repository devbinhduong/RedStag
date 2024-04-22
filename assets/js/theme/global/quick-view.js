import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import Review from '../product/reviews';
import ProductDetails from '../common/product-details';
import { defaultModal, ModalEvents } from './modal';
import 'slick-carousel';
import { setCarouselState, onSlickCarouselChange, onUserCarouselChange } from '../common/carousel';

export default function (context) {
    const modal = defaultModal();

    /* Product Page Function */
    /* Toggle Tabs */
    function toggleTabs() {
        const toggleTabTitle = document.querySelectorAll('.tab-titleMobile');

        toggleTabTitle.forEach((tabTitle) => {
            tabTitle.addEventListener('click', (e) => {
                e.preventDefault();

                const target = e.currentTarget;
                const tabContentWrapper = target.closest('.tab-content');
                const tabContent = tabContentWrapper.querySelector('.tabContent');

                $(tabContent).slideToggle();
                tabContentWrapper.classList.toggle('is-active');
            });
        });
    }

    /* Custom Tab */
    function customTab() {
        const customContents = document.querySelectorAll("#tab-description .techSheet");
        const customContentsWrapper = document.querySelector('#tab-custom .tabContent');
        const customTab = document.querySelector('#tab-custom');

        if(!customTab) return;

        if (!customContents.length) {
            document.querySelector('#tab-custom').style.display = 'none';
            return;
        }

        customContents.forEach(customContent => {
            customContentsWrapper.appendChild(customContent);

            /* handle PDF file */
            const pdfLink = customContent.getAttribute('data-pdf');
            const pdfLinkButton = customContentsWrapper.querySelector(".download-file-button");

            /* Download PDF file when click button */
            pdfLinkButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(pdfLink, '_blank');
            });
        });
    }

    async function showBrandImage() {
        const productBrand = document.querySelector('.productView-brand');
        const productBrandImageWrapper =  document.querySelector('.productView-brand-image');

        if (!productBrand ||  !productBrandImageWrapper) return;

        let brandUrl = productBrandImageWrapper.getAttribute('href');

        try {
            const response = await fetch(brandUrl);
            const data = await response.text();

            const tempElement = document.createElement('div');
            tempElement.innerHTML = data;

            const brandImage = tempElement.querySelector('.brand-image-container img');

            if (brandImage) {
                const brandImageSrc = brandImage.getAttribute('src');

                if (brandImageSrc !== undefined) {
                    const imageElement = `
                        <a href="${brandUrl}">
                            <img src="${brandImageSrc}" alt="${brandImage.getAttribute('alt')}">
                        </a>
                    `;
                    productBrandImageWrapper.insertAdjacentHTML('afterbegin', imageElement);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    function productChartReview() {
        const chartReview = document.querySelector('.reviewChart__list');
        if (!chartReview) return;

        const reviewCounts = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        // Count reviews of each rating
        for (let i = 1; i <= 5; i++) {
            reviewCounts[i] = document.querySelectorAll(`.get-review-count .review${i}`).length;
        }

        // Calculate total review count
        const totalReview = Object.values(reviewCounts).reduce((total, count) => total + count, 0);

        // Update chart items with review counts
        for (let i = 1; i <= 5; i++) {
            const chartItem = chartReview.querySelector(`.reviewChart__item--${i}`);
            const countElement = chartItem.querySelector('.item-count');
            const percentElement = chartItem.querySelector('.process-percent');

            countElement.textContent = `(${reviewCounts[i]})`;

            const reviewPercent = (reviewCounts[i] / totalReview) * 100;
            percentElement.style.width = `${reviewPercent}%`;
        }
    }

    function convertDateReview(reviewDate) {
        const parts = reviewDate.match(/(\d+)(?:st|nd|rd|th) (\w+) (\d{4})/);

        if (!parts) {
            return null;
        }

        const monthList = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const [_, day, month, year] = parts;

        if (day && month && year) {
            const monthIndex = monthList.indexOf(month) + 1;
            return `${day.toString().padStart(2, '0')}.${monthIndex.toString().padStart(2, '0')}.${year}`;
        }

        return null;
    }

    function changeDateReview(convertDateReview) {
        const dateReviewList = document.querySelectorAll('.productReview-date');

        dateReviewList.forEach(dateReview => {
            const date = dateReview.innerHTML;
            const result = convertDateReview(date);
            dateReview.innerHTML = result;
        });
    }

    function viewAllReview() {
        const viewAllReview = document.querySelector('.review-button-group .view-all-review');
        const reviewList = document.querySelectorAll('.productReviews-list .productReview');

        if (!viewAllReview || reviewList.length <= 2) return;

        for (let i = 2; i < reviewList.length; i++) {
            reviewList[i].style.display = 'none';
        }

        viewAllReview.addEventListener('click', function (e) {
            e.preventDefault();

            for (let i = 2; i < reviewList.length; i++) {
                reviewList[i].style.display = 'block';
            }

            viewAllReview.style.display = 'none';
        });
    }

    /* Shipping Tab */
    function shippingTab() {
        const shippingTabType = context.themeSettings.show_shipping_tabs_type;
        const shippingTab = document.querySelector('#tab-shipping');

        if (!shippingTab) return;

        const tabContent = shippingTab.querySelector('.tabContent');

        if (shippingTabType === 'all') {
            const url = context.themeSettings.show_shipping_tab_link;

            fetch(url)
                .then(response => response.text())
                .then(data => {
                    const tempContainer = document.createElement('div');

                    tempContainer.innerHTML = data;

                    const contentElement = tempContainer.querySelector('.page-custom .page-content');

                    if (contentElement) {
                        const content = contentElement.innerHTML;
                        tabContent.innerHTML = content;
                    } else {
                        shippingTab.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        } else if (shippingTabType === 'custom') {
            const shippingTabContent = document.querySelector('#tab-description [data-shipping-tab]');
            if (!shippingTabContent) {
                shippingTab.style.display = 'none';
                return
            }

            tabContent.innerHTML = shippingTabContent.innerHTML;
        }
    }

    function stockIndicatorHandler() {
        const idProduct = $('.productView').data('product-id');

        getStock(idProduct).then(data => {
            const proVariant = data.site.products.edges[0].node.variants.edges;
            const trackLvProductInventory = data.site.products.edges[0].node.inventory.aggregated != null ? data.site.products.edges[0].node.inventory.aggregated.availableToSell : undefined;
            let stockMessage = '';

            const stockTotal = proVariant.reduce((acc, item) => {
                return acc + item.node.inventory.aggregated.availableToSell;
            }, 0);

            if (trackLvProductInventory != undefined) {
                if (trackLvProductInventory >= 1) {
                    stockMessage = context.themeSettings.in_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('in-stock').html(stockMessage);
                } else {
                    stockMessage = context.themeSettings.contact_to_buy_label;
                    $('.productView-info-value.stock-indicator-value').addClass('contact-stock').html(stockMessage);
                }
            } else {
                if (stockTotal >= 1) {
                    stockMessage = context.themeSettings.in_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('in-stock').html(stockMessage);
                } else {
                    stockMessage = context.themeSettings.available_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('availabel-stock').html(stockMessage);
                }
            }

        });

    }

    function getStock(list) {
        return fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + context.token
            },
            body: JSON.stringify({
                query: `
                        query SeveralProductsByID {
                            site {
                                products(entityIds: ${list}) {
                                    edges {
                                        node {
                                            entityId
                                            inventory {
                                                hasVariantInventory
                                                aggregated {
                                                    availableToSell
                                                }
                                            }
                                            variants {
                                                edges {
                                                    node {
                                                        entityId
                                                        sku
                                                        inventory {
                                                            isInStock
                                                            aggregated {
                                                                availableToSell
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        }
                    `
            }),
        }).then(res => res.json()).then(res => res.data);
    }

    $('body').on('click', '.quickview', event => {
        event.preventDefault();

        const productId = $(event.currentTarget).data('productId');
        const handleDropdownExpand = ({ currentTarget }) => {
            const $dropdownMenu = $(currentTarget);
            const dropdownBtnHeight = $dropdownMenu.prev().outerHeight();

            $dropdownMenu.css('top', dropdownBtnHeight);

            return modal.$modal.one(ModalEvents.close, () => $dropdownMenu.off('opened.fndtn.dropdown', handleDropdownExpand));
        };

        modal.open({ size: 'large' });

        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
            if (err) return;

            modal.updateContent(response);

            $('#modal .dropdown-menu').on('opened.fndtn.dropdown', handleDropdownExpand);
            modal.$content.find('.productView').addClass('productView--quickView');

            const $carousel = modal.$content.find('[data-slick]');
            if ($carousel.length) {
                $carousel.on('init breakpoint swipe', setCarouselState);
                $carousel.on('click', '.slick-arrow, .slick-dots', setCarouselState);

                $carousel.on('init afterChange', (e, carouselObj) => onSlickCarouselChange(e, carouselObj, context));
                $carousel.on('click', '.slick-arrow, .slick-dots', $carousel, e => onUserCarouselChange(e, context));
                $carousel.on('swipe', (e, carouselObj) => onUserCarouselChange(e, context, carouselObj.$slider));

                if (modal.$modal.hasClass('open')) {
                    $carousel.slick();
                } else {
                    modal.$modal.one(ModalEvents.opened, () => {
                        if ($.contains(document, $carousel[0])) $carousel.slick();
                    });
                }
            }

            /* Custom product function start */
            toggleTabs();
            customTab();
            showBrandImage();
            productChartReview();
            changeDateReview(convertDateReview);
            viewAllReview();
            shippingTab();
            stockIndicatorHandler();

            /* Custom product function end */

            /* eslint-disable no-new */
            new Review({ $context: modal.$content });

            return new ProductDetails(modal.$content.find('.quickView'), context);
        });

    });
}
