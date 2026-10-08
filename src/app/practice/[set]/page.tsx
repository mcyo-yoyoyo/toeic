import { PracticeSetPage } from "./practice-set";

export function generateStaticParams() {
  return ["vocab", "part5", "part6", "part7", "part7-multi", "diagnostic"].map((set) => ({ set }));
}

export const dynamicParams = false;

export default function Page() {
  return <PracticeSetPage />;
}
