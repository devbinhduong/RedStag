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
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
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

        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if(check_JS_load) {
                    check_JS_load = false;
                    this.toggleTabs();  
                    this.showBrandImage();
                    if(this.context.themeSettings.show_custom_tabs) {
                        this.customTab();
                    }
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

        if (!productBrand) return;

        let brandUrl = productBrand.querySelector('a').getAttribute('href');

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
                    productBrand.insertAdjacentHTML('afterbegin', imageElement);
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
}
