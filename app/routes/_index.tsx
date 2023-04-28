import type {
	LoaderArgs,
	SerializeFrom,
	V2_HtmlMetaDescriptor,
} from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import { UAParser } from "ua-parser-js"
import * as Popover from "@radix-ui/react-popover"
import logoUrl from "~/assets/logo.svg"
import * as React from "react"
import { getChangelogs, getLatestRelease } from "~/services/github.server"
import { compileMdToHtml } from "~/utils/marked.server"
import clsx from "clsx"

export function meta(): V2_HtmlMetaDescriptor[] {
	return [
		{ title: "rosqlite" },
		{
			name: "description",
			content: "Just a read only SQLite viewer, because why not?",
		},
	]
}

export async function loader({ request, context }: LoaderArgs) {
	const ua = request.headers.get("user-agent") ?? undefined
	let osNameAsDefault = UAParser(ua).os.name
	if (
		!(
			osNameAsDefault === "Windows" ||
			osNameAsDefault === "Linux" ||
			osNameAsDefault === "macOS"
		)
	) {
		osNameAsDefault = undefined
	}

	const [latestRelease, changelogs] = await Promise.all([
		getLatestRelease(context.GITHUB_PAT, osNameAsDefault),
		getChangelogs(context.GITHUB_PAT),
	])

	return {
		latestRelease,
		changelogs: changelogs.map((changelog) => ({
			...changelog,
			content: compileMdToHtml(changelog.content),
		})),
	}
}

