import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { Text, Link, Card, Tree, Page } from '@geist-ui/core'
import { useLoaderData } from 'remix'
import type { TreeFile } from '@geist-ui/core/esm/tree'

interface Project {
  id: string
  name: string
}

export const loader: LoaderFunction = async ({ params }) => {
  const project = await fetch(
    `https://api.vercel.com/v9/projects/${params.projectId}`,
    { headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` } }
  ).then((res) => res.json())
  if (!project || project.error) {
    throw new Response('Project not found.', { status: 404 })
  }
  const deploymentList: Array<{ uid: string }> = await fetch(
    `https://api.vercel.com/v6/deployments?target=production&state=READY&projectId=${params.projectId}`,
    { headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` } }
  )
    .then((res) => res.json())
    .then((data) => data.deployments) // .slice(0, 2))
  const deployments = await Promise.all(
    deploymentList.map((deploy) =>
      fetch(`https://api.vercel.com/v6/deployments/${deploy.uid}/files`, {
        headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
      })
        .then((res) => res.json())
        // .then((data) => console.log({ [deploy.uid]: data }) || data)
        .then((files) => ({
          ...deploy,
          files: transformFileTree(files[files.length - 1]),
        }))
    )
  )
  return json({ project, deployments })
}

type Files = { children: Array<Record<string, any>> }
function transformFileTree(files: Files): Array<TreeFile> {
  console.log(JSON.stringify(files, null, 2))
  return (files.children ?? [])
    .filter(
      (node) =>
        ![
          '404',
          '500',
          '__NEXT',
          '.png',
          '.svg',
          '.jpg',
          '.gif',
          '.webmanifest',
          '.fallback',
        ].includes(node.name)
    )
    .map((node) => {
      //   debugger
      //   return {
      //     type: 'file' as 'file',
      //     name: node.name.toString() as string,
      //   }
      if (node.type === 'directory' && node.children.length > 0) {
        return {
          name: node.name.toString() as string,
          type: 'directory' as 'directory',
          children: transformFileTree(node as Files),
        }
      } else {
        return {
          name: `/${node.name === 'index' ? '' : node.name}`,
          type: 'file' as 'file',
        }
      }
    })
}

const rtf = new Intl.RelativeTimeFormat('en', {
  localeMatcher: 'best fit', // other values: "lookup"
  numeric: 'always', // other values: "auto"
  style: 'long', // other values: "short" or "narrow"
})
function getDaysAgo(fromDate: number) {
  const diff = Math.floor(
    (fromDate - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  return rtf.format(diff, 'day')
}

export default function ProjectPage() {
  const data = useLoaderData()
  const {
    project,
    deployments,
  }: { project: Record<string, any>; deployments: Array<Record<string, any>> } =
    data
  console.log(deployments.map((deploy) => deploy.files))

  return (
    <Page>
      <Link
        icon
        block
        href={`https://${project.targets.production.alias[0]}`}
        target="_blank"
        style={{ float: 'right' }}
      >
        {project.targets.production.alias[0]}
      </Link>
      <Text h1>{project.name}</Text>
      {/* <pre>{JSON.stringify(project, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(deployments, null, 2)}</pre> */}
      <article
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          alignItems: 'start',
          gap: 24,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        }}
      >
        {deployments.map((deploy) => (
          <Card
            width="100%"
            key={deploy.uid}
            style={{ minWidth: 320, scrollSnapAlign: 'start' }}
          >
            {/* <pre>{JSON.stringify(deploy, null, 2)}</pre> */}
            <Tree
              value={deploy.files}
              onClick={(value) => window.open(`https://${deploy.url}${value}`)}
            />
            <Card.Footer>
              <Text style={{ marginRight: 'auto' }}>
                {getDaysAgo(deploy.createdAt)}
              </Text>
              <Link
                color
                icon
                target="_blank"
                href={deploy.inspectorUrl}
                style={{ marginRight: 8 }}
              >
                Inspect
              </Link>
              <Link color icon target="_blank" href={'https://' + deploy.url}>
                Open
              </Link>
            </Card.Footer>
          </Card>
        ))}
      </article>
    </Page>
  )
}

export function ErrorBoundary({ error }) {
  console.error(error)
  return <Text color="error">Oh no, something went wrong</Text>
}
