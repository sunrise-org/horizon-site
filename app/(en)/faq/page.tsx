import { FaqPage } from "@/components/faq-page";
import { getMessages, languageAlternates } from "@/components/i18n";
import { pageMetadata } from "@/components/site";

const { meta } = getMessages("en").faq;

export const metadata = pageMetadata({ ...meta, path: "/faq", languages: languageAlternates("/faq") });

export default function Faq() {
  return <FaqPage locale="en" />;
}
