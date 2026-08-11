const SPREADSHEET_ID = "1-wKR79HyhLecFmHmIjlC4abIA6fF6fLDlyu7otsx8ME";

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Admin Dashboard - ตรวจติดตามการส่งข้อมูล PEA")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getMasterData() {
  const topicNames = {
    1: "สารจากประธานกรรมการการไฟฟ้าส่วนภูมิภาค",
    2: "สรุปข้อมูลทางการเงิน",
    3: "คณะกรรมการการไฟฟ้าส่วนภูมิภาค",
    4: "โครงสร้างการบริหารการไฟฟ้าส่วนภูมิภาค",
    5: "คณะผู้บริหารการไฟฟ้าส่วนภูมิภาค",
    6: "ทิศทางการดำเนินงาน",
    7: "วัตถุประสงค์เชิงยุทธศาสตร์และยุทธศาสตร์",
    8: "ประวัติความเป็นมา, วัตถุประสงค์ในการดำเนินงาน",
    9: "ผลิตภัณฑ์และบริการ",
    10: "ทุนและโครงสร้างผู้ถือหุ้น",
    11: "พื้นที่รับผิดชอบและสำนักงาน กฟภ.",
    12: "ปัจจัยที่มีผลกระทบต่อองค์กร",
    13: "ภาวะอุตสาหกรรมและแนวโน้มในอนาคต",
    14: "รายงานวิเคราะห์ผลการดำเนินงาน MD&A",
    15: "การบริหารจัดการด้านระบบไฟฟ้า",
    16: "· ด้านการยกระดับระบบไฟฟ้าด้วยเทคโนโลยีดิจิทัลโครงการด้านระบบไฟฟ้าอัจฉริยะ (Smart Grid)",
    17: "· ด้านการเชื่อมโยงลูกค้าด้วยเทคโนโลยีดิจิทัล",
    18: "· ด้านการปรับเปลี่ยนองค์กรสู่องค์กรสมัยใหม่",
    19: "· ด้านโครงสร้างพื้นฐานด้านดิจิทัล",
    20: "· ด้านการดำเนินธุรกิจดิจิทัล",
    21: "· การบริหารอัตรากำลัง และ ค่าใช้จ่ายเกี่ยวกับบุคลากร",
    22: "· การปรับปรุงโครงสร้างองค์กร",
    23: "· การบริหารผลการปฏิบัติงาน",
    24: "· การยกระดับความพึงพอใจและความผูกพันของบุคลากร",
    25: "· การส่งเสริมและพัฒนาบุคลากร",
    26: "· สร้างวัฒนธรรมแห่งการเรียนรู้",
    27: "การบริหารจัดการพัสดุ",
    28: "· กลุ่มบริการด้านไฟฟ้า",
    29: "· กลุ่มบริการด้านธุรกิจเกี่ยวเนื่อง",
    30: "· บริษัทในเครือ",
    31: "รางวัลแห่งความภาคภูมิใจ",
    32: "รายงานวิเคราะห์ฐานะการเงิน",
    33: "รายงานวิเคราะห์การดำเนินงานที่ไม่ใช่การเงิน (ซึ่งรวมถึงผลการดำเนินงานด้านการพัฒนาบุคลากร)",
    34: "การลงทุนที่สำคัญในปัจจุบันและอนาคต",
    35: "รายงานข้อมูลสำคัญ",
    36: "โครงสร้างและความรับผิดชอบของคณะกรรมการ กฟภ.",
    37: "รายชื่อคณะกรรมการ กฟภ.",
    38: "การแต่งตั้งคณะกรรมการ/คณะอนุกรรมการคณะย่อย",
    39: "นโยบายการกำหนดค่าตอบแทนของคณะกรรมการ กฟภ.",
    40: "สรุปเบี้ยประชุม ค่าตอบแทนรายเดือน และโบนัสประจำปี 2568 ของคณะกรรมการ กฟภ.",
    41: "ผู้บริหารการไฟฟ้าส่วนภูมิภาค",
    42: "นโยบายและการจ่ายค่าตอบแทนผู้บริหารระดับสูง",
    43: "การดำเนินงานด้านรายการที่เกี่ยวโยงกันของ กฟภ.",
    44: "· การกำกับดูแลกิจการที่ดี",
    45: "· การบริหารความเสี่ยง",
    46: "· การควบคุมภายใน",
    47: "· การกำกับดูแลและการปฏิบัติตามกฎระเบียบ",
    48: "การดำเนินงานด้านการบริหารจัดการผู้มีส่วนได้ส่วนเสีย",
    49: "ความรับผิดชอบต่อสังคมและสิ่งแวดล้อม",
    50: "การตรวจสอบภายใน",
    51: "รายงานคณะกรรมการบริหารความเสี่ยงและควบคุมภายในของ กฟภ.",
    52: "รายงานคณะกรรมการธรรมาภิบาลและการพัฒนาอย่างยั่งยืน",
    53: "รายงานคณะกรรมการตรวจสอบ ประจำปี 2568",
    54: "รายงานของผู้สอบบัญชี และงบการเงิน",
    55: "หมายเหตุประกอบงบการเงิน",
    56: "สรุปเปรียบเทียบข้อมูลในรอบ 10 ปี",
  };

  const deptTopics = {
    "PEA ENCOM": [9, 30],
    "ฝกต.": [17, 28],
    "ฝกง.": [2],
    "ฝกพ.": [50, 53],
    "ฝงป.": [2, 10, 32],
    "ฝดข.": [18, 19],
    "ฝนย.": [6, 7, 8, 11, 12, 14, 33, 35, 56],
    "ฝนศ.": [13, 17, 35],
    "ฝบบ.": [24],
    "ฝบค.": [5, 21, 23, 35, 41, 42],
    "ฝบย.": [31, 48, 49],
    "ฝบช.": [2, 21, 35, 42, 54, 55, 56],
    "ฝปด.": [18, 19],
    "ฝพป.": [4, 22],
    "ฝพธ.": [9, 20, 29],
    "ฝพบ.": [25, 26, 33],
    "ฝลอ.": [1, 3, 36, 37, 38, 39, 40],
    "ฝลส.": [43, 44, 45, 46, 47, 51, 52],
    "ฝวร.": [15, 16, 34],
    "ฝวห.": [27],
    "ฝสท.": [18, 19],
  };

  return { topicNames, deptTopics };
}

