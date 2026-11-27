"use client";
import Header from "@/components/Header";
import { GRADES, gradeOf } from "@/lib/grade";
import { useReferences } from "@/lib/storage";

export default function GradePage() {
  const refs = useReferences();
  const current = refs === null ? null : gradeOf(refs).level;
  return (
    <main className="flex-1">
      <Header title="등급 기준" back="/mypage" />
      <div className="space-y-4 px-5 py-5">
        <p className="text-sm text-neutral-500">등록한 기준 옷에 따라 등급이 정해져요. 조건을 채우면 바로 다음 등급으로 올라가요.</p>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-900 text-xs text-neutral-500">
              <th className="w-12 py-2 font-semibold">단계</th>
              <th className="py-2 font-semibold">등급</th>
              <th className="py-2 font-semibold">조건</th>
            </tr>
          </thead>
          <tbody>
            {GRADES.map((g) => (
              <tr key={g.level} className={`border-b border-neutral-100 ${g.level === current ? "bg-emerald-50" : ""}`}>
                <td className="py-3 pl-1 text-neutral-500">{g.level}</td>
                <td className="whitespace-nowrap py-3 pr-2 font-semibold">
                  {g.name}
                  {g.level === current ? <span className="ml-1 text-xs font-normal text-emerald-600">현재</span> : null}
                </td>
                <td className="py-3 text-neutral-700">{g.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-neutral-400">등급 기준은 시안이라 바뀔 수 있어요.</p>
      </div>
    </main>
  );
}
