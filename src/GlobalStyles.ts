
export const globalStyles = `
  body {
    /* Define CSS variables for light mode (default) */
    --background-color: #F0F0F0;
    --text-color: #333333;
    
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  .dark body {
    /* Override CSS variables for dark mode */
    --background-color: #001F3F;
    --text-color: #FFFFFF;
  }
`;
