import type { LinkDescriptor } from "@remix-run/cloudflare"
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import tailwindUrl from "./tailwind.css"

declare module "@remix-run/cloudflare" {
	export interface AppLoadContext extends Env {}
}

export function links(): LinkDescriptor[] {
	return [
		{
			rel: "icon",
			type: "image/png",
			sizes: "96x96",
			href: "/favicon-96x96.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/favicon-32x32.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/favicon-16x16.png",
		},
		{
			rel: "preload",
			href: "/fonts/Inter-italic.var.woff2",
			as: "font",
			type: "font/woff2",
			crossOrigin: "anonymous",
		},
		{
			rel: "preload",
			href: "/fonts/Inter-roman.var.woff2",
			as: "font",
			type: "font/woff2",
			crossOrigin: "anonymous",
		},
		{ rel: "preload", href: tailwindUrl, as: "style" },
		{ rel: "stylesheet", href: tailwindUrl },
	]
}

export default function App() {
	return (
		<html lang='en' className='h-full antialiased'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width,initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className='flex min-h-full flex-col bg-gray-2'>
				<Outlet />
				<ScrollRestoration /> z
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
