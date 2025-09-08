import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const hundredsRouter = createTRPCRouter({
  generateLargeTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .mutation(async ({ input }) => {
      const client = await pool.connect();
      const numRows = 100_000;
      const chunkSize = 25000;

      try {
        await client.query("BEGIN");
        const tableId = input.tableId;

        // 1️⃣ Fetch columns and their types
        const { rows: columns } = await client.query(
          `SELECT id, type FROM airtable_columns WHERE "tableId" = $1`,
          [tableId]
        );

        if (columns.length === 0) {
          throw new Error("No columns found for this table");
        }

        // 2️⃣ Insert rows and cell_values in chunks
        for (let start = 1; start <= numRows; start += chunkSize) {
          const end = Math.min(start + chunkSize - 1, numRows);

          // Insert rows in chunk
          const { rows: insertedRows } = await client.query(
            `INSERT INTO airtable_rows ("tableId")
             SELECT $1 FROM generate_series(1, $2)
             RETURNING id`,
            [tableId, end - start + 1]
          );

          const rowIds = insertedRows.map((r) => r.id);

          // Insert cell values using SQL only
          for (const col of columns) {
            await client.query(
              `INSERT INTO airtable_cell_values ("tableId", "rowId", "columnId", "value")
               SELECT $1, r.id, $2,
                 CASE $3
                   WHEN 'text' THEN to_jsonb(substr(md5(random()::text), 1, 8))
                   WHEN 'number' THEN to_jsonb(floor(random() * 1000)::int)
                 END
               FROM unnest($4::int[]) AS r(id)`,
              [tableId, col.id, col.type, rowIds]
            );
          }

          console.log(`Inserted rows ${start} - ${end}`);
        }

        await client.query("COMMIT");
        return { success: true };
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        throw new Error("Failed to generate large table");
      } finally {
        client.release();
      }
    }),
});
