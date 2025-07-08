/**
 * EdgeOne Pages Function for performing BLAT searches using UCSC BLAT Service
 * Replicates the Python get_blat_data function functionality
 */

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    // Extract parameters from request body
    const { userSeq, type, db, output } = data;

    // Validate required parameters
    if (!userSeq || !type || !db || !output) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters. Required: userSeq, type, db, output",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate sequence input
    if (typeof userSeq !== "string" || userSeq.length === 0) {
      return new Response(
        JSON.stringify({
          error: "userSeq must be a non-empty string",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate type parameter
    const validTypes = [
      "DNA",
      "RNA",
      "protein",
      "translated%20RNA",
      "translated%20DNA",
    ];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate output parameter
    const validOutputs = [
      "json",
      "psl",
      "pslx",
      "axt",
      "maf",
      "sim4",
      "wublast",
      "blast",
      "blast8",
      "blast9",
    ];
    if (!validOutputs.includes(output)) {
      return new Response(
        JSON.stringify({
          error: `Invalid output format. Must be one of: ${validOutputs.join(", ")}`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Build UCSC BLAT URL with parameters
    const blatUrl = new URL("https://genome.ucsc.edu/cgi-bin/hgBlat");
    blatUrl.searchParams.set("userSeq", userSeq);
    blatUrl.searchParams.set("type", type);
    blatUrl.searchParams.set("db", db);
    blatUrl.searchParams.set("output", output);

    // Fetch data from UCSC BLAT service
    const response = await fetch(blatUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "EdgeOne-Pages-Function/1.0",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `UCSC BLAT service error: ${response.status} ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get the response text (BLAT returns HTML/text, not JSON)
    const responseText = await response.text();

    // Try to parse as JSON if possible, otherwise return as text
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      // If not JSON, return the raw text response
      parsedData = {
        raw_response: responseText,
        content_type: response.headers.get("content-type") || "text/html",
      };
    }

    return new Response(JSON.stringify(parsedData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const params = url.searchParams;

    // Extract query parameters
    const userSeq = params.get("userSeq");
    const type = params.get("type");
    const db = params.get("db");
    const output = params.get("output");

    // Validate required parameters
    if (!userSeq || !type || !db || !output) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters. Required: userSeq, type, db, output",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate sequence input
    if (userSeq.length === 0) {
      return new Response(
        JSON.stringify({
          error: "userSeq must be a non-empty string",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Build UCSC BLAT URL with parameters
    const blatUrl = new URL("https://genome.ucsc.edu/cgi-bin/hgBlat");
    blatUrl.searchParams.set("userSeq", userSeq);
    blatUrl.searchParams.set("type", type);
    blatUrl.searchParams.set("db", db);
    blatUrl.searchParams.set("output", output);

    // Fetch data from UCSC BLAT service
    const response = await fetch(blatUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "EdgeOne-Pages-Function/1.0",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `UCSC BLAT service error: ${response.status} ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get the response text (BLAT returns HTML/text, not JSON)
    const responseText = await response.text();

    // Try to parse as JSON if possible, otherwise return as text
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      // If not JSON, return the raw text response
      parsedData = {
        raw_response: responseText,
        content_type: response.headers.get("content-type") || "text/html",
      };
    }

    return new Response(JSON.stringify(parsedData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
