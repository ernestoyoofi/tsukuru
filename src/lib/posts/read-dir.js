import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFolder = path.join(__dirname, "../../../posts");

let _folderExists = null;

function checkFolder() {
  if (_folderExists !== null) return _folderExists;
  try {
    _folderExists =
      fs.existsSync(postsFolder) && fs.lstatSync(postsFolder).isDirectory();
  } catch {
    _folderExists = false;
  }
  if (!_folderExists) {
    console.warn(
      `[WARN] On ${postsFolder}, don't have any post or directory, please crosscheck again`,
    );
  }
  return _folderExists;
}

export function readDir() {
  if (!checkFolder()) return [];
  return fs.readdirSync(postsFolder).filter((f) => f.endsWith(".mdx"));
}

export function readAllArticle() {
  const getList = readDir();
  return getList.map((fileName) => {
    try {
      const filePath = path.join(postsFolder, fileName);
      const content = fs.readFileSync(filePath, "utf-8");
      return [content.trim(), fileName];
    } catch {
      return ["", fileName];
    }
  });
}
