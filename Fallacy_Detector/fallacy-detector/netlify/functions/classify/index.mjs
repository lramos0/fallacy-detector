// netlify/functions/classify/index.mjs
export default async (req, context) => {
  const requestBody = await req.json();
  const accessKey = requestBody.accessKey;
  delete requestBody.accessKey;

  if (!accessKey) {
    return new Response(JSON.stringify({ error: "Missing access token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response = await fetch("https://dbc-28e35821-942c.cloud.databricks.com/serving-endpoints/fallacy-classifier/invocations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Databricks request failed" }), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  }

  const result = await response.json();

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

