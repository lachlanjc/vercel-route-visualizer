import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "@nextui-org/react";
import { useLoaderData } from "remix";

interface Project {
  id: string;
  name: string;
}

export default function Index() {
  const navigate = useNavigate();
  const data = useLoaderData();
  const { projects }: { projects: Array<Project> } = data;
  console.log(data, projects);

  return (
    <Dropdown
    //   onSelectionChange={(value: string) =>
    //     navigate(`/${value}`, { replace: true })
    //   }
    >
      <Dropdown.Button flat>Project</Dropdown.Button>
      <Dropdown.Menu aria-label="Projects">
        {projects.map((project) => (
          <Dropdown.Item key={project.id}>{project.name}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
