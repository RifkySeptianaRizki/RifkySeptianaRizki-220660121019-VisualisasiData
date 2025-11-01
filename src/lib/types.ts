export type Row = {
  id_insiden: string;
  tanggal_insiden: string;
  tahun: number | null;
  tahun_akademik: string;
  semester: string;
  provinsi: string;
  lat: number | null;
  lon: number | null;
  sektor_pendidikan: string;
  kategori_besar: string;
  jenis_insiden: string;
  lokasi: string;
  peran_pelaku: string;
  tingkat_keparahan: number | null;
  status_kasus: string;
  waktu_respon_jam: number | null;
  hari_penyelesaian: number | null;
  catatan: string;
};

export type Filters = {
  sektor: string[];
  provinsi: string[];
  tahun: number[];
  kategori: string[];
  status: string[];
  severityMin: number;
  severityMax: number;
  search: string;
};

export const createDefaultFilters = (): Filters => ({
  sektor: [],
  provinsi: [],
  tahun: [],
  kategori: [],
  status: [],
  severityMin: 1,
  severityMax: 5,
  search: '',
});
