const fs = require("fs");
const path = require("path");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const client = new S3Client({
    region: "auto",
    endpoint: "https://0c7132005edce076d78d95ed5cab9444.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET = "fer-models";

// Bucket key → local destination (relative to this file)
const MODELS = [
    { key: "CNN_FER.onnx",                  dest: "models/CNN/CNN_FER.onnx"                        },
    { key: "CNN_FER.onnx.data",             dest: "models/CNN/CNN_FER.onnx.data"                   },
    { key: "affectNet-7-emotions.onnx",     dest: "models/ViT/affectNet-7-emotions.onnx"           },
    { key: "affectNet-7-emotions.onnx.data",dest: "models/ViT/affectNet-7-emotions.onnx.data"      },
];

async function downloadFile(key, destRelative) {
    const destPath = path.join(__dirname, destRelative);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const command   = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    console.log(`⬇  Downloading ${key} → ${destRelative}`);

    const response = await axios({ url: signedUrl, method: "GET", responseType: "stream" });
    const writer   = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => { console.log(`✓  ${key}`); resolve(); });
        writer.on("error", reject);
    });
}

async function downloadAll() {
    for (const { key, dest } of MODELS) {
        await downloadFile(key, dest);
    }
    console.log("\nAll models downloaded.");
}

downloadAll().catch(console.error);
