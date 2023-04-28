import { marked } from "marked"

function compileMdToHtml(content: string) {
	return marked.parse(content)
}

export { compileMdToHtml }
