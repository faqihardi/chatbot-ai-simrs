<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | PostgreSQL Extension
        |--------------------------------------------------------------------------
        */
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        /*
        |--------------------------------------------------------------------------
        | Vector Embedding Column
        |--------------------------------------------------------------------------
        */
        DB::statement("
            ALTER TABLE chunk_dokumen
            ADD COLUMN embedding vector(3072)
        ");

        DB::statement("
            CREATE INDEX chunk_dokumen_pending_embedding_idx
            ON chunk_dokumen (id) WHERE embedding IS NULL
        ");

        /*
        |--------------------------------------------------------------------------
        | Bersihkan Index Redundan
        |--------------------------------------------------------------------------
        */
        DB::statement("DROP INDEX IF EXISTS chunk_dokumen_dokumen_id_index");

        /*
        |--------------------------------------------------------------------------
        | JSONB GIN Index
        |--------------------------------------------------------------------------
        */
        DB::statement("
            CREATE INDEX chunk_dokumen_metadata_idx
            ON chunk_dokumen
            USING GIN(metadata)
        ");

        /*
        |--------------------------------------------------------------------------
        | Partial Unique Index
        |--------------------------------------------------------------------------
        | Satu slot hanya boleh memiliki satu booking aktif
        */
        DB::statement("
            CREATE UNIQUE INDEX one_active_booking_per_slot
            ON booking(slot_id)
            WHERE status = 'terjadwal'
        ");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS one_active_booking_per_slot");
        DB::statement("DROP INDEX IF EXISTS chunk_dokumen_metadata_idx");
        DB::statement("
            CREATE INDEX chunk_dokumen_dokumen_id_index
            ON chunk_dokumen(dokumen_id)
        ");
        DB::statement("
            ALTER TABLE chunk_dokumen
            DROP COLUMN IF EXISTS embedding
        ");
        DB::statement("DROP INDEX IF EXISTS chunk_dokumen_pending_embedding_idx");
    }
};