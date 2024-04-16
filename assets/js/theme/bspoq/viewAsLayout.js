export default function () {
    const body = document.body,
        viewAsButtonList = document.querySelectorAll('.view-as-btn a');

    if(!viewAsButtonList.length) return;

    for(let viewButton of viewAsButtonList) {
        viewButton.addEventListener('click', function(e) {
            e.preventDefault();

            const viewAs = this.getAttribute('data-layout');
            const productList = document.querySelector(".productListing");

            body.classList.remove('productGrid--maxCol1', 'productGrid--maxCol3', 
            'productGrid--maxCol4', 'productGrid--maxCol5');

            if(viewAs === 'productGrid--maxCol1') {
                if(productList) {
                    productList.classList.remove('productGrid');
                    productList.classList.add('productList');
                }
            } else {
                if(productList) {
                    productList.classList.add('productGrid');
                    productList.classList.remove('productList');
                }
            }

            body.classList.add(viewAs);
        });
    }
}