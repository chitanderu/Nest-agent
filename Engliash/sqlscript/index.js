const fs = require("fs");
const readline = require("readline"); // 读取文件行
const iconv = require("iconv-lite"); // 转换编码
const { PrismaClient } = require("./generated/prisma/client"); // 数据库客户端
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({
  connectionString: "postgres://kx:59591468@localhost:5432/english", // 数据库连接字符串
});
const prisma = new PrismaClient({
  adapter: adapter,
});

// CSV行解析函数（处理引号内的逗号）
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// 解析tag字段，返回布尔字段对象
function parseTagToBoolean(tagValue) {
  const tags = tagValue
    ? tagValue.split(" ").filter((t) => t.trim() !== "")
    : [];

  return {
    zk: tags.includes("zk"),
    gk: tags.includes("gk"),
    cet4: tags.includes("cet4"),
    cet6: tags.includes("cet6"),
    ky: tags.includes("ky"),
    toefl: tags.includes("toefl"),
    ielts: tags.includes("ielts"),
    gre: tags.includes("gre"),
  };
}

// 读取CSV文件并插入数据库
async function readLargeCSV(filePath) {
  let lineCount = 0;
  let headers = [];
  let batch = [];
  const BATCH_SIZE = 2000; // 每2000条数据批量插入一次
  let totalInserted = 0;

  console.log("开始读取CSV文件并插入数据库...\n");

  try {
    // 创建读取流，使用 iconv-lite 转换 GBK 编码为 UTF-8
    const fileStream = fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream("gbk"));

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      lineCount++;

      if (lineCount === 1) {
        // 解析表头
        headers = line.split(",");
        console.log("表头字段:", headers);
        console.log("=".repeat(60));
        continue;
      }

      // 解析每一行数据
      const values = parseCSVLine(line);
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });

      // 解析tag字段，获取布尔字段
      const booleanFields = parseTagToBoolean(rowData.tag);

      // 构建数据库插入对象
      const wordData = {
        word: rowData.word || "",
        phonetic: rowData.phonetic || null,
        definition: rowData.definition || null,
        translation: rowData.translation || null,
        pos: rowData.pos || null,
        collins: rowData.collins || null,
        oxford: rowData.oxford || null,
        tag: rowData.tag || null,
        bnc: rowData.bnc || null,
        frq: rowData.frq || null,
        exchange: rowData.exchange || null,
        ...booleanFields, // 展开布尔字段
      };

      batch.push(wordData);

      // 批量插入
      if (batch.length >= BATCH_SIZE) {
        await prisma.wordBook.createMany({
          data: batch,
          skipDuplicates: true, // 跳过重复数据
        });
        totalInserted += batch.length;
        console.log(`已插入 ${totalInserted.toLocaleString()} 条数据...`);
        batch = [];
      }
    }

    // 插入剩余的数据
    if (batch.length > 0) {
      await prisma.wordBook.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalInserted += batch.length;
    }

    console.log("\n" + "=".repeat(60));
    console.log(
      `插入完成！总共处理 ${(lineCount - 1).toLocaleString()} 行数据`,
    );
    console.log(`成功插入 ${totalInserted.toLocaleString()} 条数据`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("错误:", error.message);
    throw new Error(`读取CSV文件失败: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

readLargeCSV("ecdict.csv");
