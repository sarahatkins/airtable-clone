import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";

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

        // Fetch columns and their types
        const { rows: columns } = await client.query(
          `SELECT id, type FROM airtable_columns WHERE "tableId" = $1`,
          [tableId],
        );

        if (columns.length === 0) {
          throw new Error("No columns found for this table");
        }

        //  Insert rows and cell_values in chunks
        for (let start = 1; start <= numRows; start += chunkSize) {
          const end = Math.min(start + chunkSize - 1, numRows);

          // Insert rows in chunk
          const { rows: insertedRows } = await client.query(
            `INSERT INTO airtable_rows ("tableId")
             SELECT $1 FROM generate_series(1, $2)
             RETURNING id`,
            [tableId, end - start + 1],
          );

          const rowIds = insertedRows.map((r) => r.id);

          // Insert cell values
          for (const col of columns) {
            const values = rowIds.map(() => {
              if (col.type === "number") {
                return faker.number.int({ min: 1, max: 1000 });
              }
              return faker.lorem.word();
            });

            await client.query(
              `INSERT INTO airtable_cell_values ("tableId", "rowId", "columnId", "value", "type")
              SELECT $1, r.id, $2, r.value::jsonb, $3::text
              FROM unnest($4::int[], $5::text[]) AS r(id, value)`,
              [
                tableId,
                col.id,
                col.type,
                rowIds,
                values.map((v) => JSON.stringify(v)),
              ],
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
