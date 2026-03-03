const express = require('express');
const cors = require('cors');
const { loadModel: loadViT } = require('./services/vitInference');
const { loadModel: loadCNN } = require('./services/cnnInference');
const app = express();
const CNNRouter = require('./routes/cnn');
const ViTRouter = require('./routes/vit');

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use("/api/v1/cnn", CNNRouter);
app.use("/api/v1/vit", ViTRouter);


app.listen(3000, async () => {
    await Promise.all([loadViT(), loadCNN()]);
    console.log('Server is running on port 3000');
});