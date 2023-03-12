const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const uploadFolder = './uploads';
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

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
  let cloneImages = JSON.parse(JSON.stringify(images))
  images = cloneImages.map(
    (filename) => `http://localhost:9998/uploads/${filename}`
  );
  const images_rn = cloneImages.map((filename) => `http:10.0.2.2:9998/uploads/${filename}`)
  res.status(200).json({ images, images_rn });
});

// 删除所有的图片
app.get('/deleteUploads', (req, res) => {
  const directory = 'uploads/';

  // 读取uploads目录下的所有文件和文件夹
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    // 遍历每个文件和文件夹，并删除
    for (const file of files) {
      const filePath = directory + file;
      // 如果是文件则直接删除
        fs.unlinkSync(filePath);
    }
    // 返回成功响应
    res.status(200).send('All uploads have been deleted.');
  });
});

app.listen(9998, () => {
  console.log("图片上传服务已启动");
});
