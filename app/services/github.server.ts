import { Octokit } from "@octokit/core"

const requestOptions = {
	owner: "jodygeraldo",
	repo: "rosqlite",
	headers: {
		"X-GitHub-Api-Version": "2022-11-28",
	},
}

function initOctokit(auth: string) {
	return new Octokit({ userAgent: "rosqlite-web", auth })
}

async function getLatestRelease(auth: string, osNameAsDefault = "Windows") {
	const octokit = initOctokit(auth)

	const { data } = await octokit.request(
		"GET /repos/{owner}/{repo}/releases/latest",
		requestOptions
	)

	const defaultDownloadAssets = data.assets.find(({ name }) => {
		if (osNameAsDefault === "Windows") {
			return name.endsWith(".msi")
		}

		if (osNameAsDefault === "macOS") {
			return name.endsWith(".app.tar.gz") || name.endsWith(".dmg")
		}

		return name.endsWith(".AppImage") || name.endsWith(".deb")
	})

	if (!defaultDownloadAssets) {
		throw new Error("Cannot find app assets")
	}

	const updaterSignatures: { name: string; content: string }[] = []
	const [firstPlatform, secondPlatform, thirdPlatform] = await Promise.all(
		data.assets
			.filter(({ name }) => name.includes(".sig"))
			.map(({ name, browser_download_url }) => {
				updaterSignatures.push({
					name,
					content: "",
				})
				return fetch(browser_download_url)
			})
	)

	updaterSignatures[0].content = await firstPlatform.text()
	updaterSignatures[1].content = await secondPlatform.text()
	updaterSignatures[2].content = await thirdPlatform.text()

	const otherDownloadAssets = data.assets
		.filter(
			({ name }) =>
				!(
					name === defaultDownloadAssets.name ||
					// updater files
					name.endsWith(".sig") ||
					name.endsWith(".msi.zip") ||
					name.endsWith(".AppImage.tar.gz")
				)
		)
		.map(({ name, browser_download_url }) => ({
			name,
			url: browser_download_url,
		}))

	return {
		tag: data.tag_name,
		tagUrl: data.html_url,
		publishedAt: data.published_at,
		download: {
			default: {
				name: osNameAsDefault,
				url: defaultDownloadAssets.browser_download_url,
			},
			others: otherDownloadAssets,
		},
		updaterSignatures,
	}
}

async function getChangelogs(auth: string) {
	const octokit = initOctokit(auth)

	const releases = await octokit.request(
		"GET /repos/{owner}/{repo}/releases",
		requestOptions
	)

	return releases.data
		.filter((release) => !(release.draft || release.prerelease))
		.map((release) => ({
			name: release.name,
			tag: release.tag_name,
			tagUrl: release.html_url,
			content: release.body ?? "",
			publishedAt: release.published_at,
		}))
}

export { getLatestRelease, getChangelogs }
