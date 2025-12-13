import { NextResponse } from "next/server";
import POP3Client from "poplib";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  return new Promise((resolve) => {
    const client = new POP3Client(
      Number(process.env.POP_PORT),
      process.env.POP_HOST!,
      {
        tlserrs: false,
        enabletls: true,
        debug: false,
      }
    );

    client.on("error", (err) => {
      resolve(
        NextResponse.json(
          { error: "POP error", details: err.message },
          { status: 500 }
        )
      );
    });

    client.on("connect", () => {
      client.login(
        process.env.POP_USER!,
        process.env.POP_PASS!,
        (loginErr) => {
          if (loginErr) {
            resolve(
              NextResponse.json(
                { error: "Login failed", details: loginErr },
                { status: 401 }
              )
            );
            return;
          }

          client.stat((statErr, stat) => {
            if (statErr) {
              resolve(
                NextResponse.json(
                  { error: "Stat failed", details: statErr },
                  { status: 500 }
                )
              );
              return;
            }

            const total = stat.count;
            if (total === 0) {
              client.quit();
              resolve(
                NextResponse.json({
                  status: "No new emails",
                  count: 0,
                })
              );
              return;
            }

            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE!
            );

            let processed = 0;

            for (let i = 1; i <= total; i++) {
              client.retr(i, async (msgErr, rawMessage) => {
                processed++;

                if (!msgErr && rawMessage) {
                  await supabase.from("vendor_applications_inbox").insert({
                    raw_email: rawMessage,
                    received_at: new Date(),
                  });
                }

                if (processed === total) {
                  client.quit();
                  resolve(
                    NextResponse.json({
                      status: "Emails processed",
                      processed,
                    })
                  );
                }
              });
            }
          });
        }
      );
    });
  });
}
