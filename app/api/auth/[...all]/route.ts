function demoAuthResponse(): Response {
  return Response.json({
    ok: true,
    mode: "demo",
    message: "Collageboard is using local demo auth for now.",
  });
}

export function GET(): Response {
  return demoAuthResponse();
}

export function POST(): Response {
  return demoAuthResponse();
}
