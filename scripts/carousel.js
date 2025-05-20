class Carousel {
    constructor(element) {
        this.carousel = element;
        this.inner = element.querySelector('.carousel-inner');
        this.items = element.querySelectorAll('.carousel-item');
        this.currentIndex = 0;
        this.itemWidth = 100 / this.items.length;
        
        // Set initial positions
        this.items.forEach((item, index) => {
            item.style.flex = `0 0 ${this.itemWidth}%`;
        });
    }

    move(direction) {
        this.currentIndex = (this.currentIndex + direction + this.items.length) % this.items.length;
        this.inner.style.transform = `translateX(-${this.currentIndex * this.itemWidth}%)`;
    }
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
        const carousel = new Carousel(carouselElement);
        
        // Add click handlers for navigation
        document.querySelectorAll('.carousel-nav button').forEach((button, index) => {
            button.addEventListener('click', () => {
                carousel.move(index === 0 ? -1 : 1);
            });
        });
    }
});

function flyToLocation(coordinates) {
    map.flyTo({
        center: coordinates,
        zoom: 12,
        essential: true
    });
}