export default function Index() {
	const { latestRelease, changelogs } = useLoaderData<typeof loader>()
	console.log(changelogs[0].content)

	return (
		<>
			<div className='relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0'>
				<Glow />

				<div className='relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]'>
					<div className='mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:flex-col lg:before:flex-1 lg:before:pt-6'>
						<div className='pb-16 pt-20 sm:pb-20 sm:pt-32 lg:py-20'>
							<div className='relative'>
								<Link
									to='/'
									className='inline-flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-8'
								>
									<img src={logoUrl} alt='RoSQLite logo' className='h-12' />
								</Link>

								<h1 className='font-display mt-14 text-4xl/tight font-extrabold text-gray-12'>
									Read-only <br />
									<span className='font-medium text-primary-12'>
										{" "}
										SQLite data viewer
									</span>
								</h1>
								<p className='mt-4 text-sm/6 font-medium text-gray-12'>
									If you need to view{" "}
									<span className='font-semibold italic'>SQLite</span> data in a
									read-only mode,{" "}
									<span className='font-semibold italic'>RoSQLite</span> is the
									tool for you. It has a beautiful interface that makes browsing
									data easy and enjoyable.
								</p>

								<div className='mt-6'>
									<DownloadButtonGroup />

									<div className='mt-2 text-sm text-primary-12'>
										<span>Latest published version </span>
										<a
											href={latestRelease.tagUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='font-bold underline decoration-primary-7 underline-offset-2 hover:decoration-primary-8'
										>
											{latestRelease.tag}
										</a>
									</div>
								</div>
							</div>
						</div>

						<div className='flex flex-1 items-end pb-4 lg:pb-6'>
							<GithubLink />
						</div>
					</div>
				</div>
			</div>
			<div className='relative flex-auto'>
				<Timeline />

				<main className='space-y-20 py-20 sm:space-y-32 sm:py-32'>
					{changelogs.map((changelog) => (
						<Changelog key={changelog.tag} {...changelog} />
					))}
				</main>
			</div>
		</>
	)
}

type ChangelogProps = SerializeFrom<typeof loader>["changelogs"][number]
function Changelog({
	name,
	tag,
	tagUrl,
	content,
	publishedAt,
}: ChangelogProps) {
	let heightRef = React.useRef<HTMLDivElement>(null)
	let [heightAdjustment, setHeightAdjustment] = React.useState(0)

	React.useEffect(() => {
		let observer = new window.ResizeObserver(() => {
			let domRect = heightRef.current?.getBoundingClientRect()
			if (domRect) {
				let nextMultipleOf8 = 8 * Math.ceil(domRect.height / 8)
				setHeightAdjustment(nextMultipleOf8 - domRect.height)
			}
		})

		if (heightRef.current) {
			observer.observe(heightRef.current)
		}

		return () => {
			observer.disconnect()
		}
	}, [])

	return (
		<article
			id={tag}
			className='scroll-mt-16'
			style={{ paddingBottom: `${heightAdjustment}px` }}
		>
			<div ref={heightRef}>
				<ChangelogHeader tag={tag} publishedAt={publishedAt} />

				<ContentWrapper className='typography'>
					<h2 className='mt-8 text-xl/8 font-semibold'>
						<Link to={`#${tag}`}>{name}</Link>
					</h2>

					<div dangerouslySetInnerHTML={{ __html: content }} />
				</ContentWrapper>
			</div>
		</article>
	)
}

function ChangelogHeader({
	tag,
	publishedAt,
}: Pick<ChangelogProps, "tag" | "publishedAt">) {
	return (
		<header className='relative mb-10 xl:mb-0'>
			<div className='pointer-events-none absolute left-[max(-0.5rem,calc(50%-18.625rem))] top-0 z-50 flex h-4 items-center justify-end gap-x-2 lg:left-0 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] xl:h-8'>
				<Link to={`#${tag}`} className='inline-flex'>
					<FormattedDate
						publishedAt={publishedAt ?? ""}
						className='hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-gray-12'
					/>
				</Link>
				<svg
					width='15'
					height='15'
					viewBox='0 0 15 15'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					className='text-gray-12 lg:-mr-3.5 xl:mr-0'
					aria-hidden='true'
				>
					<path d='M6 11L6 4L10.5 7.5L6 11Z' fill='currentColor'></path>
				</svg>
			</div>
			<ContentWrapper>
				<div className='flex'>
					<Link to={`#${tag}`} className='inline-flex'>
						<FormattedDate
							publishedAt={publishedAt ?? ""}
							className='text-2xs/4 font-medium text-gray-12 xl:hidden'
						/>
					</Link>
				</div>
			</ContentWrapper>
		</header>
	)
}

function ContentWrapper({
	children,
	className,
	...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className='mx-auto max-w-7xl px-6 lg:flex lg:px-8'>
			<div className='lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32'>
				<div
					className={clsx(
						"mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto",
						className
					)}
					{...props}
				>
					{children}
				</div>
			</div>
		</div>
	)
}

function FormattedDate({
	publishedAt,
	...props
}: { publishedAt: string } & React.TimeHTMLAttributes<HTMLTimeElement>) {
	const publishedAtDate = new Date(publishedAt)

	return (
		<time dateTime={publishedAtDate.toISOString()} {...props}>
			{new Intl.DateTimeFormat("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			}).format(publishedAtDate)}
		</time>
	)
}

function DownloadButtonGroup() {
	const { latestRelease } = useLoaderData<typeof loader>()

	return (
		<div className='flex flex-col justify-between gap-y-2 xs:flex-row'>
			<a
				href={latestRelease.download.default.url}
				className='rounded border border-gray-7 px-2.5 py-1.5 text-center text-sm font-semibold text-primary-12 transition-colors hover:border-gray-8 hover:bg-gray-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-8 active:bg-gray-5'
				download
			>
				Download for {latestRelease.download.default.os}
			</a>

			<Popover.Root>
				<Popover.Trigger className='group inline-flex max-w-fit items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-semibold text-primary-12 transition-colors hover:bg-gray-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-8 active:bg-gray-5 data-[state=open]:bg-gray-6'>
					Other platform
					<svg
						width='15'
						height='15'
						viewBox='0 0 15 15'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M4 6H11L7.5 10.5L4 6Z'
							fill='currentColor'
							aria-hidden='true'
						/>
					</svg>
				</Popover.Trigger>

				<Popover.Portal>
					<Popover.Content
						align='end'
						sideOffset={4}
						className='animate-in z-50 min-w-fit rounded border bg-primary-3 p-2 shadow-md outline-none'
					>
						<ul className='space-y-1'>
							{latestRelease.download.others.map(({ name, url }) => (
								<li key={name}>
									<a
										href={url}
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex w-full rounded px-2 py-1 text-gray-12 hover:bg-primary-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-8 active:bg-primary-5'
									>
										{name}
									</a>
								</li>
							))}
						</ul>
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>
		</div>
	)
}

function GithubLink() {
	return (
		<a
			href='https://github.com/jodygeraldo/rosqlite'
			target='_blank'
			rel='noopener noreferrer'
			className='group inline-flex items-center gap-1.5 rounded bg-primary-3 px-2 py-1 text-sm font-medium text-primary-12 transition-colors hover:bg-primary-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-8 active:bg-primary-5'
		>
			<svg
				width='15'
				height='15'
				viewBox='0 0 15 15'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				className='text-primary-9 transition-colors group-hover:text-primary-10'
			>
				<path
					d='M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z'
					fill='currentColor'
					fillRule='evenodd'
					clipRule='evenodd'
				/>
			</svg>
			Open-source on Github
		</a>
	)
}

function Glow() {
	let id = React.useId()

	return (
		<div className='absolute inset-0 -z-10 overflow-hidden bg-gray-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem]'>
			<svg
				className='absolute -bottom-48 left-[-40%] h-[80rem] w-[180%] lg:-right-40 lg:bottom-auto lg:left-auto lg:top-[-40%] lg:h-[180%] lg:w-[80rem]'
				aria-hidden='true'
			>
				<defs>
					<radialGradient id={`${id}-desktop`} cx='100%'>
						<stop offset='0%' stopColor='hsla(173, 99.8%, 31.1%, 0.930)' />
						<stop offset='53.95%' stopColor='hsla(172, 99.8%, 29.7%, 0.675)' />
						<stop offset='100%' stopColor='hsla(170, 99.3%, 28.7%, 0.448)' />
					</radialGradient>
					<radialGradient id={`${id}-mobile`} cy='100%'>
						<stop offset='0%' stopColor='hsla(173, 99.8%, 31.1%, 0.930)' />
						<stop offset='53.95%' stopColor='hsla(172, 99.8%, 29.7%, 0.675)' />
						<stop offset='100%' stopColor='hsla(170, 99.3%, 28.7%, 0.448)' />
					</radialGradient>
				</defs>
				<rect
					width='100%'
					height='100%'
					fill={`url(#${id}-desktop)`}
					className='hidden lg:block'
				/>
				<rect
					width='100%'
					height='100%'
					fill={`url(#${id}-mobile)`}
					className='lg:hidden'
				/>
			</svg>
			<div className='absolute inset-x-0 bottom-0 right-0 h-px bg-gray-2 mix-blend-overlay lg:left-auto lg:top-0 lg:h-auto lg:w-px' />
		</div>
	)
}

function Timeline() {
	return (
		<div className='pointer-events-none absolute inset-0 z-50 overflow-hidden lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-visible'>
			<svg
				className='absolute left-[max(0px,calc(50%-18.125rem))] top-0 h-full w-1.5 lg:left-full lg:ml-1 xl:left-auto xl:right-1 xl:ml-0'
				aria-hidden='true'
			>
				<defs>
					<pattern
						id='timeline-pattern'
						width='6'
						height='8'
						patternUnits='userSpaceOnUse'
					>
						<path d='M0 0H6M0 8H6' className='stroke-gray-8' fill='none' />
					</pattern>
				</defs>
				<rect width='100%' height='100%' fill={`url(#timeline-pattern)`} />
			</svg>
		</div>
	)
}
