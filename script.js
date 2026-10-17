/* --- Portal JavaScript --- */
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const startBtn = document.querySelector('.hero .btn');
  const navLinks = document.querySelectorAll('.nav a');
  const gameCards = document.querySelectorAll('.game-card');

  // Initialize quiz from portal
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      // Hide hero section, show game area
      const hero = document.querySelector('.hero');
      const gameSection = document.querySelector('#game-section');

      if (hero) hero.style.display = 'none';
      if (gameSection) {
        gameSection.style.display = 'block';
        // Focus first element in game
        const firstFocusable = gameSection.querySelector('button, input');
        if (firstFocusable) firstFocusable.focus();
      }
    });
  }

  // Nav link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Game card interactions
  gameCards.forEach(card => {
    card.addEventListener('click', function () {
      const title = this.querySelector('.game-card-info h3').textContent;
      // Simple feedback on card click
      const stats = this.querySelector('.game-card-stats');
      if (stats) {
        stats.style.color = '#ff6b35';
        setTimeout(() => {
          stats.style.color = '#b0b0b0';
        }, 1500);
      }
      // In a full version, this would navigate to the selected game
      console.log(`Selected game: ${title}`);
    });
  });

  // Keyboard navigation accessibility
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // Close any open modals/dialogs - reset to portal view
      const hero = document.querySelector('.hero');
      const gameSection = document.querySelector('#game-section');
      if (gameSection && gameSection.style.display !== 'none') {
        gameSection.style.display = 'none';
        if (hero) hero.style.display = 'block';
      }
    }
  });
});