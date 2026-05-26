/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#070B14",
        panel: "rgba(15, 23, 42, 0.72)",
        beam: "#38BDF8",
        beacon: "#FBBF24",
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 189, 248, 0.18)",
        beacon: "0 0 50px rgba(251, 191, 36, 0.2)",
      },
      backgroundImage: {
        "radial-beam":
          "radial-gradient(circle at 15% 15%, rgba(56,189,248,0.22), transparent 34%), radial-gradient(circle at 85% 5%, rgba(168,85,247,0.18), transparent 28%), linear-gradient(180deg, #070B14 0%, #0B1120 48%, #070B14 100%)",
      },
    },
  },
  plugins: [],
};
