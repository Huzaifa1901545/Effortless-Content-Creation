document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const menu = document.querySelector('.menu');
    const overlay = document.querySelector('.overlay');
    const closeMenuButton = document.querySelector('.close-menu');

    hamburgerMenu.addEventListener('click', function() {
        document.body.classList.add('menu-active');
    });

    closeMenuButton.addEventListener('click', function() {
        document.body.classList.remove('menu-active');
    });

    overlay.addEventListener('click', function() {
        document.body.classList.remove('menu-active');
    });
});

function toggleMenu() {
    document.body.classList.toggle('menu-active');
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) { // Adjust the value as per your breakpoint
        document.body.classList.remove('menu-active');
        hamburgerMenu.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const texts = [
        "Future is here,",
        "Start Creating now."
    ];

    const speed = 100; // typing speed in milliseconds
    let lineIndex = 0;
    let charIndex = 0;
    const lineElements = [
        document.getElementById('line1'),
        document.getElementById('line2')
    ];

    function typeWriter() {
        if (lineIndex < texts.length) {
            let currentLine = texts[lineIndex];
            if (charIndex < currentLine.length) {
                lineElements[lineIndex].textContent += currentLine.charAt(charIndex);
                lineElements[lineIndex].classList.add('cursor');
                charIndex++;
                setTimeout(typeWriter, speed);
            } else {
                lineElements[lineIndex].classList.remove('cursor');
                lineIndex++;
                charIndex = 0;
                if (lineIndex < texts.length) {
                    setTimeout(typeWriter, speed);
                }
            }
        }
    }

    // Clear initial text content
    lineElements.forEach(el => el.textContent = '');

    // Start the typing animation
    typeWriter();
});

function updateNumbers() {
    const numbers = document.querySelectorAll('.num');
    numbers.forEach(num => {
        const originalValue = parseInt(num.getAttribute('data-val'));
        const newValue = originalValue + Math.floor(Math.random() * 101 - 50); // Random number between -50 and 50
        num.textContent = newValue;
    });
}

// Update numbers every 200 milliseconds (5 times per second)
setInterval(updateNumbers, 200);