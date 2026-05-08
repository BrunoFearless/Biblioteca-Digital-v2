// Page overlay + delayed navigation (cliente)
(function () {
    const overlay = document.createElement('div');
    overlay.id = 'pageOverlay';
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            setTimeout(() => overlay.classList.remove('visible'), 20);
        });
    });

    window.delayedNavigate = function (url) {
        overlay.classList.add('visible');
        setTimeout(() => {
            window.location.href = url;
        }, 700);
    };
})();
