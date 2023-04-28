/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	future: {
		unstable_dev: {
			appServerPort: 8788,
			rebuildPollIntervalMs: 500,
			port: 3001,
		},
		unstable_postcss: true,
		unstable_tailwind: true,
		v2_errorBoundary: true,
		v2_meta: true,
		v2_routeConvention: true,
		v2_normalizeFormMethod: true,
	},
	ignoredRouteFiles: ['**/.*'],
	publicPath: '/build/',
	serverConditions: ['worker'],
	serverMainFields: ['browser', 'module', 'main'],
	serverModuleFormat: 'esm',
	serverPlatform: 'neutral',
	serverDependenciesToBundle: ['@remix-run/react'],
	serverMinify: true,
}
