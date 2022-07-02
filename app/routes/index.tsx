import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from '@nextui-org/react'
import { useLoaderData } from 'remix'

interface Project {
  id: string
  name: string
}

export const loader: LoaderFunction = async () => {
  const projects = await fetch('https://api.vercel.com/v9/projects', {
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
  })
    .then((res) => res.json())
    .then((json) =>
      (json.projects ?? []).map((project: Record<string, string>) => {
        const { id, name } = project
        return { id, name }
      })
    )
  return json({ projects })
}

export default function Index() {
  const navigate = useNavigate()
  const data = useLoaderData()
  const { projects = [] }: { projects: Array<Project> } = data

  return (
    <Dropdown>
      <Dropdown.Button flat>Select a project…</Dropdown.Button>
      <Dropdown.Menu
        aria-label="Projects"
        selectionMode="single"
        selectedKeys={[projects[0].id]}
        onSelectionChange={(key) =>
          // @ts-expect-error set
          navigate(`/${key.values().next().value}`, { replace: true })
        }
      >
        {projects.map((project) => (
          <Dropdown.Item key={project.id}>{project.name}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
