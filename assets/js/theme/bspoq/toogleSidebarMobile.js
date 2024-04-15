export default function() {
    $('.page-sidebar-mobile').on('click', event => {
        if($(event.currentTarget).hasClass('is-open')){
            $(event.currentTarget).removeClass('is-open');
            $('.page-sidebar').removeClass('is-open');
            $('body').removeClass('openSidebar');
        } else{
            $(event.currentTarget).addClass('is-open');
            $('.page-sidebar').addClass('is-open');
            $('body').addClass('openSidebar');
        }
    });

    $('.page-sidebar .page-sidebar-close .close').on('click', event => {
        event.preventDefault();

        $('.page-sidebar-mobile').removeClass('is-open');
        $('.page-sidebar').removeClass('is-open');
        $('body').removeClass('openSidebar');
    });

    $(document).on('click', event => {
        if ($('.page-sidebar').hasClass('is-open')) {
            if (($(event.target).closest('.page-sidebar').length === 0) && ($(event.target).closest('.page-sidebar-mobile').length === 0)){
                $('.page-sidebar-mobile').removeClass('is-open');
                $('.page-sidebar').removeClass('is-open');
                $('body').removeClass('openSidebar');
            }
        }
    });
}
