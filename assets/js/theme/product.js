/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.token = context.token;
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
        this.themeSettings = context.themeSettings;
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        this.bulkPricingHandler();

        /* Custom Function Start */
        var check_JS_load = true;
        this.startCountdown();


        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if(check_JS_load) {
                    check_JS_load = false;
                    this.toggleTabs();
                    this.showBrandImage();
                    if(this.context.themeSettings.show_custom_tabs) {
                        this.customTab();
                    }

                    this.productChartReview();
                    this.changeDateReview(this.convertDateReview);
                    this.viewAllReview();

                    if(this.context.themeSettings.show_shipping_tabs) {
                        this.shippingTab();
                    }

                    this.stockIndicatorHandler();
                }
            });
        });

        const $reviewForm = classifyForm('.writeReview-form');

        if ($reviewForm.length === 0) return;

        const review = new Review({ $reviewForm });

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    /* Get Brand Image On Product Page */
    async showBrandImage() {
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

    /* Toggle Tabs */
    toggleTabs() {
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
    customTab() {
        const customContents = document.querySelectorAll("#tab-description .techSheet");
        const customContentsWrapper = document.querySelector('#tab-custom .tabContent');

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

    productChartReview() {
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

    convertDateReview(reviewDate) {
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

    changeDateReview(convertDateReview) {
        const dateReviewList = document.querySelectorAll('.productReview-date');

        dateReviewList.forEach(dateReview => {
            const date = dateReview.innerHTML;
            const result = convertDateReview(date);
            dateReview.innerHTML = result;
        });
    }

    viewAllReview() {
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
    shippingTab() {
        const shippingTabType = this.context.themeSettings.show_shipping_tabs_type;
        const shippingTab = document.querySelector('#tab-shipping');
        const tabContent = shippingTab.querySelector('.tabContent');

        if (shippingTabType === 'all') {
            const url = this.context.themeSettings.show_shipping_tab_link;

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

    stockIndicatorHandler() {
        const idProduct = $('.productView').data('product-id');


        this.getStock(idProduct).then(data => {
            const proVariant = data.site.products.edges[0].node.variants.edges;
            const trackLvProductInventory = data.site.products.edges[0].node.inventory.aggregated != null ? data.site.products.edges[0].node.inventory.aggregated.availableToSell : undefined;
            let stockMessage = '';

            const stockTotal = proVariant.reduce((acc, item) => {
                return acc + item.node.inventory.aggregated.availableToSell;
            }, 0);

            if (trackLvProductInventory != undefined) {
                if (trackLvProductInventory >= 1) {
                    stockMessage = this.themeSettings.in_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('in-stock').html(stockMessage);
                } else {
                    stockMessage = this.themeSettings.contact_to_buy_label;
                    $('.productView-info-value.stock-indicator-value').addClass('contact-stock').html(stockMessage);
                }
            } else {
                if (stockTotal >= 1) {
                    stockMessage = this.themeSettings.in_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('in-stock').html(stockMessage);
                } else {
                    stockMessage = this.themeSettings.available_stock_label;
                    $('.productView-info-value.stock-indicator-value').addClass('availabel-stock').html(stockMessage);
                }
            }

        });

    }

    getStock(list) {
        return fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token
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

    /* Product Countdown timer */
    startCountdown() {
        var now = new Date();
        var targetTime = new Date();
        targetTime.setHours(10, 38, 0); // Set target time to 10:20

        // Check if current time is after target time
        if (now > targetTime) {
            // Set target time to next day
            // targetTime.setDate(targetTime.getDate() + 1);
            console.log("now > target Time")
        }   

        var countdownElement = document.querySelector('.countdown__hours');
        var minutesElement = document.querySelector('.countdown__minutes');
        var timeEndElement = document.querySelector('.order-for-delivery .text');

        if (!countdownElement || !minutesElement || !timeEndElement) {
            return;
        }

        function updateCountdown() {
            var currentTime = new Date();
            var timeDifference = targetTime - currentTime;

            // Calculate hours and minutes remaining
            var hours = Math.floor(timeDifference / (1000 * 60 * 60));
            var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

            // Update countdown elements
            countdownElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');

            // Check if countdown has ended
            if (timeDifference <= 0) {
                countdownElement.textContent = '00';
                minutesElement.textContent = '00';
                // timeEndElement.textContent = 'Time End: ' + targetTime.toLocaleTimeString('en-US', { timeZone: timezone });
                timeEndElement.textContent = 'Time End';
                clearInterval(countdownInterval);
            }
        }

        // Update countdown immediately
        updateCountdown();

        // Update countdown every minute
        var countdownInterval = setInterval(updateCountdown, 60000);
    }
}
