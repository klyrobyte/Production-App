import { useState, useEffect } from 'react';
import { secureFetch, decryptPayload } from '@/lib/api';

// Interfaces based on the database columns
export interface MachineRecord {
    id: number;
    factory: string;
    location: string;
    machine: string;
    tonase_t: number | null;
    tonase_raw: string;
}

export interface DeptRecord {
    ID: number;
    PROBLEM: string;
    DEPT: string;
    [key: string]: any;
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
    const [deptData, setDeptData] = useState<DeptRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDualSystem = async () => {
            // STEP 1: Fast local JSON load (Offline Support & Instant UX)
            try {
                const [machinesRes, operatorsRes, sebangoRes, deptRes] = await Promise.all([
                    fetch('/json/sheet1.json'),
                    fetch('/json/operator.json'),
                    fetch('/json/sebangodb.json'),
                    fetch('/json/dept.json')
                ]);

                if (machinesRes.ok && operatorsRes.ok && sebangoRes.ok && deptRes.ok) {
                    const machinesText = await machinesRes.text();
                    const operatorsText = await operatorsRes.text();
                    const sebangoText = await sebangoRes.text();
                    const deptText = await deptRes.text();

                    const machinesData = await decryptPayload(machinesText);
                    const operatorsData = await decryptPayload(operatorsText);
                    const sebangoParsed = await decryptPayload(sebangoText);
                    const deptParsed = await decryptPayload(deptText);

                    setData(machinesData);
                    setOperators(operatorsData);
                    setSebangoData(sebangoParsed);
                    setDeptData(deptParsed);
                    setLoading(false); // Instantly stop loading indicator!
                }
            } catch (err) {
                console.warn("Local JSON fallback data not found or failed decryption, waiting for DB...");
            }

            // STEP 2: Background Database Sync via secure API
            try {
                const [machinesData, operatorsData, sebangoParsed, deptParsed] = await Promise.all([
                    secureFetch('http://127.0.0.1:5000/api/machines'),
                    secureFetch('http://127.0.0.1:5000/api/operators'),
                    secureFetch('http://127.0.0.1:5000/api/sebango'),
                    secureFetch('http://127.0.0.1:5000/api/dept')
                ]);

                // Override UI silently with fresh DB data if available
                setData(machinesData);
                setOperators(operatorsData);
                setSebangoData(sebangoParsed);
                setDeptData(deptParsed);
                
                setLoading(false);
                setError(null);
            } catch (err: any) {
                console.error("Background sync with database failed. Offline JSON mode remains active:", err.message);
                // We do not set the global error state if the UI is already populated from JSON
                if (data.length === 0) {
                    setError('Error connecting securely to database, and no offline data was found.');
                    setLoading(false);
                }
            }
        };

        // We only fetch once on mount
        fetchDualSystem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const idA = a.detail_ID ?? a.detail_id ?? a.id ?? 0;
        const idB = b.detail_ID ?? b.detail_id ?? b.id ?? 0;
        return Number(idA) - Number(idB);
    });

    const sebangoOptions = sortedSebango.map(item => item.detail_SEBANGO || item.detail_sebango).filter(Boolean);
    const sebangoDetails: Record<string, SebangoDetail> = {};

    sortedSebango.forEach(item => {
        const sebangoName = item.detail_SEBANGO || item.detail_sebango;
        if (!sebangoName) return;
        sebangoDetails[sebangoName] = {
            sebango: sebangoName,
            partName: item.detail_PART_NAME || item.detail_part_name || "-",
            partNo: item.detail_PART_NO || item.detail_part_no || "-",
            model: item.detail_MODEL || item.detail_model || "-",
            material: item.detail_MATERIAL || item.detail_material || "-",
            pcsMold: item.detail_CAVITY || item.detail_cavity || 0,
            cycleTimeGentanI: item.detail_CT_GENTANI || item.detail_ct_gentani || 0,
            partWeightGentanI: item.detail_WEIGHT_GENTANI || item.detail_weight_gentani || 0,
            runnerWeightGentanI: item.detail_RUNNER_GENTANI || item.detail_runner_gentani || 0,
        }
    });

    // Dept Processing
    const deptOptions = [...deptData].map(item => ({
        problem: item.PROBLEM || item.problem,
        dept: item.DEPT || item.dept
    })).filter(item => item.problem);

    const clearError = () => setError(null);

    return {
        factories,
        machinesByFactory,
        tonaseMap,
        operators,
        sebangoOptions,
        sebangoDetails,
        deptOptions,
        loading,
        error,
        clearError
    };
}
