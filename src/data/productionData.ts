// ── Factory → Machine mapping ──────────────────────────────────────────
export const FACTORIES = ["Factory 2", "Factory 3", "Factory 4"] as const;

export const MACHINES_BY_FACTORY: Record<string, string[]> = {
    "Factory 2": Array.from({ length: 8 }, (_, i) => `Mesin ${i + 1}`),
    "Factory 3": Array.from({ length: 14 }, (_, i) => `Mesin ${i + 1}`),
    "Factory 4": Array.from({ length: 14 }, (_, i) => `Mesin ${i + 1}`),
};

// ── Tonase per machine (keyed "Factory|Machine") ──────────────────────
// Update these values with real tonnage data
const ton = (t: number) => `${t} T`;

export const TONASE_MAP: Record<string, string> = {
    // Factory 2
    "Factory 2|Mesin 1": ton(2500), "Factory 2|Mesin 2": ton(2500),
    "Factory 2|Mesin 3": ton(1800), "Factory 2|Mesin 4": ton(1800),
    "Factory 2|Mesin 5": ton(1300), "Factory 2|Mesin 6": ton(1300),
    "Factory 2|Mesin 7": ton(850), "Factory 2|Mesin 8": ton(850),
    // Factory 3
    "Factory 3|Mesin 1": ton(2500), "Factory 3|Mesin 2": ton(2500),
    "Factory 3|Mesin 3": ton(1800), "Factory 3|Mesin 4": ton(1800),
    "Factory 3|Mesin 5": ton(1300), "Factory 3|Mesin 6": ton(1300),
    "Factory 3|Mesin 7": ton(1000), "Factory 3|Mesin 8": ton(1000),
    "Factory 3|Mesin 9": ton(850), "Factory 3|Mesin 10": ton(850),
    "Factory 3|Mesin 11": ton(650), "Factory 3|Mesin 12": ton(650),
    "Factory 3|Mesin 13": ton(450), "Factory 3|Mesin 14": ton(450),
    // Factory 4
    "Factory 4|Mesin 1": ton(2500), "Factory 4|Mesin 2": ton(2500),
    "Factory 4|Mesin 3": ton(1800), "Factory 4|Mesin 4": ton(1800),
    "Factory 4|Mesin 5": ton(1300), "Factory 4|Mesin 6": ton(1300),
    "Factory 4|Mesin 7": ton(1000), "Factory 4|Mesin 8": ton(1000),
    "Factory 4|Mesin 9": ton(850), "Factory 4|Mesin 10": ton(850),
    "Factory 4|Mesin 11": ton(650), "Factory 4|Mesin 12": ton(650),
    "Factory 4|Mesin 13": ton(450), "Factory 4|Mesin 14": ton(450),
};

// ── Shifts ─────────────────────────────────────────────────────────────
export const SHIFTS = ["Siang", "Malam"] as const;

// ── Operators (sample — replace with real names) ──────────────────────
export const OPERATORS = [
    "Ahmad Fauzi",
    "Budi Santoso",
    "Cahyo Wibowo",
    "Dedi Kurniawan",
    "Eko Prasetyo",
    "Fajar Hidayat",
    "Gunawan Setiawan",
    "Hendra Wijaya",
] as const;

