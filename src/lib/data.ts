import Papa from 'papaparse';
import { Filters, Row } from './types';

const sanitizeString = (value: string | null | undefined): string => (value ?? '').toString().trim();

const parseNumber = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const clean = value.toString().trim();
  if (clean === '') {
    return null;
  }
  const num = Number(clean);
  return Number.isFinite(num) ? num : null;
};

const parseInteger = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const clean = value.toString().trim();
  if (clean === '') {
    return null;
  }
  const num = Number.parseInt(clean, 10);
  return Number.isFinite(num) ? num : null;
};

export async function loadData(): Promise<Row[]> {
  try {
    const response = await fetch('/dataset.csv', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Gagal memuat dataset (${response.status})`);
    }
    const text = await response.text();
    if (!text.trim()) {
      return [];
    }

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      dynamicTyping: false,
    });

    if (parsed.errors.length) {
      console.warn('Papa Parse warnings:', parsed.errors);
    }

    return parsed.data.map((record, index) => {
      const tahun = parseInteger(record.tahun);
      const lat = parseNumber(record.lat);
      const lon = parseNumber(record.lon);
      const tingkat_keparahan = parseNumber(record.tingkat_keparahan);
      const waktu_respon_jam = parseNumber(record.waktu_respon_jam);
      const hari_penyelesaian = parseNumber(record.hari_penyelesaian);

      return {
        id_insiden: sanitizeString(record.id_insiden) || `insiden-${index + 1}`,
        tanggal_insiden: sanitizeString(record.tanggal_insiden),
        tahun,
        tahun_akademik: sanitizeString(record.tahun_akademik),
        semester: sanitizeString(record.semester),
        provinsi: sanitizeString(record.provinsi),
        lat,
        lon,
        sektor_pendidikan: sanitizeString(record.sektor_pendidikan),
        kategori_besar: sanitizeString(record.kategori_besar),
        jenis_insiden: sanitizeString(record.jenis_insiden),
        lokasi: sanitizeString(record.lokasi),
        peran_pelaku: sanitizeString(record.peran_pelaku),
        tingkat_keparahan,
        status_kasus: sanitizeString(record.status_kasus),
        waktu_respon_jam,
        hari_penyelesaian,
        catatan: sanitizeString(record.catatan),
      };
    });
  } catch (error) {
    console.error('Kesalahan saat memuat dataset', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Gagal memuat dataset');
  }
}

export function unique<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

export function applyFilters(rows: Row[], filters: Filters): Row[] {
  const {
    sektor,
    provinsi,
    kategori,
    status,
    tahun,
    severityMin,
    severityMax,
    search,
  } = filters;

  const normalizedSearch = search.trim().toLowerCase();

  return rows.filter((row) => {
    if (sektor.length && !sektor.includes(row.sektor_pendidikan)) {
      return false;
    }

    if (provinsi.length && !provinsi.includes(row.provinsi)) {
      return false;
    }

    if (kategori.length && !kategori.includes(row.kategori_besar)) {
      return false;
    }

    if (status.length && !status.includes(row.status_kasus)) {
      return false;
    }

    if (tahun.length) {
      if (row.tahun === null || !tahun.includes(row.tahun)) {
        return false;
      }
    }

    const severity = row.tingkat_keparahan;
    if (typeof severity === 'number') {
      if (severity < severityMin || severity > severityMax) {
        return false;
      }
    } else if (severityMin > 1 || severityMax < 5) {
      return false;
    }

    if (normalizedSearch) {
      const haystack = `${row.jenis_insiden} ${row.peran_pelaku} ${row.lokasi}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });
}
