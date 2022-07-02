import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { Text, Link, Container } from '@nextui-org/react'
import { useLoaderData } from 'remix'

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
  return json({ project })
}

export default function ProjectPage() {
  const data = useLoaderData()
  const { project }: { project: Record<string, any> } = data

  return (
    <Container>
      <Text h1>{project.name}</Text>
      <Link
        icon
        block
        color="primary"
        href={`https://${project.targets.production.alias[0]}`}
        target="_blank"
      >
        {project.targets.production.alias[0]}
      </Link>
      <pre>{JSON.stringify(project, null, 2)}</pre>
    </Container>
  )
}
