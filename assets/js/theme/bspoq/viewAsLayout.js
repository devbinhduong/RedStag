export default function () {
    const body = document.body,
        viewAsButtonList = document.querySelectorAll('.view-as-btn a');

    if(!viewAsButtonList.length) return;

    for(let viewButton of viewAsButtonList) {
        viewButton.addEventListener('click', function(e) {
            e.preventDefault();

            const viewAs = this.getAttribute('data-layout');

            body.classList.remove('productGrid--maxCol1', 'productGrid--maxCol3', 
            'productGrid--maxCol4', 'productGrid--maxCol5');

            body.classList.add(viewAs);
        });
    }
}