function getDashboardData(sortBy = "topic_first") {
  const master = getMasterData();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  // ฟังก์ชันช่วยแปลงค่าสถานะแบบยืดหยุ่น
  const parseBool = (val) => {
    return (
      val === true ||
      val === 1 ||
      val === "1" ||
      String(val).toUpperCase() === "TRUE"
    );
  };

  // 1. จัดกลุ่มการส่งข้อมูลใน Sheet แยกตาม key "topicId_dept"
  const groupedSubmissions = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const topicId =
      row[0] !== "" && row[0] !== null ? String(row[0]).trim() : "";
    const dept = String(row[1] || "").trim();

    if (topicId && dept) {
      const key = `${topicId}_${dept}`;
      if (!groupedSubmissions[key]) {
        groupedSubmissions[key] = [];
      }

      // ตรวจหา Drive URL
      let driveUrl = "";
      for (let c = 0; c < row.length; c++) {
        if (typeof row[c] === "string" && row[c].includes("drive.google.com")) {
          driveUrl = row[c];
          break;
        }
      }

      // แปลงเป็น Date Object เผื่อใช้ Sort ตามเวลาดิบ
      const rawDate = row[4] ? new Date(row[4]) : null;
      const isValidDate = rawDate && !isNaN(rawDate.getTime());

      groupedSubmissions[key].push({
        rowIndex: i + 1,
        correct: parseBool(row[2]), // Col C
        needEdit: parseBool(row[3]), // Col D
        rawTimestamp: isValidDate ? rawDate.getTime() : 0, // สำหรับใช้อ้างอิงเวลาใน Sort
        timestamp: isValidDate
          ? Utilities.formatDate(rawDate, "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss")
          : "-",
        note: row[5] || "",
        phone: row[6] || "-",
        acknowledged: parseBool(row[7]), // Col H
        driveUrl: driveUrl,
        kpoStatus: String(row[10] || "").trim(), // Col K
        kpoNote: String(row[11] || "").trim(), // Col L
      });
    }
  }

  // 2. Map รายการ Master
  const masterList = [];
  const topicNamesMap = master.topicNames || {};
  const deptTopicsMap = master.deptTopics || {};

  Object.keys(deptTopicsMap).forEach((deptName) => {
    const topicIds = deptTopicsMap[deptName];
    if (Array.isArray(topicIds)) {
      topicIds.forEach((id) => {
        const idStr = String(id).trim();
        const realName =
          topicNamesMap[id] || topicNamesMap[idStr] || `หัวข้อที่ ${idStr}`;

        masterList.push({
          topicId: idStr,
          dept: String(deptName).trim(),
          topicName: realName,
        });
      });
    }
  });

  // 3. ประกอบข้อมูล statusList
  let submittedCount = 0;

  let statusList = masterList.map((item) => {
    const itemTopicId = item.topicId;
    const itemDept = item.dept;

    const key = `${itemTopicId}_${itemDept}`;
    const submissions = groupedSubmissions[key] || [];

    // เรียงประวัติการส่งจาก ล่าสุด -> เก่าสุด (ตาม rowIndex)
    submissions.sort((a, b) => b.rowIndex - a.rowIndex);

    const isSubmitted = submissions.length > 0;
    if (isSubmitted) {
      submittedCount++;
    }

    const latest = isSubmitted ? submissions[0] : null;

    return {
      topicId: itemTopicId,
      dept: itemDept,
      topicName: item.topicName,
      isSubmitted: isSubmitted,
      latestSubmission: latest,
      versionHistory: submissions,
      totalVersions: submissions.length,

      // timestamp ล่าสุดสำหรับการเปรียบเทียบในข้อ 4
      lastTime: latest ? latest.rawTimestamp : 0,

      // สถานะ กปอ. ล่าสุด
      kpoStatus: latest ? latest.kpoStatus : "",
      kpoNote: latest ? latest.kpoNote : "",

      // คีย์สำรองเผื่อ Frontend ใช้
      id: itemTopicId,
      department: itemDept,
      title: item.topicName,
      name: item.topicName,
      status: isSubmitted ? "ส่งแล้ว" : "ยังไม่ส่ง",
    };
  });

  // 4. เงื่อนไขการเรียงลำดับข้อมูลตามพารามิเตอร์ sortBy
  statusList.sort((a, b) => {
    const numA = parseInt(a.topicId) || 0;
    const numB = parseInt(b.topicId) || 0;

    if (sortBy === "arrive_first") {
      // เอาคนที่ยังไม่ส่งไว้ล่างสุดเสมอ
      if (a.isSubmitted !== b.isSubmitted) {
        return a.isSubmitted ? -1 : 1;
      }
      // เรียงจากเวลาน้อยไปมาก (ส่งก่อนอยู่นบน)
      if (a.lastTime !== b.lastTime) {
        return a.lastTime - b.lastTime;
      }
      return numA - numB;
    } else if (sortBy === "arrive_last") {
      // เอาคนที่ยังไม่ส่งไว้ล่างสุดเสมอ
      if (a.isSubmitted !== b.isSubmitted) {
        return a.isSubmitted ? -1 : 1;
      }
      // เรียงจากเวลามากไปน้อย (ส่งล่าสุดขึ้นก่อน)
      if (a.lastTime !== b.lastTime) {
        return b.lastTime - a.lastTime;
      }
      return numA - numB;
    } else if (sortBy === "dept_first") {
      const deptCompare = a.dept.localeCompare(b.dept, "th");
      if (deptCompare !== 0) {
        return deptCompare;
      }
      return numA - numB;
    } else {
      // 'topic_first' (Default)
      if (numA !== numB) {
        return numA - numB;
      }
      return a.dept.localeCompare(b.dept, "th");
    }
  });

  // 5. รันเลข Row Number ใหม่ตามลำดับที่จัดเรียงแล้ว
  statusList = statusList.map((item, index) => {
    return {
      rowNum: index + 1,
      no: index + 1,
      ...item,
    };
  });

  const totalTasks = masterList.length;
  const deptList = Object.keys(deptTopicsMap).sort();

  return {
    summary: {
      totalTasks: totalTasks,
      submittedCount: submittedCount,
      pendingCount: totalTasks - submittedCount,
      percentage:
        totalTasks > 0 ? Math.round((submittedCount / totalTasks) * 100) : 0,
    },
    statusList: statusList,
    departments: deptList,
    currentSortBy: sortBy,
  };
}

