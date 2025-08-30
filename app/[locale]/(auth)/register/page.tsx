import { RegisterForm } from "@/components/register-form"
import { getDictionary } from "../../dictionaries"
import { getLang } from "@/lib/lang"

export default async function Page() {
  const lang = await getLang()
  const dictionary = await getDictionary(lang)
  
  return <RegisterForm dictionary={dictionary} />
}