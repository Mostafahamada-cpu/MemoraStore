// Initialize Swiper
const swiper = new Swiper('.swiper', {
    loop: true, // Allows infinite swiping
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});