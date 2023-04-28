import { createRequestHandler } from "@remix-run/cloudflare"
import * as build from "../build"

let remixHandler: ReturnType<typeof createRequestHandler>

export const onRequest: PagesFunction<Env> = (context) => {
	const { ASSETS: _, ...env } = context.env

	if (!remixHandler) {
		remixHandler = createRequestHandler(build, env.ENVIRONMENT)
	}

	return remixHandler(context.request, env)
}
