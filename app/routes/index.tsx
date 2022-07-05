import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { useNavigate } from 'react-router-dom'
import { Page, AutoComplete } from '@geist-ui/core'
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
    <Page>
      <AutoComplete
        placeholder="Select a project…"
        options={projects.map(({ id, name }) => ({ value: id, label: name }))}
        onSelect={(project: string) =>
          navigate(`/${project}`, { replace: false })
        }
        disableFreeSolo
      />
    </Page>
  )
}
