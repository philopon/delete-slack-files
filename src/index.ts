import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";

import Axios from "axios";

import { TEAM_ID, CLIENT_ID, CLIENT_SECRET, SESSION_SECRET } from "../config.json";

const API_BASE = "https://slack.com/api";

const app = express();

app.use(session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(bodyParser.json());
app.use("/static", express.static("static"));

app.get("/", (req, res) => {
    if (req.session === undefined) {
        throw Error("BUG: no session");
    }

    if (req.session.token) {
        res.redirect("/static");
    } else {
        return res.redirect(
            `https://slack.com/oauth/authorize?client_id=${
                CLIENT_ID
            }&scope=files:read,files:write:user&team=${TEAM_ID}`
        );
    }
});

app.get("/auth", async (req, res) => {
    if (req.session === undefined) {
        throw Error("BUG: no session");
    }

    const code = req.query.code;
    const response = await Axios.get(`${API_BASE}/oauth.access`, {
        params: { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code },
    });
    req.session.token = response.data.access_token;
    res.redirect("/static");
});

app.get("/files.list", async (req, res) => {
    if (req.session === undefined) {
        throw Error("BUG: no session");
    }
    const token = req.session.token;
    if (token === undefined) {
        return res.send({ ok: false, error: "no token" });
    }

    const ts_to = Date.now() / 1000 - 30 * 24 * 3600;
    const response = await Axios.get(`${API_BASE}/files.list`, {
        params: { token, count: 1000, ts_to },
    });
    res.send(response.data);
});

app.post("/files.delete", async (req, res) => {
    if (req.session === undefined) {
        throw Error("BUG: no session");
    }
    const token = req.session.token;
    if (token === undefined) {
        return res.send({ ok: false, error: "no token" });
    }

    const file = req.body.id;

    const response = await Axios.get(`${API_BASE}/files.delete`, { params: { token, file } });
    res.send(response.data);
});

app.listen(8080, () => {
    console.log("start");
});
