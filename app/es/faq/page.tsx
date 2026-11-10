import { FaqPage } from "@/components/faq-page";
import { getMessages, languageAlternates } from "@/components/i18n";
import { pageMetadata } from "@/components/site";

const { meta } = getMessages("es").faq;

export const metadata = pageMetadata({ ...meta, path: "/es/faq", locale: "es", languages: languageAlternates("/faq") });

export default function Faq() {
  return <FaqPage locale="es" />;
}
