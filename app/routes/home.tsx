import { redirect } from "react-router";

export function loader() {
  return redirect("/table");
}

export default function Home() {
  return null;
}
