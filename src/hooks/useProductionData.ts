import { useState, useEffect } from 'react';

// Interfaces based on the database columns
export interface MachineRecord {
    id: number;
    factory: string;
    location: string;
    machine: string;
    tonase_t: number | null;
    tonase_raw: string;
}

export interface OperatorRecord {
    id: number;
    name: string; // adjust field names as per actual DB schema
    [key: string]: any;
}

export interface SebangoRecord {
    id: number;
    detail_SEBANGO: string;
    detail_PART_NAME: string;
    detail_PART_NO: string;
    detail_MODEL: string;
    detail_MATERIAL: string;
    detail_CAVITY: number;
    detail_CT_GENTANI: number;
    detail_WEIGHT_GENTANI: number;
    detail_RUNNER_GENTANI: number;
    [key: string]: any;
}

export interface SebangoDetail {
    sebango: string;
    partName: string;
    partNo: string;
    model: string;
    material: string;
    pcsMold: number;
    cycleTimeGentanI: number;
    partWeightGentanI: number;
    runnerWeightGentanI: number;
}

export function useProductionData() {
    const [data, setData] = useState<MachineRecord[]>([]);
    const [operators, setOperators] = useState<OperatorRecord[]>([]);
    const [sebangoData, setSebangoData] = useState<SebangoRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [machinesRes, operatorsRes, sebangoRes] = await Promise.all([
                    fetch('http://127.0.0.1:5000/api/machines'),
                    fetch('http://127.0.0.1:5000/api/operators'),
                    fetch('http://127.0.0.1:5000/api/sebango')
                ]);

                if (!machinesRes.ok) throw new Error('Failed to fetch machines data');
                if (!operatorsRes.ok) throw new Error('Failed to fetch operators data');
                if (!sebangoRes.ok) throw new Error('Failed to fetch sebango data');

                const machinesData = await machinesRes.json();
                const operatorsData = await operatorsRes.json();
                const sebangoParsed = await sebangoRes.json();

                setData(machinesData);
                setOperators(operatorsData);
                setSebangoData(sebangoParsed);
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || 'Error connecting to database');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Compute derived states from 'data'
    // Distinct factories
    const factories = Array.from(new Set(data.map(item => item.factory))).filter(Boolean).sort();

    // Map of factory -> array of machines
    const machinesByFactory: Record<string, string[]> = {};
    data.forEach((item) => {
        if (!item.factory || !item.machine) return;
        if (!machinesByFactory[item.factory]) {
            machinesByFactory[item.factory] = [];
        }
        if (!machinesByFactory[item.factory].includes(item.machine)) {
            machinesByFactory[item.factory].push(item.machine);
        }
    });

    // Map of "Factory|Machine" -> Tonase
    const tonaseMap: Record<string, string> = {};
    data.forEach((item) => {
        if (!item.factory || !item.machine) return;
        const key = `${item.factory}|${item.machine}`;
        if (!tonaseMap[key] || item.tonase_raw) {
            tonaseMap[key] = item.tonase_raw || '-';
        }
    });

    // Sebango Processing
    const sortedSebango = [...sebangoData].sort((a, b) => {
        const idA = a.detail_ID ?? a.id ?? 0;
        const idB = b.detail_ID ?? b.id ?? 0;
        return Number(idA) - Number(idB);
    });

    const sebangoOptions = sortedSebango.map(item => item.detail_SEBANGO).filter(Boolean);
    const sebangoDetails: Record<string, SebangoDetail> = {};

    sortedSebango.forEach(item => {
        if (!item.detail_SEBANGO) return;
        sebangoDetails[item.detail_SEBANGO] = {
            sebango: item.detail_SEBANGO,
            partName: item.detail_PART_NAME || "-",
            partNo: item.detail_PART_NO || "-",
            model: item.detail_MODEL || "-",
            material: item.detail_MATERIAL || "-",
            pcsMold: item.detail_CAVITY || 0,
            cycleTimeGentanI: item.detail_CT_GENTANI || 0,
            partWeightGentanI: item.detail_WEIGHT_GENTANI || 0,
            runnerWeightGentanI: item.detail_RUNNER_GENTANI || 0,
        }
    });

    return {
        factories,
        machinesByFactory,
        tonaseMap,
        operators,
        sebangoOptions,
        sebangoDetails,
        loading,
        error
    };
}
