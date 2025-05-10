import { getLang } from "@/lib/lang"
import { getDictionary } from "../../dictionaries"
import { ProjectClientPage } from "../../../../components/project/project-client-page"

export default async function ProjectPage() {
  const lang = await getLang()
  const t = await getDictionary(lang)

  return <ProjectClientPage dictionary={t} />
}
