export default function () {
    const showMoreButton = document.querySelector('#listing-showmoreBtn > a');
        showMoreButton.addEventListener('click', (event) => {
        event.preventDefault();

        const currentPage = document.querySelector('.pagination-item--current');
        const nextProductPage = currentPage.nextElementSibling;
        const nextProductPageLink = nextProductPage
            .querySelector('a')
            .getAttribute('href');

        showMoreButton.classList.add('loadding');

        fetch(nextProductPageLink.replace('http://', '//'))
            .then((response) => response.text())
            .then((dataHtml) => {
                const parser = new DOMParser();
                const fetchedDocument = parser.parseFromString(
                    dataHtml,
                    'text/html'
                );

                const productContainer = fetchedDocument.querySelector(
                    '#product-listing-container .productListing'
                );

                if (productContainer) {
                    const newProducts = productContainer.children;
                    const currentProductListing = document.querySelector(
                        '#product-listing-container .productListing'
                    );
                    const paginationList =
                        document.querySelector('.pagination-list');

                    while (newProducts.length > 0) {
                        currentProductListing.appendChild(newProducts[0]);
                    }

                    paginationList.innerHTML =
                        fetchedDocument.querySelector(
                            '.pagination-list'
                        ).innerHTML;

                    showMoreButton.classList.remove('loadding');
                    showMoreButton.blur();

                    const nextPage = document.querySelector(
                        '.pagination-item--current'
                    ).nextElementSibling;

                    if (!nextPage) {
                        showMoreButton.classList.add('button--disabled');
                        showMoreButton.textContent = 'No more products';
                    }
                }
            });
    });
}
