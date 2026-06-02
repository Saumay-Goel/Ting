import express from "express";
export const snsBodyParser = express.text({
    type: ["text/plain", "application/json"],
});
export function parseSnsBody(req, _res, next) {
    if (typeof req.body === "string" && req.body.length) {
        try {
            req.body = JSON.parse(req.body);
        }
        catch {
            // Ignore invalid JSON
        }
    }
    next();
}
