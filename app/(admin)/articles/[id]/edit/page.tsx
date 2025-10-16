/**
 * Edit Article Page
 */

import { EditArticlePage } from "@/pages/admin-articles";

export default function Page({ params }: { params: { id: string } }) {
  return <EditArticlePage articleId={params.id} />;
}
