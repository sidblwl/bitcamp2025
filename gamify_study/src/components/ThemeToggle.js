import React from 'react';

// Button to toggle between light and dark mode
function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save preference
    document.body.className = newTheme;      // Update class on body
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '10px 16px',
        borderRadius: '8px',
        backgroundColor: theme === 'light' ? '#121212' : '#ffffff',
        color: theme === 'light' ? '#ffffff' : '#121212',
        border: 'none',
        cursor: 'pointer',
        position: 'absolute',
        top: '1rem',
        right: '1rem',
      }}
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}

export default ThemeToggle;