function testGetDashboardData() {
  const res = getDashboardData("topic_first");
  Logger.log("=== ผลลัพธ์การทดสอบ ===");
  Logger.log("จำนวนรายการทั้งหมด: " + res.statusList.length);
  Logger.log("สรุปข้อมูล (Summary): " + JSON.stringify(res.summary));
  if (res.statusList.length > 0) {
    Logger.log("ตัวอย่างรายการแรก: " + JSON.stringify(res.statusList[0]));
  }
}

function testGetDashboardData2() {
  const result = getDashboardData(); // ไม่ต้องใส่ parameter จะได้ค่า 'topic_first'
  Logger.log(JSON.stringify(result, null, 2));
}
/**
 * ฟังก์ชันบันทึก / แก้ไข การตรวจงาน กปอ. ลง Col K และ Col L
 */
function updateInspectionStatus(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const rawData = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    // หา Row ล่าสุดของ topicId + dept นั้นๆ
    for (let i = rawData.length - 1; i >= 1; i--) {
      const rowTopic = String(rawData[i][0] || "").trim();
      const rowDept = String(rawData[i][1] || "").trim();
      if (
        rowTopic === String(data.topicId).trim() &&
        rowDept === String(data.dept).trim()
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: "ไม่พบบรรทัดข้อมูลใน Sheet" };
    }

    // บันทึกลง Column K (Col 11) และ Column L (Col 12)
    sheet.getRange(targetRowIndex, 11).setValue(data.kpoStatus || "");
    sheet.getRange(targetRowIndex, 12).setValue(data.kpoNote || "");

    return { success: true, message: "บันทึกการตรวจงานเรียบร้อยแล้ว" };
  } catch (err) {
    return { success: false, message: "เกิดข้อผิดพลาด: " + err.toString() };
  }
}

