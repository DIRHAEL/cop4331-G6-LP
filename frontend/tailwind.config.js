/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      textColor: {
        validated: "rgba(255,255,255,0.5)",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      const newComponents = {
        ".custom-input": {
          "@apply box-border bg-black w-full h-[35px] appearance-none rounded-[4px] px-[10px] text-white leading-none focus:text-purple-400 shadow-[0_0_0_1px] outline-none":
            {},
        },
        ".input-heading": {
          "@apply flex-col md:flex-row flex items-baseline justify-between": {},
        },
        ".validated": {
          "@apply text-validated": {},
        },
      };

      addComponents(newComponents);
    },
  ],
};
