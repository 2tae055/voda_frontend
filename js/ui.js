// js/ui.js

document.addEventListener('DOMContentLoaded', () => {

    if (typeof Swiper !== 'undefined') {

        new Swiper('.mySwiper', {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 10,
            grabCursor: true,
            slideToClickedSlide: true,
            initialSlide: 2,
        });
    }

});