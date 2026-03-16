import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Factory } from "lucide-react";

type RawKinerjaRow = {
  factory: string;
  act_total?: number | string;
  act_ok?: number | string;
  act_weight?: number | string;
  ok_rasio?: number | string;
  efisiensi?: number | string;
  budomari?: number | string;
};

export interface KinerjaData {
  factory: string;
  factory_output: number;
  ok: number;
  ok_ratio: number;
  efisiensi: number;
  budomari: number;
}

interface KinerjaPabrikProps {
  currentDate: Date;
}

const API_BASE_URL = "http://localhost:5000";

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const groupRawRows = (rows: RawKinerjaRow[]): KinerjaData[] => {
  const map = new Map<
    string,
    {
      factory_output: number;
      ok: number;
      efisiensiWeightedSum: number;
      budomariWeightedSum: number;
      totalActWeight: number;
      totalActTotal: number;
    }
  >();

  for (const row of rows) {
    const factory = String(row.factory || "Unknown").toUpperCase();

    const actTotal = toNumber(row.act_total);
    const actOk = toNumber(row.act_ok);
    const actWeight = toNumber(row.act_weight);
    const efisiensi = toNumber(row.efisiensi);
    const budomari = toNumber(row.budomari);

    if (!map.has(factory)) {
      map.set(factory, {
        factory_output: 0,
        ok: 0,
        efisiensiWeightedSum: 0,
        budomariWeightedSum: 0,
        totalActWeight: 0,
        totalActTotal: 0,
      });
    }

    const item = map.get(factory)!;

    item.factory_output += actTotal;
    item.ok += actOk;
    item.efisiensiWeightedSum += efisiensi * actTotal;
    item.totalActTotal += actTotal;

    item.budomariWeightedSum += budomari * actWeight;
    item.totalActWeight += actWeight;
  }

  return Array.from(map.entries())
    .map(([factory, item]) => {
      const ok_ratio =
        item.factory_output > 0 ? (item.ok / item.factory_output) * 100 : 0;

      const efisiensi =
        item.totalActTotal > 0
          ? item.efisiensiWeightedSum / item.totalActTotal
          : 0;

      const budomari =
        item.totalActWeight > 0
          ? item.budomariWeightedSum / item.totalActWeight
          : 0;

      return {
        factory,
        factory_output: item.factory_output,
        ok: item.ok,
        ok_ratio,
        efisiensi,
        budomari,
      };
    })
    .sort((a, b) => a.factory.localeCompare(b.factory));
};

const normalizeResponse = (res: any): KinerjaData[] => {
  const candidate =
    Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.result)
          ? res.result
          : Array.isArray(res?.rows)
            ? res.rows
            : [];

  if (candidate.length === 0) return [];

  const alreadyAggregated =
    candidate[0] &&
    typeof candidate[0] === "object" &&
    "factory_output" in candidate[0] &&
    "ok" in candidate[0];

  if (alreadyAggregated) {
    return candidate.map((row: any) => ({
      factory: String(row.factory || "Unknown").toUpperCase(),
      factory_output: toNumber(row.factory_output),
      ok: toNumber(row.ok),
      ok_ratio: toNumber(row.ok_ratio),
      efisiensi: toNumber(row.efisiensi),
      budomari: toNumber(row.budomari),
    }));
  }

  return groupRawRows(candidate as RawKinerjaRow[]);
};

export const KinerjaPabrik = ({ currentDate }: KinerjaPabrikProps) => {
  const [data, setData] = useState<KinerjaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKinerja();
  }, [currentDate]);

  const fetchKinerja = async () => {
    setLoading(true);
    setError(null);

    try {
      const month = format(currentDate, "yyyy-MM");

      const response = await fetch(`${API_BASE_URL}/api/prodata/kinerja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const res = await response.json();
      const normalized = normalizeResponse(res);

      console.log("Kinerja response raw:", res);
      console.log("Kinerja response normalized:", normalized);

      setData(normalized);
    } catch (err) {
      console.error("Failed to load kinerja pabrik:", err);
      setError("Gagal memuat data kinerja pabrik");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("id-ID").format(num);

  const formatPercent = (num: number) => `${num.toFixed(2)}%`;

  const getFactoryColor = (factoryName: string) => {
    switch (factoryName.toUpperCase()) {
      case "F1":
        return "text-[#2ea2f8] bg-[#2ea2f8]/10";
      case "F2":
        return "text-[#22c55e] bg-[#22c55e]/10";
      case "F3":
        return "text-[#8b5cf6] bg-[#8b5cf6]/10";
      case "F4":
        return "text-[#f59e0b] bg-[#f59e0b]/10";
      default:
        return "text-white/70 bg-white/5";
    }
  };

  return (
    <div className="bg-[#26292c] bg-opacity-[0.85] rounded-[16px] p-5 border border-white/5 shadow-lg flex flex-col mt-4">
      <h3 className="text-white font-bold text-[15px] tracking-wide mb-4">
        Kinerja Pabrik
      </h3>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ea2f8]" />
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-400 text-sm">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-[12px] text-white/70 font-medium whitespace-nowrap">
                  Factory
                </th>
                <th className="pb-3 text-right text-[12px] text-white/70 font-medium whitespace-nowrap">
                  Factory Output
                </th>
                <th className="pb-3 text-right text-[12px] text-white/70 font-medium whitespace-nowrap pl-4">
                  OK
                </th>
                <th className="pb-3 text-right text-[12px] text-white/70 font-medium whitespace-nowrap pl-4">
                  OK Ratio
                </th>
                <th className="pb-3 text-right text-[12px] text-white/70 font-medium whitespace-nowrap pl-4">
                  Efisiensi
                </th>
                <th className="pb-3 text-right text-[12px] text-white/70 font-medium whitespace-nowrap pl-4">
                  Budomari
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => {
                const colors = getFactoryColor(row.factory);

                return (
                  <tr
                    key={row.factory}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${colors}`}>
                          <Factory className="w-4 h-4" />
                        </div>
                        <span className="text-white/90 text-[13px]">
                          {row.factory}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-white/90 text-[13px]">
                        {formatNumber(row.factory_output)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-white/90 text-[13px]">
                        {formatNumber(row.ok)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-white/90 text-[13px]">
                        {formatPercent(row.ok_ratio)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <span className="text-white/90 text-[13px]">
                        {formatPercent(row.efisiensi)}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-[#203a30] text-[#22c55e] border border-[#22c55e]/20 text-[12px]">
                        {formatPercent(row.budomari)}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-white/50 text-sm"
                  >
                    Belum ada data produksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};