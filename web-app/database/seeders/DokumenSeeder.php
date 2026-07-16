<?php

namespace Database\Seeders;

use App\Models\Dokumen;
use App\Models\User;
use Illuminate\Database\Seeder;

class DokumenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin_cs')->first();

        $dokumenList = [
            [
                'judul' => 'Jadwal Operasional Layanan RS',
                'kategori' => 'layanan_spesialisasi',
                'sumber' => 'Observasi demo Techno Medic',
                'isi' => <<<TEXT
RS Techno Medic melayani kunjungan rawat jalan dengan jadwal sebagai berikut:
- Senin sampai Jumat: pukul 08:00 - 20:00
- Sabtu: pukul 09:00 - 17:00
- Minggu: pukul 09:00 - 14:00
- Hari libur nasional: pukul 09:00 - 14:00

Di luar jadwal tersebut, pasien dapat mengakses Layanan Darurat yang buka 24 jam setiap hari.
TEXT,
            ],
            [
                'judul' => 'Layanan Gawat Darurat & Kontak Penting',
                'kategori' => 'darurat_kontak',
                'sumber' => 'Observasi demo Techno Medic',
                'isi' => <<<TEXT
Layanan darurat RS Techno Medic tersedia 24 jam setiap hari. Tim medis siap menangani kondisi gawat darurat kapan saja.

Untuk kondisi darurat, hubungi Hotline: 119.

Layanan darurat dapat diakses langsung tanpa perlu mendaftar terlebih dahulu lewat prosedur rawat jalan biasa.
TEXT,
            ],
            [
                'judul' => 'SOP Pendaftaran Pasien Umum',
                'kategori' => 'administrasi_pendaftaran',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
Pasien baru yang ingin mendaftar sebagai pasien umum (non-BPJS) perlu membawa:
1. Kartu identitas (KTP/Kartu Keluarga)
2. Kartu berobat (jika sudah pernah berobat sebelumnya)

Pendaftaran dapat dilakukan langsung di loket pendaftaran pada jam operasional RS, atau melalui pendaftaran online.

Setelah pendaftaran selesai, pasien akan mendapatkan nomor antrean sesuai poli yang dituju dan dapat menunggu di ruang tunggu poli terkait.
TEXT,
            ],
            [
                'judul' => 'Daftar Poli dan Layanan Rawat Jalan',
                'kategori' => 'layanan_spesialisasi',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
RS Techno Medic menyediakan layanan rawat jalan di beberapa poli spesialisasi, di antaranya:
- Poli Penyakit Dalam (INT): penanganan penyakit dalam pada dewasa
- Poli Obstetri & Ginekologi (OBG): kesehatan kandungan dan reproduksi wanita
- Poli Anak (ANK): pemeriksaan dan tumbuh kembang anak
- Poli THT (THT): telinga, hidung, dan tenggorokan
- Poli Mata (MTA): pemeriksaan dan gangguan penglihatan
- Poli Gigi & Mulut (GGI): perawatan gigi umum

Pasien dapat memilih poli sesuai keluhan saat pendaftaran, atau berkonsultasi dengan petugas Customer Service jika belum yakin poli yang tepat.
TEXT,
            ],
            [
                'judul' => 'SOP Pendaftaran Pasien BPJS & Rujukan',
                'kategori' => 'administrasi_pendaftaran',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
Pasien BPJS yang ingin berobat ke RS Techno Medic wajib membawa dokumen berikut:
1. Kartu BPJS Kesehatan aktif
2. Surat rujukan dari FASKES tingkat 1 (Puskesmas/klinik terdaftar), kecuali untuk kondisi gawat darurat
3. Kartu identitas (KTP/Kartu Keluarga)

Rujukan berlaku sesuai masa aktif yang tertera pada surat rujukan. Jika rujukan sudah habis masa berlaku, pasien perlu memperbarui rujukan ke FASKES tingkat 1 terlebih dahulu sebelum dapat dilayani menggunakan BPJS.

Pasien tanpa rujukan tetap dapat berobat dengan skema pembayaran umum (non-BPJS).
TEXT,
            ],
            [
                'judul' => 'Jenis Pembayaran yang Diterima',
                'kategori' => 'pembayaran_klaim',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
RS Techno Medic menerima beberapa jenis metode pembayaran untuk layanan rawat jalan maupun rawat inap:
1. Umum (bayar langsung/tunai/non-tunai)
2. BPJS Kesehatan (dengan rujukan sesuai ketentuan)
3. Asuransi swasta rekanan (perlu konfirmasi kerja sama dengan pihak asuransi terkait sebelum tindakan)

Pasien disarankan mengonfirmasi jenis pembayaran saat mendaftar, agar proses administrasi berjalan lebih cepat.
TEXT,
            ],
            [
                'judul' => 'Prosedur Klaim BPJS/Asuransi',
                'kategori' => 'pembayaran_klaim',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
Untuk pasien yang menggunakan BPJS atau asuransi swasta rekanan, proses klaim dilakukan oleh pihak rumah sakit setelah pasien menyelesaikan perawatan.

Dokumen yang perlu disiapkan pasien untuk mendukung proses klaim:
1. Kartu BPJS/polis asuransi aktif
2. Surat rujukan (untuk BPJS)
3. Kartu identitas

Pasien tidak perlu mengurus klaim secara langsung ke BPJS/asuransi selama persyaratan dokumen di atas lengkap saat pendaftaran. Jika ada kendala klaim, pasien dapat menghubungi bagian VClaim/E-Klaim RS untuk bantuan lebih lanjut.
TEXT,
            ],
            [
                'judul' => 'Prosedur Pengaduan Pasien',
                'kategori' => 'darurat_kontak',
                'sumber' => 'Simulasi (belum ada dokumen resmi)',
                'isi' => <<<TEXT
Pasien atau keluarga pasien yang ingin menyampaikan keluhan terkait pelayanan dapat mengajukan aduan melalui:
1. Chatbot Customer Service RS Techno Medic
2. Loket Customer Service secara langsung

Aduan akan dicatat dan diberikan nomor tiket untuk keperluan pelacakan status. Tim terkait akan menindaklanjuti aduan sesuai kategori dan tingkat urgensi.

Pengadu dapat mengecek status aduan kapan saja menggunakan nomor tiket yang diberikan.
TEXT,
            ],
        ];

        foreach ($dokumenList as $dokumen) {
            Dokumen::create([
                ...$dokumen,
                'aktif' => true,
                'checksum' => hash('sha256', $dokumen['isi']),
                'versi' => 1,
                'dibuat_oleh' => $admin?->id,
            ]);
        }
    }
}