// ── Sebango codes per machine (keyed "Factory|Machine") ───────────────
// Sample data — replace with real codes
export const SEBANGO_BY_MACHINE: Record<string, string[]> = {
    "Factory 2|Mesin 1": ["UO-0030-BLCK", "UO-0031-WHTE", "UO-0032-GREY"],
    "Factory 2|Mesin 2": ["UO-0040-BLCK", "UO-0041-RDXX"],
    "Factory 2|Mesin 3": ["UO-0050-BLCK"],
    "Factory 2|Mesin 4": ["UO-0060-BLCK", "UO-0061-SLVR"],
    "Factory 2|Mesin 5": ["UO-0070-BLCK"],
    "Factory 2|Mesin 6": ["UO-0080-BLCK", "UO-0081-WHTE"],
    "Factory 2|Mesin 7": ["UO-0090-BLCK"],
    "Factory 2|Mesin 8": ["UO-0100-BLCK"],
    "Factory 3|Mesin 1": ["UO-0110-BLCK", "UO-0111-WHTE"],
    "Factory 3|Mesin 2": ["UO-0120-BLCK"],
    "Factory 3|Mesin 3": ["UO-0130-BLCK", "UO-0131-GREY"],
    "Factory 3|Mesin 4": ["UO-0140-BLCK"],
    "Factory 3|Mesin 5": ["UO-0150-BLCK"],
    "Factory 3|Mesin 6": ["UO-0160-BLCK", "UO-0161-RDXX"],
    "Factory 3|Mesin 7": ["UO-0170-BLCK"],
    "Factory 3|Mesin 8": ["UO-0180-BLCK"],
    "Factory 3|Mesin 9": ["UO-0190-BLCK"],
    "Factory 3|Mesin 10": ["UO-0200-BLCK"],
    "Factory 3|Mesin 11": ["UO-0210-BLCK"],
    "Factory 3|Mesin 12": ["UO-0220-BLCK"],
    "Factory 3|Mesin 13": ["UO-0230-BLCK"],
    "Factory 3|Mesin 14": ["UO-0240-BLCK"],
    "Factory 4|Mesin 1": ["UO-0250-BLCK", "UO-0251-WHTE"],
    "Factory 4|Mesin 2": ["UO-0260-BLCK"],
    "Factory 4|Mesin 3": ["UO-0270-BLCK"],
    "Factory 4|Mesin 4": ["UO-0280-BLCK", "UO-0281-SLVR"],
    "Factory 4|Mesin 5": ["UO-0290-BLCK"],
    "Factory 4|Mesin 6": ["UO-0300-BLCK"],
    "Factory 4|Mesin 7": ["UO-0310-BLCK"],
    "Factory 4|Mesin 8": ["UO-0320-BLCK"],
    "Factory 4|Mesin 9": ["UO-0330-BLCK"],
    "Factory 4|Mesin 10": ["UO-0340-BLCK"],
    "Factory 4|Mesin 11": ["UO-0350-BLCK"],
    "Factory 4|Mesin 12": ["UO-0360-BLCK"],
    "Factory 4|Mesin 13": ["UO-0370-BLCK"],
    "Factory 4|Mesin 14": ["UO-0380-BLCK"],
};

// ── Sebango detail info ───────────────────────────────────────────────
export interface SebangoDetail {
    sebango: string;
    partName: string;
    partNo: string;
    model: string;
    material: string;
    pcsMold: number;
    cycleTimeGentanI: number;
    partWeightGentanI: number;
}

// Sample data — replace with real details
export const SEBANGO_DETAILS: Record<string, SebangoDetail> = {
    "UO-0030-BLCK": {
        sebango: "UO-0030-BLCK",
        partName: "GRILLE, RADIATOR",
        partNo: "53111-0K750",
        model: "660A",
        material: "ASA S210B4-0256K",
        pcsMold: 1,
        cycleTimeGentanI: 66,
        partWeightGentanI: 867,
    },
    "UO-0031-WHTE": {
        sebango: "UO-0031-WHTE",
        partName: "COVER, BUMPER FRONT",
        partNo: "52119-0K950",
        model: "660A",
        material: "PP GF20 T20",
        pcsMold: 1,
        cycleTimeGentanI: 72,
        partWeightGentanI: 1240,
    },
    "UO-0032-GREY": {
        sebango: "UO-0032-GREY",
        partName: "PANEL, INSTRUMENT",
        partNo: "55301-0K010",
        model: "660A",
        material: "PPE+PA GF30",
        pcsMold: 1,
        cycleTimeGentanI: 85,
        partWeightGentanI: 2150,
    },
    "UO-0040-BLCK": {
        sebango: "UO-0040-BLCK",
        partName: "GARNISH, DOOR",
        partNo: "75710-0K020",
        model: "770B",
        material: "ABS HI",
        pcsMold: 2,
        cycleTimeGentanI: 45,
        partWeightGentanI: 320,
    },
    "UO-0041-RDXX": {
        sebango: "UO-0041-RDXX",
        partName: "LENS, TAIL LAMP",
        partNo: "81561-0K210",
        model: "770B",
        material: "PMMA V920",
        pcsMold: 2,
        cycleTimeGentanI: 38,
        partWeightGentanI: 185,
    },
};

// Fallback detail for codes without explicit data
export const DEFAULT_DETAIL: SebangoDetail = {
    sebango: "-",
    partName: "DATA BELUM TERSEDIA",
    partNo: "-",
    model: "-",
    material: "-",
    pcsMold: 0,
    cycleTimeGentanI: 0,
    partWeightGentanI: 0,
};

export function getSebangoDetail(code: string): SebangoDetail {
    return SEBANGO_DETAILS[code] ?? { ...DEFAULT_DETAIL, sebango: code };
}
