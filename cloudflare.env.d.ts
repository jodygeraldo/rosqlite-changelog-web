/// <reference types="@cloudflare/workers-types" />

interface Env {
	ENVIRONMENT?: "development"
	GITHUB_PAT: string
}
