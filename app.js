const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  // 处理图片上传请求
  const file = req.file;
  if (!file) {
    res.status(400).send("没有选择图片");
    return;
  }

  // 图片上传成功
  const imageUrl = `http://localhost:9998/uploads/${file.filename}`;
  res.status(200).json({ imageUrl });
});

app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(`${__dirname}/uploads/${filename}`);
});

// 获取所有图片
app.get("/images", (req, res) => {
  const imageDir = path.join(__dirname, "uploads");
  const imageFiles = fs.readdirSync(imageDir);
  let images = imageFiles.filter((file) => {
    const extname = path.extname(file).toLowerCase();
    return extname === ".jpg" || extname === ".jpeg" || extname === ".png";
  });
  images = images.map(
    (filename) => `http://localhost:9998/uploads/${filename}`
  );
  res.status(200).json({ images });
});

app.listen(9998, () => {
  console.log("图片上传服务已启动");
});
