import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Config = {
	content: ["./app/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					1: "hsl(165, 60.0%, 98.8%)",
					2: "hsl(169, 64.7%, 96.7%)",
					3: "hsl(169, 59.8%, 94.0%)",
					4: "hsl(169, 53.1%, 90.2%)",
					5: "hsl(170, 47.1%, 85.0%)",
					6: "hsl(170, 42.6%, 77.9%)",
					7: "hsl(170, 39.9%, 68.1%)",
					8: "hsl(172, 42.1%, 52.5%)",
					9: "hsl(173, 80.0%, 36.0%)",
					10: "hsl(173, 83.4%, 32.5%)",
					11: "hsl(174, 90.0%, 25.2%)",
					12: "hsl(170, 50.0%, 12.5%)",
				},
				gray: {
					1: "hsl(155, 30.0%, 98.8%)",
					2: "hsl(150, 16.7%, 97.6%)",
					3: "hsl(151, 10.6%, 95.2%)",
					4: "hsl(151, 8.8%, 93.0%)",
					5: "hsl(151, 7.8%, 90.8%)",
					6: "hsl(152, 7.2%, 88.4%)",
					7: "hsl(153, 6.7%, 85.3%)",
					8: "hsl(154, 6.1%, 77.5%)",
					9: "hsl(155, 3.5%, 55.5%)",
					10: "hsl(154, 2.8%, 51.7%)",
					11: "hsl(155, 3.0%, 43.0%)",
					12: "hsl(155, 24.0%, 9.0%)",
				},
			},
			fontSize: {
				"2xs": ".6875rem",
			},
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
			},
			screens: {
				xs: "414px",
			},
		},
	},
	plugins: [],
}

export default config
