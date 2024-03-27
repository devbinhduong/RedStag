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
            console.log("JS is loaded");

            /* Add global function here */
            closeSidebar();
            clickOverlay();
            ajaxAddToCart(context);
            quickShop(context);
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
            handleTopPromotion();
        });

        /* Load when scroll */
        window.addEventListener('scroll', (e) => {});

        /* Load when user action on site */
        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                loadFunction();
            });
        });

        /* Load when resize */
        window.addEventListener('resize', (e) => {});
    }
    eventLoad();

    /* Hide all Sidebar */
    function hideAllSidebar() {
        const body = document.body;
        const removeClassArray = ['has-activeNavPages', 'openCartSidebar'];

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

        console.log("lastHiddenTime", lastHiddenTime);

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
}