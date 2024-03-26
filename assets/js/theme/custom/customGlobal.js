import utils from '@bigcommerce/stencil-utils';
import modalFactory from '../global/modal';
import { load } from 'webfontloader';
import event from '../global/jquery-migrate/event';
import { forEach } from 'lodash';

import ajaxAddToCart from './ajax-add-to-cart';
import quickShop from './quickShop';

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

            ajaxAddToCart(context);
            quickShop(context);

            /* Add global function here */
            closeSidebar();
            clickOverlay();
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

}