// บันทึกตรวจงานสำหรับเวอร์ชันนั้นๆ
function updateAdminReview(rowIndex, correct, needEdit, note, ack) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheets()[0];

  if (rowIndex && rowIndex > 1) {
    sheet.getRange(rowIndex, 3).setValue(correct); // ข้อมูลถูกต้อง
    sheet.getRange(rowIndex, 4).setValue(needEdit); // ข้อมูลมีต้องเเก้ไข
    sheet.getRange(rowIndex, 6).setValue(note); // หมายเหตุ
    sheet.getRange(rowIndex, 8).setValue(ack); // กปอ.รับทราบ
    return { success: true };
  } else {
    return { success: false, message: "ไม่พบบรรทัดที่ต้องการอัปเดต" };
  }
}

function testData() {
  Logger.log(JSON.stringify(getDashboardData()));
}
/**
 * ฟังก์ชันสร้างและแบ่งไฟล์ ZIP ออกเป็นหลาย Part เพื่อป้องกันขีดจำกัดขนาดไฟล์เกิน 50MB
 */
function downloadFilesAsZip() {
  const dashData = getDashboardData();
  const statusList = dashData.statusList || [];

  const parseBool = (val) => {
    return (
      val === true ||
      val === 1 ||
      val === "1" ||
      String(val).toUpperCase() === "TRUE"
    );
  };

  const token = ScriptApp.getOAuthToken();
  const dateStr = Utilities.formatDate(
    new Date(),
    "Asia/Bangkok",
    "yyyyMMdd_HHmmss",
  );

  // 1. ดึง Blob ไฟล์ทั้งหมดเตรียมไว้
  const fetchedFiles = [];
  let failCount = 0;

  statusList.forEach((item) => {
    if (
      item.isSubmitted &&
      item.latestSubmission &&
      item.latestSubmission.driveUrl
    ) {
      const latest = item.latestSubmission;
      const rawUrl = String(latest.driveUrl).trim();

      let fileId = "";
      const match =
        rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/id=([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/([a-zA-Z0-9_-]{25,})/);
      if (match) fileId = match[1] || match[0];

      if (fileId) {
        let fileBlob = null;
        try {
          const file = DriveApp.getFileById(fileId);
          fileBlob = file.getBlob();
        } catch (e1) {
          try {
            const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            const response = UrlFetchApp.fetch(downloadUrl, {
              headers: { Authorization: "Bearer " + token },
              muteHttpExceptions: true,
            });
            if (response.getResponseCode() === 200) {
              fileBlob = response.getBlob();
            }
          } catch (e2) {}
        }

        if (fileBlob) {
          const isNeedEdit = parseBool(latest.needEdit ?? latest.isNeedEdit);
          let newFileName = "";

          if (isNeedEdit) {
            newFileName = `${item.topicId} (แก้) ${item.topicName} ${item.dept}.pdf`;
          } else {
            newFileName = `${item.topicId} ${item.topicName} ${item.dept}.pdf`;
          }

          fileBlob.setName(newFileName);
          fetchedFiles.push(fileBlob);
        } else {
          failCount++;
        }
      }
    }
  });

  if (fetchedFiles.length === 0) {
    return {
      success: false,
      message:
        failCount > 0
          ? `พบไฟล์ ${failCount} รายการ แต่ไม่สามารถเข้าถึงไฟล์ได้`
          : "ไม่พบรายการที่มีไฟล์ Google Drive สำหรับดาวน์โหลด",
    };
  }

  // 2. หั่นไฟล์ออกเป็น Batch (เช่น Part ละ 8 ไฟล์ เพื่อความปลอดภัยไม่เกิน 50MB)
  const BATCH_SIZE = 8;
  const zipParts = [];
  const totalParts = Math.ceil(fetchedFiles.length / BATCH_SIZE);

  for (let i = 0; i < fetchedFiles.length; i += BATCH_SIZE) {
    const batchBlobs = fetchedFiles.slice(i, i + BATCH_SIZE);
    const partNum = Math.floor(i / BATCH_SIZE) + 1;

    const zipName =
      totalParts > 1
        ? `PEA_Files_${dateStr}_part${partNum}.zip`
        : `PEA_Files_${dateStr}.zip`;

    const zipBlob = Utilities.zip(batchBlobs, zipName);

    // บันทึกลง Drive ชั่วคราวเพื่อให้เบราว์เซอร์ Direct Download ได้ง่าย
    const createdFile = DriveApp.createFile(zipBlob);
    createdFile.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW,
    );

    zipParts.push({
      downloadUrl: `https://drive.google.com/uc?export=download&id=${createdFile.getId()}`,
      fileName: zipName,
    });
  }

  return {
    success: true,
    parts: zipParts,
    totalFiles: fetchedFiles.length,
  };
}

function testZipDownload() {
  const result = downloadFilesAsZip();
  if (result.success) {
    Logger.log("✅ สำเร็จ! สร้างไฟล์ ZIP ชื่อ: " + result.fileName);
    Logger.log("ขนาด Base64 String: " + result.base64.length + " ตัวอักษร");
  } else {
    Logger.log("❌ ไม่สำเร็จ: " + result.message);
  }
}
