(function() {
    function setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                if (!targetId) return;
                const input = document.getElementById(targetId);
                if (!input) return;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        });
    }

    window.setupPasswordToggles = setupPasswordToggles;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPasswordToggles);
    } else {
        setupPasswordToggles();
    }
})();
