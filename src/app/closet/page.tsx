import { redirect } from "next/navigation";

// 내 옷장은 마이페이지로 옮겼다. 예전 주소로 들어와도 마이페이지로 보낸다.
export default function ClosetPage() {
  redirect("/mypage");
}
