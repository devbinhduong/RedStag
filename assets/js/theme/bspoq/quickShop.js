import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal, ModalEvents } from '../global/modal';

export default function (context) {
    const modal = defaultModal();

    $('body').on('click', '.button--quickShop', event => {
        event.preventDefault();

        if(context.themeSettings.bspoq_quick_shop_quickView) {
            const currentCard = event.target.closest('.card');
            const quickViewButton = currentCard.querySelector('.quickviewButton');
            
            if(!quickViewButton) {
                const productLink = currentCard.querySelector('.card-figure__link');
                window.location.href = productLink.href;
                return;
            }

            quickViewButton.click();

        } else {
            const productId = $(event.currentTarget).data('productId');
    
            modal.$modal.removeClass().addClass('modal modal--quickShop');
            modal.open({ size: 'small' });
    
            utils.api.product.getById(productId, { template: 'bspoq/products/quick-shop' }, (err, response) => {
                modal.updateContent(response);
    
                var productDetails = new ProductDetails(modal.$content.find('.quickShop'), context);
                productDetails.setProductVariant(modal.$content.find('.quickShop'));
    
                return productDetails;
            });
        }
    });
}
