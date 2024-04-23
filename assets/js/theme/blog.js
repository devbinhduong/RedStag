import PageManager from './page-manager';
import toogleSidebarMobile from './bspoq/toogleSidebarMobile';


export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    }

    onReady() {
        toogleSidebarMobile();
    }
}