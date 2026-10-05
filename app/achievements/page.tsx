import { AchievementsPage } from "../../components/proof/AchievementsPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata(
  "Achievements — Praveen Kumar S",
  "Full verified achievement archive: championship wins, national finalist results, and merit records across software, AI, data and policy competitions.",
  "/achievements",
);

export default function AchievementsRoute() {
  return <AchievementsPage />;
}
