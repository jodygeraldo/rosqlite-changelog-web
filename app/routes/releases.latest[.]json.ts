import type { LoaderArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getLatestRelease } from "~/services/github.server"

export async function loader({ context }: LoaderArgs) {
	const { tag, publishedAt, download, updaterSignatures } =
		await getLatestRelease(context.GITHUB_PAT, "Windows")

	const updater = {
		windows: download.default,
		linux: download.others.find(({ url }) => url.endsWith(".AppImage"))!,
		darwin: download.others.find(({ url }) => url.endsWith(".app.tar.gz"))!,
	}

	return json({
		version: tag,
		pub_date: publishedAt,
		platforms: {
			"darwin-x86_64": {
				signature: updaterSignatures.find(({ name }) =>
					name.includes(updater.darwin.name)
				)?.content,
				url: updater.darwin.url,
			},
			"linux-x86_64": {
				signature: updaterSignatures.find(({ name }) =>
					name.includes(updater.linux.name)
				)?.content,
				url: `${updater.linux.url}.tar.gz`,
			},
			"windows-x86_64": {
				signature: updaterSignatures.find(({ name }) =>
					name.includes(updater.windows.name)
				)?.content,
				url: `${updater.windows.url}.zip`,
			},
		},
	})
}
