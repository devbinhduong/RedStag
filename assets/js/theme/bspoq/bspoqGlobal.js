import utils from '@bigcommerce/stencil-utils';
import modalFactory from '../global/modal';
import { load } from 'webfontloader';
import event from '../global/jquery-migrate/event';
import { forEach } from 'lodash';

import quickShop from './quickShop';
import ajaxAddToCart from './ajaxAddToCart';

export default function(context) {
    const themeSettings = context.themeSettings;

    /* Scroll position */
    var scroll_position = window.scrollY;

    var check_JS_load = true;

    /* Contains all functions  that are needed to be executed after JS is loaded */
    function loadFunction () {
        if(check_JS_load) {
            check_JS_load = false;

            /* Add global function here */
            closeSidebar();
            clickOverlay();
            ajaxAddToCart(context);
            quickShop(context);
            openMenuMobileEffect();
        }
    }

    function eventLoad(){
        /* Load when DOM ready */
        window.addEventListener('load', (e) =>{
            /* Global Slick Slider */
            const sectionSlicks = document.querySelectorAll('.section-slick');
            if(sectionSlicks.length > 0) {
                for(let i = 0; i < sectionSlicks.length; i++) {
                    const sectionSlick = sectionSlicks[i];
                    const sectionSlickOptions = sectionSlick.getAttribute('data-slick-options');
                    if(sectionSlickOptions) {
                        const options = JSON.parse(sectionSlickOptions);
                        $(sectionSlick).slick(options);
                    }
                }
            }

            /* Load Section when scroll */
            sectionLoad();

            /* Top Promotion Function */
            context.themeSettings.show_topPromotion && handleTopPromotion();
        });

        /* Load when scroll */
        window.addEventListener('scroll', (e) => {});

        /* Load when user action on site */
        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                loadFunction();
            });
        });


         /* Load When Match Media Function For Tablet */
        window.matchMedia('(max-width: 1024px)').addEventListener('change', () => {
            openMenuMobileEffect();
        });

        /* Load When Match Media Function For Mobile */
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => {});
    }
    eventLoad();

    /* Hide all Sidebar */
    function hideAllSidebar() {
        const body = document.body;
        const removeClassArray = ['has-activeNavPages', 'openCartSidebar'];
        const menuMobileIcon = document.querySelector('.mobileMenu-toggle');

        /* Hide menu sidebar */
        if(body.classList.contains('has-activeNavPages')) {
            menuMobileIcon.click();
        }

        removeClassArray.forEach((sidebarClass)=>{
            if(body.classList.contains(sidebarClass)) {
                body.classList.remove(sidebarClass);
            }
        });
    }

    /* Close sidebar */
    function closeSidebar() {
        const closeButtons = document.querySelectorAll('.custom-sidebar-close');
        if(!closeButtons) return;
        
        for(let i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', (e) => {
                e.preventDefault();
                hideAllSidebar();
            });
        }
    }

    function clickOverlay() {
        const backgroundOverlay = document.querySelector('.background-overlay');
        if(!backgroundOverlay) return;

        backgroundOverlay.addEventListener('click', (e) => {
            hideAllSidebar();
        });
    }

    /* Custom Animate */
    function customAnimate(section) {
        if(section.matches('.animate-loaded')) return;

        section.classList.add('animate-loaded');

        section.classList.add('animated');
    }

    function sectionLoad() {
        const handler = (entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const section = entry.target;
                    const sectionType = section.getAttribute('data-section-load');

                    switch(sectionType) {
                        case 'animation':
                            customAnimate(section);
                            break;
                        
                        default:
                            break;
                    }
                }
            });
        }

        const sections = document.querySelectorAll('[data-section-load]'),
        options = {
            threshold: .05
        };

        if(!sections) return;

        const observer = new IntersectionObserver(handler, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /* Header Top Promotion */
    function handleTopPromotion() {
        const closePromotion = document.querySelector('.promotion-close');
        if(!closePromotion) return;

        /* Handle when click close button */
        closePromotion.addEventListener('click', function(event) {
            event.preventDefault();
        
            $('#bspoq_topPromotion').slideToggle();

            /* Save Close Time */
            localStorage.setItem('lastHiddenTime', new Date().getTime());
        });

        /* Check if promotion is closed */
        const lastHiddenTime = localStorage.getItem('lastHiddenTime');

        if(lastHiddenTime) {
            const currentTime = new Date().getTime();
            const timeHide = 1; // 1 day
            const timeDiff = currentTime - lastHiddenTime;
            const timeDiffInDay = timeDiff / (1000 * 60 * 60 * 24);

            if(timeDiffInDay > timeHide) {
                $('#bspoq_topPromotion').removeClass("u-hidden");
            }
        } else {
            $('#bspoq_topPromotion').removeClass("u-hidden");
        }
    }

    /* Open Menu Mobile Effect */
    function openMenuMobileEffect() {
        if(window.innerWidth > 1024) return;

        const body = document.body,
            menuMobileIcon = document.querySelector('.mobileMenu-toggle'),
            topPromotion = document.querySelector('#bspoq_topPromotion');

        if(!menuMobileIcon || !topPromotion) return;

        const promotionHeight = topPromotion.offsetHeight;

        menuMobileIcon.addEventListener('click', (event) => {
            event.preventDefault();

            if(!body.classList.contains('has-activeNavPages')) {
                body.style.transform = 'translateY(0)';
            } else {
                body.style.transform = 'translateY(' + -promotionHeight + 'px)';
            }
        });
    }
} 